const electron = require('electron');
const os = require('os');
// Module to control application life.
const {
  app,
  BrowserWindow,
  autoUpdater,
  dialog,
  Menu,
  ipcMain,
  shell,
} = electron;
const { appMenu, devMenu, editMenu } = require('./menu');
const path = require('path');
const url = require('url');
const config = require('./config');

const isDev = !app.isPackaged;

var handleStartupEvent = function () {
  if (process.platform !== 'win32') {
    return false;
  }
  const ChildProcess = require('child_process');

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = function (command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, { detached: true });
    } catch (error) {}

    return spawnedProcess;
  };

  const spawnUpdate = function (args) {
    return spawn(updateDotExe, args);
  };

  var squirrelCommand = process.argv[1];
  switch (squirrelCommand) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      //
      // - Install desktop and start menu shortcuts
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      spawnUpdate(['--createShortcut', exeName]);

      // Always quit when done
      app.quit();

      return true;
    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers
      spawnUpdate(['--removeShortcut', exeName]);
      // Always quit when done
      app.quit();

      return true;
    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated
      app.quit();
      return true;
  }
};

if (handleStartupEvent()) {
  return;
}

const platform = os.platform().startsWith('win')
  ? os.platform()
  : os.platform() + '_' + os.arch();
const updateUrl = `${config.apiUrl}/update/${platform}/${app.getVersion()}`;

console.log(app.getVersion());
console.log(`updateUrl`, updateUrl);

autoUpdater.setFeedURL({ url: updateUrl });

// Menu
const setApplicationMenu = () => {
  const menus = [appMenu, devMenu, editMenu];
  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

// We can communicate with our window (the renderer process) via messages.
const initIpc = () => {
  ipcMain.on('need-app-path', (event, arg) => {
    event.reply('app-path', app.getAppPath());
  });
  ipcMain.on('open-external-link', (event, href) => {
    shell.openExternal(href);
  });
};

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  // Create the browser window.
  initIpc();
  setApplicationMenu();

  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: { nodeIntegration: true },
    // fullscreen: false,
    // simpleFullscreen: true,
  });

  // and load the index.html of the app.
  const startUrl =
    process.env.ELECTRON_START_URL ||
    url.format({
      pathname: path.join(__dirname, '/../build/index_desktop.html'),
      protocol: 'file:',
      slashes: true,
    });
  mainWindow.loadURL(startUrl);

  // Open the DevTools.
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Handle reload app
  mainWindow.webContents.on('did-fail-load', async () => {
    mainWindow.loadURL(startUrl);
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  // Call this method to show app in maximize size (not fullscreen)
  mainWindow.maximize();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
  if (process.platform === 'darwin') {
    autoUpdater.checkForUpdates();
  }
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

if (!isDev) {
  // Update application
  setInterval(() => {
    autoUpdater.checkForUpdates();
    console.log('Updating');
  }, config.checkForUpdateInterval);

  autoUpdater.on('update-available', () => {
    const dialogOpts = {
      type: 'info',
      buttons: ['Close'],
      title: 'Info',
      message: 'Update available',
      detail: 'A new version is downloading from ' + autoUpdater.getFeedURL(),
    };

    dialog.showMessageBox(dialogOpts);
  });

  autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    console.log(`update-downloaded`);
    const dialogOpts = {
      type: 'info',
      buttons: ['Restart', 'Later'],
      title: 'Application Update',
      message: process.platform === 'win32' ? releaseNotes : releaseName,
      detail:
        'A new version has been downloaded. Restart the application to apply the updates.',
    };

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  autoUpdater.on('error', (error) => {
    console.error('There was a problem updating the application');
    console.error(error);
    const dialogOpts = {
      type: 'error',
      buttons: ['Close'],
      title: 'Update Error',
      message: error.name ? error.name : 'Cannot check for updates',
      detail: error.message
        ? error.message
        : error.stack
        ? error.stack
        : 'Please check your network connection or contact the administrator!',
    };
    dialog.showMessageBox(dialogOpts);
  });
}
