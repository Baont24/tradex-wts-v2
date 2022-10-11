# **Project Structure**

## Files

```
project
│  .eslintrc.js            --> ESlint config
│  tsconfig.json           --> Typescript config
│  package.json            --> Project config
│  ...
│
└── .cert
│  │  cert.pem             --> use in npm start:secure to run https
│  │  key.pem              --> use in npm start:secure to run https
│  │  mac-cert.p12         --> use for codesigning in Electron
│
└── app                    --> Electron output
│
└── build                  --> Webpack output
│
└── config                 --> Webpack config
│
└── electron               --> Electron main thread and config
│
└── public
│  │  index.html           --> main HTML for web
│  │  index_mobile.html    --> main HTML for mobile web
│  │  index_desktop.html   --> main HTML for Electron app
│  │  env.json             --> environment config file, VERY IMPORTANT
│  │  favicon.*            --> favicon for web and logo for Electron app
│  │  ...
│
└── scripts                --> scripts are used when npm run start/build/test
│
└── src
│  │  index.tsx            --> root file
│  │
│  └── assets              --> contains all the assets like: images, svg,...
│  │
│  └── components
│  │  │
│  │  └── areas            --> separate components for every screen
│  │  │
│  │  └── common           --> common components
│  │  │  │
│  │  │  └── Component
│  │  │  │  │  actions.ts  --> redux actions only use for this component
│  │  │  │  │  config.ts   --> config, constants only use for this component
│  │  │  │  │  index.tsx   --> main UI
│  │  │  │  │  reducers.ts --> redux reducers only use for this component
│  │  │  │  │  sagas.ts    --> redux saga only use for this component
│  │  │  │  │  styles.scss --> styling
│  │  │  │  │  ...
│  │  │  │
│  │  │  └── ...
│  │
│  └── config              --> environment config, combine with env.js
│  │
│  └── constants           --> define enums and constants
│  │
│  └── interfaces          --> define interfaces
│  │
│  └── redux
│  │  │  actions.ts        --> define action types
│  │  │  store.ts          --> redux's store root
│  │  │
│  │  └── global-actions   --> common actions
│  │  │
│  │  └── global-reducers  --> common reducers
│  │  │
│  │  └── sagas            --> common sagas
│  │
│  └── routers             --> router root
│  │
│  └── screens             --> website screens
│  │
│  └── styles              --> common style, define css and scss's variables
│  │
│  └── utils               --> utility functions
│  │
│  └── ...
│
```

## Project schemes

![Schemes](https://camo.githubusercontent.com/88993e43ee04ad203740ab1e04c952ec69fcec594e323202c107a2a1579bc454/68747470733a2f2f696d6167652e6962622e636f2f685043316a4a2f536368656d615f4e6772782e706e67)

# **WTS**

## Development

1. Setup [nvm](https://github.com/nvm-sh/nvm) and run `nvm use`
2. Run `npm install`
3. Create `env.js` and copy to folder `public`
4. Run `npm start`

## Production

- Run `npm run build`

## Overrided

1. `public/env.js`
2. `public/injectable/spinner.svg`
3. `public/injectable/logo.svg`
4. `public/favicon.*`

# **Electron**

## Requirements

- **Auto Update**: To run [autoUpdater](https://www.electron.build/code-signing.html) in production level (`autoUpdater` doesn't run in development), need a codesign [certificate](https://support.apple.com/en-vn/guide/keychain-access/kyca8916/mac) to sign to the app, [create](https://support.apple.com/en-vn/guide/keychain-access/kyca8916/mac) a certificate, move it and name it to `.cert/mac-cert.p12`. The name `mac-cert.p12` is a default name, change this name which mean have to change [CSC_LINK](https://www.electron.build/code-signing.html) variable on build command to match the file directory.
- [CodeSigning](https://www.electron.build/code-signing.html) default file:
  - **CSC_LINK**: `.cert/mac-cert.p12`
  - **CSC_KEY_PASSWORD**: `12345`
- App version is `package.json`'s version, `autoUpdater` will receive new version based on App version
- Override these [files](#overrided)

## Config

- Main thread: `package.json/main` (default to `electron/main.js`)
- App name: `package.json/build/productName`
- Icon: `package.json/build/{platform}/icon`
- Auto Update URL (Electron Release Server URL): `electron/config.js`
- [More detail](https://www.electron.build/configuration/configuration)

## Development

### CodeSigning for development (MacOS)

- Run `codesign --deep --force --verbose --sign - node_modules/electron/dist/Electron.app` on project directory

### Run Electron on localhost

1. Run `npm start`
2. Open another terminal run `npm run electron:serve`

### Run Electron on `build`

- Run `npm run build && npm run electron`

## Production

1. Run `npm run build`
2. Build on multiple platform:
   1. Current platform: `npm run electron:build`
   2. All platform: `npm run electron:build-all` (better run on MacOS for code sign MacOS's app)
   3. Specific platform:
      1. Windows: `npm run electron:build-win`
      2. MacOS: `npm run electron:build-mac`
      3. Linux: `npm run electron:build-linux`
3. Production app is in the `app` folder:
   1. Windows: `.exe` for install and `.exe.blockmap` for update
   2. MacOS: `.dmg` for install and `.zip` for update
   3. Linux: `.AppImage` (autoUpdater doesn't support linux)
