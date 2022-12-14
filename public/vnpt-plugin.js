functionId = {
  GetCertInfo: 0,
  SignXML: 1,
  SignPDF: 2,
  SignOFFICE: 3,
  SignCMS: 4,
  chooseFile: 5,
  setLicenseKey: 6,
  checkPlugin: 7,
  signArrData: 8,
  signHash: 9,
  signArrDataAdvanced: 10,
  getVersion: 11,
  SignPDFMultiplePages: 12,
  checkPluginAdvanced: 13,
  ValidateCertificate: 14,
  ValidateCertificateBase64: 15,
  CheckValidTime: 16,
  CheckValidTimeBase64: 17,
  CheckOCSP: 18,
  CheckOCSPBase64: 19,
  ShowCertificateViewer: 20,
  CheckCRL: 21,
  CheckCRLBase64: 22,
  SetLanguage: 23,
  Scan: 24,
  OpenDocument: 25,
  BatchScan: 26,
  HandleFile: 27,
  DeleteFile: 28,
  SetIgnoreListFiles: 29,
  GetAllFiles: 30,
  GetFilePreview: 31,
  UploadFile: 32,
  GetDataScanned: 33,
  CheckToken: 34,
  SetGetCertFromUsbToken: 35,
  SetGetCertByPkcs11: 36,
  SetShowCertListDialog: 37,
  ConvertOfficeToPdf: 38,
  GetComputerInfo: 39,
  ClearPinCache: 40,
};
var ports = [4433, 4434, 4435, 9201, 9202],
  currentID = 0,
  webSocket,
  vnptCheckPluginCallback,
  pluginSignal,
  returnPluginSignal = 'SignalReturn:',
  timeOut = 3e3,
  checkPluginCall = -1,
  pluginStatus = 0,
  checkPluginRejectCallback,
  iePlugin;
function functionName(t) {
  var n = t.toString();
  return (n = (n = n.substr('function '.length)).substr(0, n.indexOf('(')));
}
function getLastError(t) {
  console.log(t);
}
function get_browser() {
  var t,
    n = navigator.userAgent,
    e = n.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  return /trident/i.test(e[1])
    ? { name: 'IE', version: (t = /\brv[ :]+(\d+)/g.exec(n) || [])[1] || '' }
    : 'Chrome' === e[1] && null != (t = n.match(/\b(OPR|Edge)\/(\d+)/))
    ? { name: t.slice(1)[0].replace('OPR', 'Opera'), version: t.slice(1)[1] }
    : ((e = e[2] ? [e[1], e[2]] : [navigator.appName, navigator.appVersion, '-?']),
      null != (t = n.match(/version\/(\d+)/i)) && e.splice(1, 1, t[1]),
      { name: e[0], version: e[1] });
}
function get_browser_old() {
  var t,
    n = navigator.userAgent,
    e = n.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  return /trident/i.test(e[1])
    ? { name: 'IE', version: (t = /\brv[ :]+(\d+)/g.exec(n) || [])[1] || '' }
    : 'Chrome' === e[1] && null != (t = n.match(/\bOPR|Edge\/(\d+)/))
    ? { name: 'Opera', version: t[1] }
    : ((e = e[2] ? [e[1], e[2]] : [navigator.appName, navigator.appVersion, '-?']),
      null != (t = n.match(/version\/(\d+)/i)) && e.splice(1, 1, t[1]),
      { name: e[0], version: e[1] });
}
function getOsName() {
  var t = 'Unknown';
  return (
    -1 != window.navigator.userAgent.indexOf('Windows NT 10.0') && (t = 'Windows 10'),
    -1 != window.navigator.userAgent.indexOf('Windows NT 6.2') && (t = 'Windows 8'),
    -1 != window.navigator.userAgent.indexOf('Windows NT 6.1') && (t = 'Windows 7'),
    -1 != window.navigator.userAgent.indexOf('Windows NT 6.0') && (t = 'Windows Vista'),
    -1 != window.navigator.userAgent.indexOf('Windows NT 5.1') && (t = 'Windows XP'),
    -1 != window.navigator.userAgent.indexOf('Windows NT 5.0') && (t = 'Windows 2000'),
    -1 != window.navigator.userAgent.indexOf('Mac') && (t = 'MAC'),
    -1 != window.navigator.userAgent.indexOf('X11') && (t = 'UNIX'),
    -1 != window.navigator.userAgent.indexOf('Linux') && (t = 'Linux'),
    t
  );
}
function VnptInternetExplorerCallback(t) {
  var n = t.split('*');
  if (
    (1 === checkPluginCall && ((checkPluginCall = -1), '1' === n[0] && (timeOut = 5e3)),
    -1 !== n[0].indexOf(returnPluginSignal))
  ) {
    var e = n[0].substr(returnPluginSignal.length, n[0].length - returnPluginSignal.length);
    doVerify(pluginSignal, e) ? window[n[1]]('1') : window[n[1]]('-1');
  } else window[n[1]](n[0]);
}
var init = 0,
  vnpt_plugin = {
    connect: function(t, e) {
      if ('IE' !== get_browser().name && 'MSIE' !== get_browser().name)
        return new Promise(function(r, n) {
          0 == currentID && (checkPluginRejectCallback = r),
            null == webSocket || 1 != pluginStatus
              ? ((webSocket = new WebSocket('wss://localhost:' + t + '/plugin')),
                (timer = setTimeout(function() {
                  var t = webSocket;
                  (webSocket = null), t.close(), currentID++, vnpt_plugin.tryConnect(e, r, n);
                }, timeOut)))
              : webSocket.send(e),
            (webSocket.onopen = function() {
              (pluginStatus = 1), clearTimeout(timer), webSocket.send(e);
            }),
            (webSocket.onclose = function() {
              pluginStatus = 0;
            }),
            (webSocket.onmessage = function(t) {
              var n = t.data.split('*');
              if (
                (1 === checkPluginCall && ((checkPluginCall = -1), '1' === n[0] && (timeOut = 5e3)),
                'callbackDefault' === n[1])
              )
                if (-1 !== n[0].indexOf(returnPluginSignal)) {
                  var e = n[0].substr(returnPluginSignal.length, n[0].length - returnPluginSignal.length),
                    i = doVerify(pluginSignal, e);
                  r(i ? '1' : '-1');
                } else r(n[0]);
              else if (-1 !== n[0].indexOf(returnPluginSignal)) {
                e = n[0].substr(returnPluginSignal.length, n[0].length - returnPluginSignal.length);
                (i = doVerify(pluginSignal, e)) ? window[n[1]]('1') : window[n[1]]('-1');
              } else window[n[1]](n[0]);
            }),
            (webSocket.onerror = function() {
              (pluginStatus = 0),
                2 === currentID && (null == vnptCheckPluginCallback ? n('-1') : vnptCheckPluginCallback('-1'));
            });
        });
      if (-1 !== navigator.userAgent.indexOf('Windows NT 10.0'))
        null == webSocket || 1 != pluginStatus
          ? ((webSocket = new WebSocket('wss://localhost:' + t + '/plugin')),
            (timer = setTimeout(function() {
              var t = webSocket;
              (webSocket = null), t.close(), currentID++, vnpt_plugin.tryConnect();
            }, timeOut)))
          : webSocket.send(e),
          (webSocket.onopen = function() {
            (pluginStatus = 1), clearTimeout(timer), webSocket.send(e);
          }),
          (webSocket.onclose = function() {
            pluginStatus = 0;
          }),
          (webSocket.onmessage = function(t) {
            var n = t.data.split('*');
            if (
              (1 === checkPluginCall && ((checkPluginCall = -1), '1' === n[0] && (timeOut = 5e3)),
              -1 !== n[0].indexOf(returnPluginSignal))
            ) {
              var e = n[0].substr(returnPluginSignal.length, n[0].length - returnPluginSignal.length);
              doVerify(pluginSignal, e) ? window[n[1]]('1') : window[n[1]]('-1');
            } else window[n[1]](n[0]);
          }),
          (webSocket.onerror = function() {
            pluginStatus = 0;
          });
      else
        try {
          ((iePlugin = new ActiveXObject(
            'InternetExplorerModule.Main'
          )).PluginEvents().ScriptCallbackObject = VnptInternetExplorerCallback),
            iePlugin.Execute(e);
        } catch (t) {
          var n = JSON.parse(e);
          7 === n.functionID && window[n.funcCallback]('-1');
        }
    },
    tryConnect: function(t, n, e) {
      currentID < 3
        ? 'IE' === get_browser().name || 'MSIE' === get_browser().name
          ? this.connect(ports[currentID], t)
          : this.connect(ports[currentID], t).then(function(t) {
              n(t);
            })
        : ((currentID = 0),
          'IE' === get_browser().name || 'MSIE' === get_browser().name
            ? vnptCheckPluginCallback('-1')
            : checkPluginRejectCallback('-1'));
    },
    sendMessageToPlugin: function(t) {
      (t.domain = window.location.hostname), '' === t.domain && (t.domain = window.location.href);
      var n = '';
      return (n += JSON.stringify(t)), this.connect(ports[currentID], n);
    },
    signXML: function(t, n, e) {
      var i = {};
      if (
        ((i.functionID = functionId.SignXML),
        null != n
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (i.funcCallback = n.toString().match(/^function\s*([^\s(]+)/)[1])
            : (i.funcCallback = n.name)
          : (i.funcCallback = 'callbackDefault'),
        null == e)
      ) {
        var r = [t];
        i.args = r;
      } else {
        r = [t, JSON.stringify(e)];
        i.args = r;
      }
      return this.sendMessageToPlugin(i);
    },
    signOffice: function(t, n) {
      var e = {};
      (e.functionID = functionId.SignOFFICE),
        null != n
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (e.funcCallback = n.toString().match(/^function\s*([^\s(]+)/)[1])
            : (e.funcCallback = n.name)
          : (e.funcCallback = 'callbackDefault');
      var i = [t];
      return (e.args = i), this.sendMessageToPlugin(e);
    },
    signPdf: function(t, n, e) {
      var i = {};
      if (
        ((i.functionID = functionId.SignPDF),
        null != n
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (i.funcCallback = n.toString().match(/^function\s*([^\s(]+)/)[1])
            : (i.funcCallback = n.name)
          : (i.funcCallback = 'callbackDefault'),
        null == e)
      ) {
        var r = [t];
        i.args = r;
      } else {
        r = [t, JSON.stringify(e)];
        i.args = r;
      }
      return this.sendMessageToPlugin(i);
    },
    SignPDFMultiplePages: function(t, n, e) {
      var i = {};
      if (
        ((i.functionID = functionId.SignPDFMultiplePages),
        null != n
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (i.funcCallback = n.toString().match(/^function\s*([^\s(]+)/)[1])
            : (i.funcCallback = n.name)
          : (i.funcCallback = 'callbackDefault'),
        null != e)
      ) {
        var r = [t, JSON.stringify(e)];
        return (i.args = r), this.sendMessageToPlugin(i);
      }
      consle.log('Pdf signature options not found!');
    },
    signCms: function(t, n) {
      var e = {};
      (e.functionID = functionId.SignCMS),
        null != n
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (e.funcCallback = n.toString().match(/^function\s*([^\s(]+)/)[1])
            : (e.funcCallback = n.name)
          : (e.funcCallback = 'callbackDefault');
      var i = [t];
      return (e.args = i), this.sendMessageToPlugin(e);
    },
    signHash: function(t, n) {
      var e = {};
      (e.functionID = functionId.signHash),
        null != n
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (e.funcCallback = n.toString().match(/^function\s*([^\s(]+)/)[1])
            : (e.funcCallback = n.name)
          : (e.funcCallback = 'callbackDefault');
      var i = [t];
      return (e.args = i), this.sendMessageToPlugin(e);
    },
    signArrDataAdvanced: function(t, n, e, i, r) {
      var o = {},
        a = '0';
      null != e && e && (a = '1');
      var s = '1';
      null == r || r || (s = '0');
      var u = JSON.stringify(t);
      (o.functionID = functionId.signArrDataAdvanced),
        null != i
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (o.funcCallback = i.toString().match(/^function\s*([^\s(]+)/)[1])
            : (o.funcCallback = i.name)
          : (o.funcCallback = 'callbackDefault');
      var c = [u, n, a, s];
      return (o.args = c), this.sendMessageToPlugin(o);
    },
    signArrData: function(t, n, e, i, r, o) {
      var a = {},
        s = '0';
      null != r && r && (s = '1');
      var u = JSON.stringify(t);
      if (
        ((a.functionID = functionId.signArrData),
        null != o
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (a.funcCallback = o.toString().match(/^function\s*([^\s(]+)/)[1])
            : (a.funcCallback = o.name)
          : (a.funcCallback = 'callbackDefault'),
        null == e)
      ) {
        var c = [u, n, i, s];
        a.args = c;
      } else {
        c = [u, n, i, s, JSON.stringify(e)];
        a.args = c;
      }
      return this.sendMessageToPlugin(a);
    },
    getCertInfo: function(t, n) {
      var e = {};
      (e.functionID = functionId.GetCertInfo),
        null != t
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (e.funcCallback = t.toString().match(/^function\s*([^\s(]+)/)[1])
            : (e.funcCallback = t.name)
          : (e.funcCallback = 'callbackDefault');
      var i = '0';
      null != n && n && (i = '1');
      var r = [i];
      return (e.args = r), this.sendMessageToPlugin(e);
    },
    chooseFile: function(t) {
      var n = {};
      (n.functionID = functionId.chooseFile),
        null != t
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (n.funcCallback = t.toString().match(/^function\s*([^\s(]+)/)[1])
            : (n.funcCallback = t.name)
          : (n.funcCallback = 'callbackDefault');
      return (n.args = ['']), this.sendMessageToPlugin(n);
    },
    setLicenseKey: function(t, n) {
      var e = {};
      (e.functionID = functionId.setLicenseKey),
        null != n
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (e.funcCallback = n.toString().match(/^function\s*([^\s(]+)/)[1])
            : (e.funcCallback = n.name)
          : (e.funcCallback = 'callbackDefault');
      var i = [t];
      return (e.args = i), this.sendMessageToPlugin(e);
    },
    setLanguage: function(t, n) {
      var e = {};
      (e.functionID = functionId.SetLanguage),
        null != n
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (e.funcCallback = n.toString().match(/^function\s*([^\s(]+)/)[1])
            : (e.funcCallback = n.name)
          : (e.funcCallback = 'callbackDefault');
      var i = [t];
      return (e.args = i), this.sendMessageToPlugin(e);
    },
    SetGetCertFromUsbToken: function(t, n) {
      var e = {};
      (e.functionID = functionId.SetGetCertFromUsbToken),
        null != n
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (e.funcCallback = n.toString().match(/^function\s*([^\s(]+)/)[1])
            : (e.funcCallback = n.name)
          : (e.funcCallback = 'callbackDefault');
      var i = '1';
      null == t || t || (i = '0');
      var r = [i];
      return (e.args = r), this.sendMessageToPlugin(e);
    },
    SetGetCertByPkcs11: function(t, n) {
      var e = {};
      (e.functionID = functionId.SetGetCertByPkcs11),
        null != n
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (e.funcCallback = n.toString().match(/^function\s*([^\s(]+)/)[1])
            : (e.funcCallback = n.name)
          : (e.funcCallback = 'callbackDefault');
      var i = '1';
      null == t || t || (i = '0');
      var r = [i];
      return (e.args = r), this.sendMessageToPlugin(e);
    },
    SetShowCertListDialog: function(t, n) {
      var e = {};
      (e.functionID = functionId.SetShowCertListDialog),
        null != n
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (e.funcCallback = n.toString().match(/^function\s*([^\s(]+)/)[1])
            : (e.funcCallback = n.name)
          : (e.funcCallback = 'callbackDefault');
      var i = '1';
      null == t || t || (i = '0');
      var r = [i];
      return (e.args = r), this.sendMessageToPlugin(e);
    },
    ValidateCertificate: function(t, n, e, i) {
      var r = {};
      (r.functionID = functionId.ValidateCertificate),
        null != i
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (r.funcCallback = i.toString().match(/^function\s*([^\s(]+)/)[1])
            : (r.funcCallback = i.name)
          : (r.funcCallback = 'callbackDefault');
      var o = [t, n, e];
      return (r.args = o), this.sendMessageToPlugin(r);
    },
    ValidateCertificateBase64: function(t, n, e, i) {
      var r = {};
      (r.functionID = functionId.ValidateCertificateBase64),
        null != i
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (r.funcCallback = i.toString().match(/^function\s*([^\s(]+)/)[1])
            : (r.funcCallback = i.name)
          : (r.funcCallback = 'callbackDefault');
      var o = [t, n, e];
      return (r.args = o), this.sendMessageToPlugin(r);
    },
    CheckValidTime: function(t, n, e) {
      var i = {};
      (i.functionID = functionId.CheckValidTime),
        null != e
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (i.funcCallback = e.toString().match(/^function\s*([^\s(]+)/)[1])
            : (i.funcCallback = e.name)
          : (i.funcCallback = 'callbackDefault');
      var r = [t, n];
      return (i.args = r), this.sendMessageToPlugin(i);
    },
    CheckValidTimeBase64: function(t, n, e) {
      var i = {};
      (i.functionID = functionId.CheckValidTimeBase64),
        null != e
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (i.funcCallback = e.toString().match(/^function\s*([^\s(]+)/)[1])
            : (i.funcCallback = e.name)
          : (i.funcCallback = 'callbackDefault');
      var r = [t, n];
      return (i.args = r), this.sendMessageToPlugin(i);
    },
    ShowCertificateViewer: function(t, n) {
      var e = {};
      (e.functionID = functionId.ShowCertificateViewer),
        null != n
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (e.funcCallback = n.toString().match(/^function\s*([^\s(]+)/)[1])
            : (e.funcCallback = n.name)
          : (e.funcCallback = 'callbackDefault');
      var i = [t];
      return (e.args = i), this.sendMessageToPlugin(e);
    },
    CheckOCSP: function(t, n, e, i) {
      var r = {};
      (r.functionID = functionId.CheckOCSP),
        null != i
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (r.funcCallback = i.toString().match(/^function\s*([^\s(]+)/)[1])
            : (r.funcCallback = i.name)
          : (r.funcCallback = 'callbackDefault');
      var o = [t, n, e];
      return (r.args = o), this.sendMessageToPlugin(r);
    },
    CheckOCSPBase64: function(t, n, e, i) {
      var r = {};
      (r.functionID = functionId.CheckOCSPBase64),
        null != i
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (r.funcCallback = i.toString().match(/^function\s*([^\s(]+)/)[1])
            : (r.funcCallback = i.name)
          : (r.funcCallback = 'callbackDefault');
      var o = [t, n, e];
      return (r.args = o), this.sendMessageToPlugin(r);
    },
    CheckCRL: function(t, n, e, i, r) {
      var o = {};
      (o.functionID = functionId.CheckCRL),
        null != r
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (o.funcCallback = r.toString().match(/^function\s*([^\s(]+)/)[1])
            : (o.funcCallback = r.name)
          : (o.funcCallback = 'callbackDefault');
      var a = [t, n, e, i];
      return (o.args = a), this.sendMessageToPlugin(o);
    },
    CheckCRLBase64: function(t, n, e, i, r) {
      var o = {};
      (o.functionID = functionId.CheckCRLBase64),
        null != r
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (o.funcCallback = r.toString().match(/^function\s*([^\s(]+)/)[1])
            : (o.funcCallback = r.name)
          : (o.funcCallback = 'callbackDefault');
      var a = [t, n, e, i];
      return (o.args = a), this.sendMessageToPlugin(o);
    },
    CheckToken: function(t) {
      var n = {};
      (n.functionID = functionId.CheckToken),
        null != t
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (n.funcCallback = t.toString().match(/^function\s*([^\s(]+)/)[1])
            : (n.funcCallback = t.name)
          : (n.funcCallback = 'callbackDefault');
      return (n.args = ['']), this.sendMessageToPlugin(n);
    },
    checkPlugin: function(t) {
      (vnptCheckPluginCallback = t), (checkPluginCall = 1), (timeOut = 3e3);
      var n = {};
      (n.functionID = functionId.checkPlugin),
        null != t
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (n.funcCallback = t.toString().match(/^function\s*([^\s(]+)/)[1])
            : (n.funcCallback = t.name)
          : (n.funcCallback = 'callbackDefault');
      return (n.args = ['']), this.sendMessageToPlugin(n);
    },
    checkPluginAdvanced: function(t) {
      vnptCheckPluginCallback = t;
      var n = {};
      (n.functionID = functionId.checkPluginAdvanced),
        null != t
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (n.funcCallback = t.toString().match(/^function\s*([^\s(]+)/)[1])
            : (n.funcCallback = t.name)
          : (n.funcCallback = 'callbackDefault');
      var e = [(pluginSignal = GenerateSignal())];
      return (n.args = e), this.sendMessageToPlugin(n);
    },
    getVersion: function(t) {
      vnptCheckPluginCallback = t;
      var n = {};
      (n.functionID = functionId.getVersion),
        null != t
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (n.funcCallback = t.toString().match(/^function\s*([^\s(]+)/)[1])
            : (n.funcCallback = t.name)
          : (n.funcCallback = 'callbackDefault');
      return (n.args = ['']), this.sendMessageToPlugin(n);
    },
    Scan: function(t, n) {
      vnptCheckPluginCallback = n;
      var e = {};
      (e.functionID = functionId.Scan),
        null != n
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (e.funcCallback = n.toString().match(/^function\s*([^\s(]+)/)[1])
            : (e.funcCallback = n.name)
          : (e.funcCallback = 'callbackDefault');
      var i = 0;
      null != t && null != t && t && (i = 1);
      var r = [i];
      return (e.args = r), this.sendMessageToPlugin(e);
    },
    GetDataScanned: function(t, n) {
      vnptCheckPluginCallback = n;
      var e = {};
      (e.functionID = functionId.GetDataScanned),
        null != n
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (e.funcCallback = n.toString().match(/^function\s*([^\s(]+)/)[1])
            : (e.funcCallback = n.name)
          : (e.funcCallback = 'callbackDefault');
      var i = [t];
      return (e.args = i), this.sendMessageToPlugin(e);
    },
    OpenDocument: function(t, n, e, i, r) {
      vnptCheckPluginCallback = r;
      var o = {};
      (o.functionID = functionId.OpenDocument),
        null != r
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (o.funcCallback = r.toString().match(/^function\s*([^\s(]+)/)[1])
            : (o.funcCallback = r.name)
          : (o.funcCallback = 'callbackDefault');
      var a = [t, n, e, i];
      return (o.args = a), this.sendMessageToPlugin(o);
    },
    ConvertOfficeToPdf: function(t, n, e) {
      vnptCheckPluginCallback = e;
      var i = {};
      (i.functionID = functionId.ConvertOfficeToPdf),
        null != e
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (i.funcCallback = e.toString().match(/^function\s*([^\s(]+)/)[1])
            : (i.funcCallback = e.name)
          : (i.funcCallback = 'callbackDefault');
      var r = [t, n];
      return (i.args = r), this.sendMessageToPlugin(i);
    },
    BatchScan: function(t, n) {
      vnptCheckPluginCallback = n;
      var e = {};
      (e.functionID = functionId.BatchScan),
        null != n
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (e.funcCallback = n.toString().match(/^function\s*([^\s(]+)/)[1])
            : (e.funcCallback = n.name)
          : (e.funcCallback = 'callbackDefault');
      var i = new Scanner();
      i.options = t;
      var r = [JSON.stringify(i)];
      return (e.args = r), this.sendMessageToPlugin(e);
    },
    HandleFile: function(t) {
      vnptCheckPluginCallback = t;
      var n = {};
      (n.functionID = functionId.HandleFile),
        null != t
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (n.funcCallback = t.toString().match(/^function\s*([^\s(]+)/)[1])
            : (n.funcCallback = t.name)
          : (n.funcCallback = 'callbackDefault');
      return (n.args = ['']), this.sendMessageToPlugin(n);
    },
    DeleteFile: function(t, n) {
      vnptCheckPluginCallback = n;
      var e = {};
      (e.functionID = functionId.DeleteFile),
        null != n
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (e.funcCallback = n.toString().match(/^function\s*([^\s(]+)/)[1])
            : (e.funcCallback = n.name)
          : (e.funcCallback = 'callbackDefault');
      var i = [t];
      return (e.args = i), this.sendMessageToPlugin(e);
    },
    SetIgnoreListFiles: function(t, n) {
      vnptCheckPluginCallback = n;
      var e = {};
      (e.functionID = functionId.SetIgnoreListFiles),
        null != n
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (e.funcCallback = n.toString().match(/^function\s*([^\s(]+)/)[1])
            : (e.funcCallback = n.name)
          : (e.funcCallback = 'callbackDefault');
      var i = [t];
      return (e.args = i), this.sendMessageToPlugin(e);
    },
    GetAllFiles: function(t, n) {
      vnptCheckPluginCallback = n;
      var e = {};
      (e.functionID = functionId.GetAllFiles),
        null != n
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (e.funcCallback = n.toString().match(/^function\s*([^\s(]+)/)[1])
            : (e.funcCallback = n.name)
          : (e.funcCallback = 'callbackDefault');
      var i = [t];
      return (e.args = i), this.sendMessageToPlugin(e);
    },
    GetFilePreview: function(t, n, e, i) {
      vnptCheckPluginCallback = i;
      var r = {};
      (r.functionID = functionId.GetFilePreview),
        null != i
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (r.funcCallback = i.toString().match(/^function\s*([^\s(]+)/)[1])
            : (r.funcCallback = i.name)
          : (r.funcCallback = 'callbackDefault');
      var o = [t, n, e];
      return (r.args = o), this.sendMessageToPlugin(r);
    },
    UploadFile: function(t, n, e, i) {
      vnptCheckPluginCallback = i;
      var r = {};
      (r.functionID = functionId.UploadFile),
        null != i
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (r.funcCallback = i.toString().match(/^function\s*([^\s(]+)/)[1])
            : (r.funcCallback = i.name)
          : (r.funcCallback = 'callbackDefault');
      var o = new Scanner(),
        a = getCookie[t];
      (o.cookie = a), (o.options = e), (o.uplink = t), (o.path = n);
      var s = [JSON.stringify(o)];
      return (r.args = s), this.sendMessageToPlugin(r);
    },
    checkBrowser: function() {
      var t = get_browser();
      switch (t.name.toLowerCase()) {
        case 'chrome':
          if (52 < t.version) return !0;
        case 'firefox':
          if (49 < t.version) return !0;
        case 'opera':
          if (26 < t.version) return !0;
        case 'edge':
          if (15 < t.version) return !0;
        case 'ie':
          if (6 < t.version) return !0;
        case 'msie':
          if (6 < t.version) return !0;
        case 'safari':
          if (10 < t.version) return !0;
        default:
          return console.log('Browser not supported yet'), !1;
      }
    },
    checkBrowserSupportWS: function() {
      var t = get_browser();
      switch (t.name.toLowerCase()) {
        case 'chrome':
          if (52 < t.version) return !0;
        case 'firefox':
          if (49 < t.version) return !0;
        case 'opera':
          if (26 < t.version) return !0;
        case 'edge':
          if (15 < t.version) return !0;
        case 'ie':
        case 'msie':
          return !1;
        case 'safari':
          if (10 < t.version) return !0;
        default:
          return console.log('Browser not supported yet'), !1;
      }
    },
    getOsName: function() {
      return getOsName();
    },
    GetComputerInfo: function(t) {
      vnptCheckPluginCallback = t;
      var n = {};
      (n.functionID = functionId.GetComputerInfo),
        null != t
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (n.funcCallback = t.toString().match(/^function\s*([^\s(]+)/)[1])
            : (n.funcCallback = t.name)
          : (n.funcCallback = 'callbackDefault');
      return (n.args = ['']), this.sendMessageToPlugin(n);
    },
    ClearPinCache: function(t, n) {
      var e = {};
      (e.functionID = functionId.ClearPinCache),
        null != n
          ? -1 != navigator.userAgent.indexOf('MSIE') || 1 == !!document.documentMode
            ? (e.funcCallback = n.toString().match(/^function\s*([^\s(]+)/)[1])
            : (e.funcCallback = n.name)
          : (e.funcCallback = 'callbackDefault');
      var i = [t];
      return (e.args = i), this.sendMessageToPlugin(e);
    },
  },
  dbits;
function getCookie(t) {
  var n = {};
  if (document.cookie && '' != document.cookie)
    for (var e = document.cookie.split(';'), i = 0; i < e.length; i++) {
      var r = e[i].split('=');
      (r[0] = r[0].replace(/^ /, '')), (n[decodeURIComponent(r[0])] = decodeURIComponent(r[1]));
    }
  return n[t];
}
function setCookie(t, n, e) {
  var i = '';
  if (e) {
    var r = new Date();
    r.setTime(r.getTime() + 24 * e * 60 * 60 * 1e3), (i = '; expires=' + r.toUTCString());
  }
  document.cookie = t + '=' + (n || '') + i + '; path=/';
}
function Scanner() {
  (this.cookie = null), (this.options = null), (this.uplink = null), (this.downlink = null), (this.path = null);
}
function PdfSigner() {
  (this.page = 1),
    (this.llx = 0),
    (this.lly = 0),
    (this.urx = 150),
    (this.ury = 75),
    (this.SigTextSize = 9),
    (this.Signer = null),
    (this.SignerPosition = null),
    (this.SigningTime = null),
    (this.Description = null),
    (this.ImageBase64 = null),
    (this.OnlyDescription = !1),
    (this.ValidationOption = !0),
    (this.SigColorRGB = null),
    (this.SetImageBackground = !1),
    (this.PagesArray = null),
    (this.CertificateSerial = null),
    (this.TsaUrl = null),
    (this.TsaUsername = null),
    (this.TsaPassword = null),
    (this.AdvancedCustom = !1),
    (this.SigType = 0),
    (this.IsEncyptFile = !1),
    (this.EncryptPassword = null),
    (this.SigVisible = !0),
    (this.SigSignerVisible = !0),
    (this.SigEmailVisible = !0),
    (this.SigPositionVisible = !1),
    (this.SigSigningTimeVisible = !0);
}
function XmlSigner() {
  (this.TagSigning = null),
    (this.NodeToSign = null),
    (this.TagSaveResult = null),
    (this.NameXPathFilter = null),
    (this.NameIDTimeSignature = null),
    (this.DsSignature = !1),
    (this.SigningType = 'Enveloped'),
    (this.SigningTime = null),
    (this.CertificateSerial = null),
    (this.ValidateBefore = !1),
    (this.DigestMethod = 'SHA1'),
    (this.SignatureMethod = 'RSAwithSHA1');
}
function GenerateSignal() {
  for (var t = '', n = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', e = 0; e < 5; e++)
    t += n.charAt(Math.floor(Math.random() * n.length));
  return t;
}
var canary = 0xdeadbeefcafe,
  j_lm = 15715070 == (16777215 & canary);
function BigInteger(t, n, e) {
  null != t &&
    ('number' == typeof t
      ? this.fromNumber(t, n, e)
      : null == n && 'string' != typeof t
      ? this.fromString(t, 256)
      : this.fromString(t, n));
}
function nbi() {
  return new BigInteger(null);
}
function am1(t, n, e, i, r, o) {
  for (; 0 <= --o; ) {
    var a = n * this[t++] + e[i] + r;
    (r = Math.floor(a / 67108864)), (e[i++] = 67108863 & a);
  }
  return r;
}
function am2(t, n, e, i, r, o) {
  for (var a = 32767 & n, s = n >> 15; 0 <= --o; ) {
    var u = 32767 & this[t],
      c = this[t++] >> 15,
      l = s * u + c * a;
    (r = ((u = a * u + ((32767 & l) << 15) + e[i] + (1073741823 & r)) >>> 30) + (l >>> 15) + s * c + (r >>> 30)),
      (e[i++] = 1073741823 & u);
  }
  return r;
}
function am3(t, n, e, i, r, o) {
  for (var a = 16383 & n, s = n >> 14; 0 <= --o; ) {
    var u = 16383 & this[t],
      c = this[t++] >> 14,
      l = s * u + c * a;
    (r = ((u = a * u + ((16383 & l) << 14) + e[i] + r) >> 28) + (l >> 14) + s * c), (e[i++] = 268435455 & u);
  }
  return r;
}
j_lm && 'Microsoft Internet Explorer' == navigator.appName
  ? ((BigInteger.prototype.am = am2), (dbits = 30))
  : j_lm && 'Netscape' != navigator.appName
  ? ((BigInteger.prototype.am = am1), (dbits = 26))
  : ((BigInteger.prototype.am = am3), (dbits = 28)),
  (BigInteger.prototype.DB = dbits),
  (BigInteger.prototype.DM = (1 << dbits) - 1),
  (BigInteger.prototype.DV = 1 << dbits);
var BI_FP = 52;
(BigInteger.prototype.FV = Math.pow(2, BI_FP)),
  (BigInteger.prototype.F1 = BI_FP - dbits),
  (BigInteger.prototype.F2 = 2 * dbits - BI_FP);
var BI_RM = '0123456789abcdefghijklmnopqrstuvwxyz',
  BI_RC = new Array(),
  rr,
  vv;
for (rr = '0'.charCodeAt(0), vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
for (rr = 'a'.charCodeAt(0), vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
for (rr = 'A'.charCodeAt(0), vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
function int2char(t) {
  return BI_RM.charAt(t);
}
function intAt(t, n) {
  var e = BI_RC[t.charCodeAt(n)];
  return null == e ? -1 : e;
}
function bnpCopyTo(t) {
  for (var n = this.t - 1; 0 <= n; --n) t[n] = this[n];
  (t.t = this.t), (t.s = this.s);
}
function bnpFromInt(t) {
  (this.t = 1), (this.s = t < 0 ? -1 : 0), 0 < t ? (this[0] = t) : t < -1 ? (this[0] = t + DV) : (this.t = 0);
}
function nbv(t) {
  var n = nbi();
  return n.fromInt(t), n;
}
function bnpFromString(t, n) {
  var e;
  if (16 == n) e = 4;
  else if (8 == n) e = 3;
  else if (256 == n) e = 8;
  else if (2 == n) e = 1;
  else if (32 == n) e = 5;
  else {
    if (4 != n) return void this.fromRadix(t, n);
    e = 2;
  }
  (this.t = 0), (this.s = 0);
  for (var i = t.length, r = !1, o = 0; 0 <= --i; ) {
    var a = 8 == e ? 255 & t[i] : intAt(t, i);
    a < 0
      ? '-' == t.charAt(i) && (r = !0)
      : ((r = !1),
        0 == o
          ? (this[this.t++] = a)
          : o + e > this.DB
          ? ((this[this.t - 1] |= (a & ((1 << (this.DB - o)) - 1)) << o), (this[this.t++] = a >> (this.DB - o)))
          : (this[this.t - 1] |= a << o),
        (o += e) >= this.DB && (o -= this.DB));
  }
  8 == e && 0 != (128 & t[0]) && ((this.s = -1), 0 < o && (this[this.t - 1] |= ((1 << (this.DB - o)) - 1) << o)),
    this.clamp(),
    r && BigInteger.ZERO.subTo(this, this);
}
function bnpClamp() {
  for (var t = this.s & this.DM; 0 < this.t && this[this.t - 1] == t; ) --this.t;
}
function bnToString(t) {
  if (this.s < 0) return '-' + this.negate().toString(t);
  var n;
  if (16 == t) n = 4;
  else if (8 == t) n = 3;
  else if (2 == t) n = 1;
  else if (32 == t) n = 5;
  else {
    if (4 != t) return this.toRadix(t);
    n = 2;
  }
  var e,
    i = (1 << n) - 1,
    r = !1,
    o = '',
    a = this.t,
    s = this.DB - ((a * this.DB) % n);
  if (0 < a--)
    for (s < this.DB && 0 < (e = this[a] >> s) && ((r = !0), (o = int2char(e))); 0 <= a; )
      s < n
        ? ((e = (this[a] & ((1 << s) - 1)) << (n - s)), (e |= this[--a] >> (s += this.DB - n)))
        : ((e = (this[a] >> (s -= n)) & i), s <= 0 && ((s += this.DB), --a)),
        0 < e && (r = !0),
        r && (o += int2char(e));
  return r ? o : '0';
}
function bnNegate() {
  var t = nbi();
  return BigInteger.ZERO.subTo(this, t), t;
}
function bnAbs() {
  return this.s < 0 ? this.negate() : this;
}
function bnCompareTo(t) {
  var n = this.s - t.s;
  if (0 != n) return n;
  var e = this.t;
  if (0 != (n = e - t.t)) return n;
  for (; 0 <= --e; ) if (0 != (n = this[e] - t[e])) return n;
  return 0;
}
function nbits(t) {
  var n,
    e = 1;
  return (
    0 != (n = t >>> 16) && ((t = n), (e += 16)),
    0 != (n = t >> 8) && ((t = n), (e += 8)),
    0 != (n = t >> 4) && ((t = n), (e += 4)),
    0 != (n = t >> 2) && ((t = n), (e += 2)),
    0 != (n = t >> 1) && ((t = n), (e += 1)),
    e
  );
}
function bnBitLength() {
  return this.t <= 0 ? 0 : this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ (this.s & this.DM));
}
function bnpDLShiftTo(t, n) {
  var e;
  for (e = this.t - 1; 0 <= e; --e) n[e + t] = this[e];
  for (e = t - 1; 0 <= e; --e) n[e] = 0;
  (n.t = this.t + t), (n.s = this.s);
}
function bnpDRShiftTo(t, n) {
  for (var e = t; e < this.t; ++e) n[e - t] = this[e];
  (n.t = Math.max(this.t - t, 0)), (n.s = this.s);
}
function bnpLShiftTo(t, n) {
  var e,
    i = t % this.DB,
    r = this.DB - i,
    o = (1 << r) - 1,
    a = Math.floor(t / this.DB),
    s = (this.s << i) & this.DM;
  for (e = this.t - 1; 0 <= e; --e) (n[e + a + 1] = (this[e] >> r) | s), (s = (this[e] & o) << i);
  for (e = a - 1; 0 <= e; --e) n[e] = 0;
  (n[a] = s), (n.t = this.t + a + 1), (n.s = this.s), n.clamp();
}
function bnpRShiftTo(t, n) {
  n.s = this.s;
  var e = Math.floor(t / this.DB);
  if (e >= this.t) n.t = 0;
  else {
    var i = t % this.DB,
      r = this.DB - i,
      o = (1 << i) - 1;
    n[0] = this[e] >> i;
    for (var a = e + 1; a < this.t; ++a) (n[a - e - 1] |= (this[a] & o) << r), (n[a - e] = this[a] >> i);
    0 < i && (n[this.t - e - 1] |= (this.s & o) << r), (n.t = this.t - e), n.clamp();
  }
}
function bnpSubTo(t, n) {
  for (var e = 0, i = 0, r = Math.min(t.t, this.t); e < r; )
    (i += this[e] - t[e]), (n[e++] = i & this.DM), (i >>= this.DB);
  if (t.t < this.t) {
    for (i -= t.s; e < this.t; ) (i += this[e]), (n[e++] = i & this.DM), (i >>= this.DB);
    i += this.s;
  } else {
    for (i += this.s; e < t.t; ) (i -= t[e]), (n[e++] = i & this.DM), (i >>= this.DB);
    i -= t.s;
  }
  (n.s = i < 0 ? -1 : 0), i < -1 ? (n[e++] = this.DV + i) : 0 < i && (n[e++] = i), (n.t = e), n.clamp();
}
function bnpMultiplyTo(t, n) {
  var e = this.abs(),
    i = t.abs(),
    r = e.t;
  for (n.t = r + i.t; 0 <= --r; ) n[r] = 0;
  for (r = 0; r < i.t; ++r) n[r + e.t] = e.am(0, i[r], n, r, 0, e.t);
  (n.s = 0), n.clamp(), this.s != t.s && BigInteger.ZERO.subTo(n, n);
}
function bnpSquareTo(t) {
  for (var n = this.abs(), e = (t.t = 2 * n.t); 0 <= --e; ) t[e] = 0;
  for (e = 0; e < n.t - 1; ++e) {
    var i = n.am(e, n[e], t, 2 * e, 0, 1);
    (t[e + n.t] += n.am(e + 1, 2 * n[e], t, 2 * e + 1, i, n.t - e - 1)) >= n.DV &&
      ((t[e + n.t] -= n.DV), (t[e + n.t + 1] = 1));
  }
  0 < t.t && (t[t.t - 1] += n.am(e, n[e], t, 2 * e, 0, 1)), (t.s = 0), t.clamp();
}
function bnpDivRemTo(t, n, e) {
  var i = t.abs();
  if (!(i.t <= 0)) {
    var r = this.abs();
    if (r.t < i.t) return null != n && n.fromInt(0), void (null != e && this.copyTo(e));
    null == e && (e = nbi());
    var o = nbi(),
      a = this.s,
      s = t.s,
      u = this.DB - nbits(i[i.t - 1]);
    0 < u ? (i.lShiftTo(u, o), r.lShiftTo(u, e)) : (i.copyTo(o), r.copyTo(e));
    var c = o.t,
      l = o[c - 1];
    if (0 != l) {
      var f = l * (1 << this.F1) + (1 < c ? o[c - 2] >> this.F2 : 0),
        g = this.FV / f,
        h = (1 << this.F1) / f,
        p = 1 << this.F2,
        d = e.t,
        b = d - c,
        m = null == n ? nbi() : n;
      for (
        o.dlShiftTo(b, m),
          0 <= e.compareTo(m) && ((e[e.t++] = 1), e.subTo(m, e)),
          BigInteger.ONE.dlShiftTo(c, m),
          m.subTo(o, o);
        o.t < c;

      )
        o[o.t++] = 0;
      for (; 0 <= --b; ) {
        var v = e[--d] == l ? this.DM : Math.floor(e[d] * g + (e[d - 1] + p) * h);
        if ((e[d] += o.am(0, v, e, b, 0, c)) < v) for (o.dlShiftTo(b, m), e.subTo(m, e); e[d] < --v; ) e.subTo(m, e);
      }
      null != n && (e.drShiftTo(c, n), a != s && BigInteger.ZERO.subTo(n, n)),
        (e.t = c),
        e.clamp(),
        0 < u && e.rShiftTo(u, e),
        a < 0 && BigInteger.ZERO.subTo(e, e);
    }
  }
}
function bnMod(t) {
  var n = nbi();
  return this.abs().divRemTo(t, null, n), this.s < 0 && 0 < n.compareTo(BigInteger.ZERO) && t.subTo(n, n), n;
}
function Classic(t) {
  this.m = t;
}
function cConvert(t) {
  return t.s < 0 || 0 <= t.compareTo(this.m) ? t.mod(this.m) : t;
}
function cRevert(t) {
  return t;
}
function cReduce(t) {
  t.divRemTo(this.m, null, t);
}
function cMulTo(t, n, e) {
  t.multiplyTo(n, e), this.reduce(e);
}
function cSqrTo(t, n) {
  t.squareTo(n), this.reduce(n);
}
function bnpInvDigit() {
  if (this.t < 1) return 0;
  var t = this[0];
  if (0 == (1 & t)) return 0;
  var n = 3 & t;
  return 0 <
    (n =
      ((n =
        ((n = ((n = (n * (2 - (15 & t) * n)) & 15) * (2 - (255 & t) * n)) & 255) * (2 - (((65535 & t) * n) & 65535))) &
        65535) *
        (2 - ((t * n) % this.DV))) %
      this.DV)
    ? this.DV - n
    : -n;
}
function Montgomery(t) {
  (this.m = t),
    (this.mp = t.invDigit()),
    (this.mpl = 32767 & this.mp),
    (this.mph = this.mp >> 15),
    (this.um = (1 << (t.DB - 15)) - 1),
    (this.mt2 = 2 * t.t);
}
function montConvert(t) {
  var n = nbi();
  return (
    t.abs().dlShiftTo(this.m.t, n),
    n.divRemTo(this.m, null, n),
    t.s < 0 && 0 < n.compareTo(BigInteger.ZERO) && this.m.subTo(n, n),
    n
  );
}
function montRevert(t) {
  var n = nbi();
  return t.copyTo(n), this.reduce(n), n;
}
function montReduce(t) {
  for (; t.t <= this.mt2; ) t[t.t++] = 0;
  for (var n = 0; n < this.m.t; ++n) {
    var e = 32767 & t[n],
      i = (e * this.mpl + (((e * this.mph + (t[n] >> 15) * this.mpl) & this.um) << 15)) & t.DM;
    for (t[(e = n + this.m.t)] += this.m.am(0, i, t, n, 0, this.m.t); t[e] >= t.DV; ) (t[e] -= t.DV), t[++e]++;
  }
  t.clamp(), t.drShiftTo(this.m.t, t), 0 <= t.compareTo(this.m) && t.subTo(this.m, t);
}
function montSqrTo(t, n) {
  t.squareTo(n), this.reduce(n);
}
function montMulTo(t, n, e) {
  t.multiplyTo(n, e), this.reduce(e);
}
function bnpIsEven() {
  return 0 == (0 < this.t ? 1 & this[0] : this.s);
}
function bnpExp(t, n) {
  if (4294967295 < t || t < 1) return BigInteger.ONE;
  var e = nbi(),
    i = nbi(),
    r = n.convert(this),
    o = nbits(t) - 1;
  for (r.copyTo(e); 0 <= --o; )
    if ((n.sqrTo(e, i), 0 < (t & (1 << o)))) n.mulTo(i, r, e);
    else {
      var a = e;
      (e = i), (i = a);
    }
  return n.revert(e);
}
function bnModPowInt(t, n) {
  var e;
  return (e = t < 256 || n.isEven() ? new Classic(n) : new Montgomery(n)), this.exp(t, e);
}
function bnClone() {
  var t = nbi();
  return this.copyTo(t), t;
}
function bnIntValue() {
  if (this.s < 0) {
    if (1 == this.t) return this[0] - this.DV;
    if (0 == this.t) return -1;
  } else {
    if (1 == this.t) return this[0];
    if (0 == this.t) return 0;
  }
  return ((this[1] & ((1 << (32 - this.DB)) - 1)) << this.DB) | this[0];
}
function bnByteValue() {
  return 0 == this.t ? this.s : (this[0] << 24) >> 24;
}
function bnShortValue() {
  return 0 == this.t ? this.s : (this[0] << 16) >> 16;
}
function bnpChunkSize(t) {
  return Math.floor((Math.LN2 * this.DB) / Math.log(t));
}
function bnSigNum() {
  return this.s < 0 ? -1 : this.t <= 0 || (1 == this.t && this[0] <= 0) ? 0 : 1;
}
function bnpToRadix(t) {
  if ((null == t && (t = 10), 0 == this.signum() || t < 2 || 36 < t)) return '0';
  var n = this.chunkSize(t),
    e = Math.pow(t, n),
    i = nbv(e),
    r = nbi(),
    o = nbi(),
    a = '';
  for (this.divRemTo(i, r, o); 0 < r.signum(); )
    (a = (e + o.intValue()).toString(t).substr(1) + a), r.divRemTo(i, r, o);
  return o.intValue().toString(t) + a;
}
function bnpFromRadix(t, n) {
  this.fromInt(0), null == n && (n = 10);
  for (var e = this.chunkSize(n), i = Math.pow(n, e), r = !1, o = 0, a = 0, s = 0; s < t.length; ++s) {
    var u = intAt(t, s);
    u < 0
      ? '-' == t.charAt(s) && 0 == this.signum() && (r = !0)
      : ((a = n * a + u), ++o >= e && (this.dMultiply(i), this.dAddOffset(a, 0), (a = o = 0)));
  }
  0 < o && (this.dMultiply(Math.pow(n, o)), this.dAddOffset(a, 0)), r && BigInteger.ZERO.subTo(this, this);
}
function bnpFromNumber(t, n, e) {
  if ('number' == typeof n)
    if (t < 2) this.fromInt(1);
    else
      for (
        this.fromNumber(t, e),
          this.testBit(t - 1) || this.bitwiseTo(BigInteger.ONE.shiftLeft(t - 1), op_or, this),
          this.isEven() && this.dAddOffset(1, 0);
        !this.isProbablePrime(n);

      )
        this.dAddOffset(2, 0), this.bitLength() > t && this.subTo(BigInteger.ONE.shiftLeft(t - 1), this);
  else {
    var i = new Array(),
      r = 7 & t;
    (i.length = 1 + (t >> 3)), n.nextBytes(i), 0 < r ? (i[0] &= (1 << r) - 1) : (i[0] = 0), this.fromString(i, 256);
  }
}
function bnToByteArray() {
  var t = this.t,
    n = new Array();
  n[0] = this.s;
  var e,
    i = this.DB - ((t * this.DB) % 8),
    r = 0;
  if (0 < t--)
    for (
      i < this.DB && (e = this[t] >> i) != (this.s & this.DM) >> i && (n[r++] = e | (this.s << (this.DB - i)));
      0 <= t;

    )
      i < 8
        ? ((e = (this[t] & ((1 << i) - 1)) << (8 - i)), (e |= this[--t] >> (i += this.DB - 8)))
        : ((e = (this[t] >> (i -= 8)) & 255), i <= 0 && ((i += this.DB), --t)),
        0 != (128 & e) && (e |= -256),
        0 == r && (128 & this.s) != (128 & e) && ++r,
        (0 < r || e != this.s) && (n[r++] = e);
  return n;
}
function bnEquals(t) {
  return 0 == this.compareTo(t);
}
function bnMin(t) {
  return this.compareTo(t) < 0 ? this : t;
}
function bnMax(t) {
  return 0 < this.compareTo(t) ? this : t;
}
function bnpBitwiseTo(t, n, e) {
  var i,
    r,
    o = Math.min(t.t, this.t);
  for (i = 0; i < o; ++i) e[i] = n(this[i], t[i]);
  if (t.t < this.t) {
    for (r = t.s & this.DM, i = o; i < this.t; ++i) e[i] = n(this[i], r);
    e.t = this.t;
  } else {
    for (r = this.s & this.DM, i = o; i < t.t; ++i) e[i] = n(r, t[i]);
    e.t = t.t;
  }
  (e.s = n(this.s, t.s)), e.clamp();
}
function op_and(t, n) {
  return t & n;
}
function bnAnd(t) {
  var n = nbi();
  return this.bitwiseTo(t, op_and, n), n;
}
function op_or(t, n) {
  return t | n;
}
function bnOr(t) {
  var n = nbi();
  return this.bitwiseTo(t, op_or, n), n;
}
function op_xor(t, n) {
  return t ^ n;
}
function bnXor(t) {
  var n = nbi();
  return this.bitwiseTo(t, op_xor, n), n;
}
function op_andnot(t, n) {
  return t & ~n;
}
function bnAndNot(t) {
  var n = nbi();
  return this.bitwiseTo(t, op_andnot, n), n;
}
function bnNot() {
  for (var t = nbi(), n = 0; n < this.t; ++n) t[n] = this.DM & ~this[n];
  return (t.t = this.t), (t.s = ~this.s), t;
}
function bnShiftLeft(t) {
  var n = nbi();
  return t < 0 ? this.rShiftTo(-t, n) : this.lShiftTo(t, n), n;
}
function bnShiftRight(t) {
  var n = nbi();
  return t < 0 ? this.lShiftTo(-t, n) : this.rShiftTo(t, n), n;
}
function lbit(t) {
  if (0 == t) return -1;
  var n = 0;
  return (
    0 == (65535 & t) && ((t >>= 16), (n += 16)),
    0 == (255 & t) && ((t >>= 8), (n += 8)),
    0 == (15 & t) && ((t >>= 4), (n += 4)),
    0 == (3 & t) && ((t >>= 2), (n += 2)),
    0 == (1 & t) && ++n,
    n
  );
}
function bnGetLowestSetBit() {
  for (var t = 0; t < this.t; ++t) if (0 != this[t]) return t * this.DB + lbit(this[t]);
  return this.s < 0 ? this.t * this.DB : -1;
}
function cbit(t) {
  for (var n = 0; 0 != t; ) (t &= t - 1), ++n;
  return n;
}
function bnBitCount() {
  for (var t = 0, n = this.s & this.DM, e = 0; e < this.t; ++e) t += cbit(this[e] ^ n);
  return t;
}
function bnTestBit(t) {
  var n = Math.floor(t / this.DB);
  return n >= this.t ? 0 != this.s : 0 != (this[n] & (1 << t % this.DB));
}
function bnpChangeBit(t, n) {
  var e = BigInteger.ONE.shiftLeft(t);
  return this.bitwiseTo(e, n, e), e;
}
function bnSetBit(t) {
  return this.changeBit(t, op_or);
}
function bnClearBit(t) {
  return this.changeBit(t, op_andnot);
}
function bnFlipBit(t) {
  return this.changeBit(t, op_xor);
}
function bnpAddTo(t, n) {
  for (var e = 0, i = 0, r = Math.min(t.t, this.t); e < r; )
    (i += this[e] + t[e]), (n[e++] = i & this.DM), (i >>= this.DB);
  if (t.t < this.t) {
    for (i += t.s; e < this.t; ) (i += this[e]), (n[e++] = i & this.DM), (i >>= this.DB);
    i += this.s;
  } else {
    for (i += this.s; e < t.t; ) (i += t[e]), (n[e++] = i & this.DM), (i >>= this.DB);
    i += t.s;
  }
  (n.s = i < 0 ? -1 : 0), 0 < i ? (n[e++] = i) : i < -1 && (n[e++] = this.DV + i), (n.t = e), n.clamp();
}
function bnAdd(t) {
  var n = nbi();
  return this.addTo(t, n), n;
}
function bnSubtract(t) {
  var n = nbi();
  return this.subTo(t, n), n;
}
function bnMultiply(t) {
  var n = nbi();
  return this.multiplyTo(t, n), n;
}
function bnDivide(t) {
  var n = nbi();
  return this.divRemTo(t, n, null), n;
}
function bnRemainder(t) {
  var n = nbi();
  return this.divRemTo(t, null, n), n;
}
function bnDivideAndRemainder(t) {
  var n = nbi(),
    e = nbi();
  return this.divRemTo(t, n, e), new Array(n, e);
}
function bnpDMultiply(t) {
  (this[this.t] = this.am(0, t - 1, this, 0, 0, this.t)), ++this.t, this.clamp();
}
function bnpDAddOffset(t, n) {
  if (0 != t) {
    for (; this.t <= n; ) this[this.t++] = 0;
    for (this[n] += t; this[n] >= this.DV; ) (this[n] -= this.DV), ++n >= this.t && (this[this.t++] = 0), ++this[n];
  }
}
function NullExp() {}
function nNop(t) {
  return t;
}
function nMulTo(t, n, e) {
  t.multiplyTo(n, e);
}
function nSqrTo(t, n) {
  t.squareTo(n);
}
function bnPow(t) {
  return this.exp(t, new NullExp());
}
function bnpMultiplyLowerTo(t, n, e) {
  var i,
    r = Math.min(this.t + t.t, n);
  for (e.s = 0, e.t = r; 0 < r; ) e[--r] = 0;
  for (i = e.t - this.t; r < i; ++r) e[r + this.t] = this.am(0, t[r], e, r, 0, this.t);
  for (i = Math.min(t.t, n); r < i; ++r) this.am(0, t[r], e, r, 0, n - r);
  e.clamp();
}
function bnpMultiplyUpperTo(t, n, e) {
  --n;
  var i = (e.t = this.t + t.t - n);
  for (e.s = 0; 0 <= --i; ) e[i] = 0;
  for (i = Math.max(n - this.t, 0); i < t.t; ++i) e[this.t + i - n] = this.am(n - i, t[i], e, 0, 0, this.t + i - n);
  e.clamp(), e.drShiftTo(1, e);
}
function Barrett(t) {
  (this.r2 = nbi()),
    (this.q3 = nbi()),
    BigInteger.ONE.dlShiftTo(2 * t.t, this.r2),
    (this.mu = this.r2.divide(t)),
    (this.m = t);
}
function barrettConvert(t) {
  if (t.s < 0 || t.t > 2 * this.m.t) return t.mod(this.m);
  if (t.compareTo(this.m) < 0) return t;
  var n = nbi();
  return t.copyTo(n), this.reduce(n), n;
}
function barrettRevert(t) {
  return t;
}
function barrettReduce(t) {
  for (
    t.drShiftTo(this.m.t - 1, this.r2),
      t.t > this.m.t + 1 && ((t.t = this.m.t + 1), t.clamp()),
      this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3),
      this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2);
    t.compareTo(this.r2) < 0;

  )
    t.dAddOffset(1, this.m.t + 1);
  for (t.subTo(this.r2, t); 0 <= t.compareTo(this.m); ) t.subTo(this.m, t);
}
function barrettSqrTo(t, n) {
  t.squareTo(n), this.reduce(n);
}
function barrettMulTo(t, n, e) {
  t.multiplyTo(n, e), this.reduce(e);
}
function bnModPow(t, n) {
  var e,
    i,
    r = t.bitLength(),
    o = nbv(1);
  if (r <= 0) return o;
  (e = r < 18 ? 1 : r < 48 ? 3 : r < 144 ? 4 : r < 768 ? 5 : 6),
    (i = r < 8 ? new Classic(n) : n.isEven() ? new Barrett(n) : new Montgomery(n));
  var a = new Array(),
    s = 3,
    u = e - 1,
    c = (1 << e) - 1;
  if (((a[1] = i.convert(this)), 1 < e)) {
    var l = nbi();
    for (i.sqrTo(a[1], l); s <= c; ) (a[s] = nbi()), i.mulTo(l, a[s - 2], a[s]), (s += 2);
  }
  var f,
    g,
    h = t.t - 1,
    p = !0,
    d = nbi();
  for (r = nbits(t[h]) - 1; 0 <= h; ) {
    for (
      u <= r
        ? (f = (t[h] >> (r - u)) & c)
        : ((f = (t[h] & ((1 << (r + 1)) - 1)) << (u - r)), 0 < h && (f |= t[h - 1] >> (this.DB + r - u))),
        s = e;
      0 == (1 & f);

    )
      (f >>= 1), --s;
    if (((r -= s) < 0 && ((r += this.DB), --h), p)) a[f].copyTo(o), (p = !1);
    else {
      for (; 1 < s; ) i.sqrTo(o, d), i.sqrTo(d, o), (s -= 2);
      0 < s ? i.sqrTo(o, d) : ((g = o), (o = d), (d = g)), i.mulTo(d, a[f], o);
    }
    for (; 0 <= h && 0 == (t[h] & (1 << r)); )
      i.sqrTo(o, d), (g = o), (o = d), (d = g), --r < 0 && ((r = this.DB - 1), --h);
  }
  return i.revert(o);
}
function bnGCD(t) {
  var n = this.s < 0 ? this.negate() : this.clone(),
    e = t.s < 0 ? t.negate() : t.clone();
  if (n.compareTo(e) < 0) {
    var i = n;
    (n = e), (e = i);
  }
  var r = n.getLowestSetBit(),
    o = e.getLowestSetBit();
  if (o < 0) return n;
  for (r < o && (o = r), 0 < o && (n.rShiftTo(o, n), e.rShiftTo(o, e)); 0 < n.signum(); )
    0 < (r = n.getLowestSetBit()) && n.rShiftTo(r, n),
      0 < (r = e.getLowestSetBit()) && e.rShiftTo(r, e),
      0 <= n.compareTo(e) ? (n.subTo(e, n), n.rShiftTo(1, n)) : (e.subTo(n, e), e.rShiftTo(1, e));
  return 0 < o && e.lShiftTo(o, e), e;
}
function bnpModInt(t) {
  if (t <= 0) return 0;
  var n = this.DV % t,
    e = this.s < 0 ? t - 1 : 0;
  if (0 < this.t)
    if (0 == n) e = this[0] % t;
    else for (var i = this.t - 1; 0 <= i; --i) e = (n * e + this[i]) % t;
  return e;
}
function bnModInverse(t) {
  var n = t.isEven();
  if ((this.isEven() && n) || 0 == t.signum()) return BigInteger.ZERO;
  for (var e = t.clone(), i = this.clone(), r = nbv(1), o = nbv(0), a = nbv(0), s = nbv(1); 0 != e.signum(); ) {
    for (; e.isEven(); )
      e.rShiftTo(1, e),
        n
          ? ((r.isEven() && o.isEven()) || (r.addTo(this, r), o.subTo(t, o)), r.rShiftTo(1, r))
          : o.isEven() || o.subTo(t, o),
        o.rShiftTo(1, o);
    for (; i.isEven(); )
      i.rShiftTo(1, i),
        n
          ? ((a.isEven() && s.isEven()) || (a.addTo(this, a), s.subTo(t, s)), a.rShiftTo(1, a))
          : s.isEven() || s.subTo(t, s),
        s.rShiftTo(1, s);
    0 <= e.compareTo(i)
      ? (e.subTo(i, e), n && r.subTo(a, r), o.subTo(s, o))
      : (i.subTo(e, i), n && a.subTo(r, a), s.subTo(o, s));
  }
  return 0 != i.compareTo(BigInteger.ONE)
    ? BigInteger.ZERO
    : 0 <= s.compareTo(t)
    ? s.subtract(t)
    : s.signum() < 0
    ? (s.addTo(t, s), s.signum() < 0 ? s.add(t) : s)
    : s;
}
(Classic.prototype.convert = cConvert),
  (Classic.prototype.revert = cRevert),
  (Classic.prototype.reduce = cReduce),
  (Classic.prototype.mulTo = cMulTo),
  (Classic.prototype.sqrTo = cSqrTo),
  (Montgomery.prototype.convert = montConvert),
  (Montgomery.prototype.revert = montRevert),
  (Montgomery.prototype.reduce = montReduce),
  (Montgomery.prototype.mulTo = montMulTo),
  (Montgomery.prototype.sqrTo = montSqrTo),
  (BigInteger.prototype.copyTo = bnpCopyTo),
  (BigInteger.prototype.fromInt = bnpFromInt),
  (BigInteger.prototype.fromString = bnpFromString),
  (BigInteger.prototype.clamp = bnpClamp),
  (BigInteger.prototype.dlShiftTo = bnpDLShiftTo),
  (BigInteger.prototype.drShiftTo = bnpDRShiftTo),
  (BigInteger.prototype.lShiftTo = bnpLShiftTo),
  (BigInteger.prototype.rShiftTo = bnpRShiftTo),
  (BigInteger.prototype.subTo = bnpSubTo),
  (BigInteger.prototype.multiplyTo = bnpMultiplyTo),
  (BigInteger.prototype.squareTo = bnpSquareTo),
  (BigInteger.prototype.divRemTo = bnpDivRemTo),
  (BigInteger.prototype.invDigit = bnpInvDigit),
  (BigInteger.prototype.isEven = bnpIsEven),
  (BigInteger.prototype.exp = bnpExp),
  (BigInteger.prototype.toString = bnToString),
  (BigInteger.prototype.negate = bnNegate),
  (BigInteger.prototype.abs = bnAbs),
  (BigInteger.prototype.compareTo = bnCompareTo),
  (BigInteger.prototype.bitLength = bnBitLength),
  (BigInteger.prototype.mod = bnMod),
  (BigInteger.prototype.modPowInt = bnModPowInt),
  (BigInteger.ZERO = nbv(0)),
  (BigInteger.ONE = nbv(1)),
  (NullExp.prototype.convert = nNop),
  (NullExp.prototype.revert = nNop),
  (NullExp.prototype.mulTo = nMulTo),
  (NullExp.prototype.sqrTo = nSqrTo),
  (Barrett.prototype.convert = barrettConvert),
  (Barrett.prototype.revert = barrettRevert),
  (Barrett.prototype.reduce = barrettReduce),
  (Barrett.prototype.mulTo = barrettMulTo),
  (Barrett.prototype.sqrTo = barrettSqrTo);
var lowprimes = [
    2,
    3,
    5,
    7,
    11,
    13,
    17,
    19,
    23,
    29,
    31,
    37,
    41,
    43,
    47,
    53,
    59,
    61,
    67,
    71,
    73,
    79,
    83,
    89,
    97,
    101,
    103,
    107,
    109,
    113,
    127,
    131,
    137,
    139,
    149,
    151,
    157,
    163,
    167,
    173,
    179,
    181,
    191,
    193,
    197,
    199,
    211,
    223,
    227,
    229,
    233,
    239,
    241,
    251,
    257,
    263,
    269,
    271,
    277,
    281,
    283,
    293,
    307,
    311,
    313,
    317,
    331,
    337,
    347,
    349,
    353,
    359,
    367,
    373,
    379,
    383,
    389,
    397,
    401,
    409,
    419,
    421,
    431,
    433,
    439,
    443,
    449,
    457,
    461,
    463,
    467,
    479,
    487,
    491,
    499,
    503,
    509,
  ],
  lplim = (1 << 26) / lowprimes[lowprimes.length - 1];
function bnIsProbablePrime(t) {
  var n,
    e = this.abs();
  if (1 == e.t && e[0] <= lowprimes[lowprimes.length - 1]) {
    for (n = 0; n < lowprimes.length; ++n) if (e[0] == lowprimes[n]) return !0;
    return !1;
  }
  if (e.isEven()) return !1;
  for (n = 1; n < lowprimes.length; ) {
    for (var i = lowprimes[n], r = n + 1; r < lowprimes.length && i < lplim; ) i *= lowprimes[r++];
    for (i = e.modInt(i); n < r; ) if (i % lowprimes[n++] == 0) return !1;
  }
  return e.millerRabin(t);
}
function bnpMillerRabin(t) {
  var n = this.subtract(BigInteger.ONE),
    e = n.getLowestSetBit();
  if (e <= 0) return !1;
  var i = n.shiftRight(e);
  (t = (t + 1) >> 1) > lowprimes.length && (t = lowprimes.length);
  for (var r = nbi(), o = 0; o < t; ++o) {
    r.fromInt(lowprimes[o]);
    var a = r.modPow(i, this);
    if (0 != a.compareTo(BigInteger.ONE) && 0 != a.compareTo(n)) {
      for (var s = 1; s++ < e && 0 != a.compareTo(n); )
        if (0 == (a = a.modPowInt(2, this)).compareTo(BigInteger.ONE)) return !1;
      if (0 != a.compareTo(n)) return !1;
    }
  }
  return !0;
}
function parseBigInt(t, n) {
  return new BigInteger(t, n);
}
function linebrk(t, n) {
  for (var e = '', i = 0; i + n < t.length; ) (e += t.substring(i, i + n) + '\n'), (i += n);
  return e + t.substring(i, t.length);
}
function byte2Hex(t) {
  return t < 16 ? '0' + t.toString(16) : t.toString(16);
}
function pkcs1pad2(t, n) {
  if (n < t.length + 11) return console.log('Message too long for RSA'), null;
  for (var e = new Array(), i = t.length - 1; 0 <= i && 0 < n; ) {
    var r = t.charCodeAt(i--);
    r < 128
      ? (e[--n] = r)
      : 127 < r && r < 2048
      ? ((e[--n] = (63 & r) | 128), (e[--n] = (r >> 6) | 192))
      : ((e[--n] = (63 & r) | 128), (e[--n] = ((r >> 6) & 63) | 128), (e[--n] = (r >> 12) | 224));
  }
  e[--n] = 0;
  for (var o = new SecureRandom(), a = new Array(); 2 < n; ) {
    for (a[0] = 0; 0 == a[0]; ) o.nextBytes(a);
    e[--n] = a[0];
  }
  return (e[--n] = 2), (e[--n] = 0), new BigInteger(e);
}
function RSAKey() {
  (this.n = null),
    (this.e = 0),
    (this.d = null),
    (this.p = null),
    (this.q = null),
    (this.dmp1 = null),
    (this.dmq1 = null),
    (this.coeff = null);
}
function RSASetPublic(t, n) {
  null != t && null != n && 0 < t.length && 0 < n.length
    ? ((this.n = parseBigInt(t, 16)), (this.e = parseInt(n, 16)))
    : console.log('Invalid RSA public key');
}
function RSADoPublic(t) {
  return t.modPowInt(this.e, this.n);
}
function RSAEncrypt(t) {
  var n = pkcs1pad2(t, (this.n.bitLength() + 7) >> 3);
  if (null == n) return null;
  var e = this.doPublic(n);
  if (null == e) return null;
  var i = e.toString(16);
  return 0 == (1 & i.length) ? i : '0' + i;
}
(BigInteger.prototype.chunkSize = bnpChunkSize),
  (BigInteger.prototype.toRadix = bnpToRadix),
  (BigInteger.prototype.fromRadix = bnpFromRadix),
  (BigInteger.prototype.fromNumber = bnpFromNumber),
  (BigInteger.prototype.bitwiseTo = bnpBitwiseTo),
  (BigInteger.prototype.changeBit = bnpChangeBit),
  (BigInteger.prototype.addTo = bnpAddTo),
  (BigInteger.prototype.dMultiply = bnpDMultiply),
  (BigInteger.prototype.dAddOffset = bnpDAddOffset),
  (BigInteger.prototype.multiplyLowerTo = bnpMultiplyLowerTo),
  (BigInteger.prototype.multiplyUpperTo = bnpMultiplyUpperTo),
  (BigInteger.prototype.modInt = bnpModInt),
  (BigInteger.prototype.millerRabin = bnpMillerRabin),
  (BigInteger.prototype.clone = bnClone),
  (BigInteger.prototype.intValue = bnIntValue),
  (BigInteger.prototype.byteValue = bnByteValue),
  (BigInteger.prototype.shortValue = bnShortValue),
  (BigInteger.prototype.signum = bnSigNum),
  (BigInteger.prototype.toByteArray = bnToByteArray),
  (BigInteger.prototype.equals = bnEquals),
  (BigInteger.prototype.min = bnMin),
  (BigInteger.prototype.max = bnMax),
  (BigInteger.prototype.and = bnAnd),
  (BigInteger.prototype.or = bnOr),
  (BigInteger.prototype.xor = bnXor),
  (BigInteger.prototype.andNot = bnAndNot),
  (BigInteger.prototype.not = bnNot),
  (BigInteger.prototype.shiftLeft = bnShiftLeft),
  (BigInteger.prototype.shiftRight = bnShiftRight),
  (BigInteger.prototype.getLowestSetBit = bnGetLowestSetBit),
  (BigInteger.prototype.bitCount = bnBitCount),
  (BigInteger.prototype.testBit = bnTestBit),
  (BigInteger.prototype.setBit = bnSetBit),
  (BigInteger.prototype.clearBit = bnClearBit),
  (BigInteger.prototype.flipBit = bnFlipBit),
  (BigInteger.prototype.add = bnAdd),
  (BigInteger.prototype.subtract = bnSubtract),
  (BigInteger.prototype.multiply = bnMultiply),
  (BigInteger.prototype.divide = bnDivide),
  (BigInteger.prototype.remainder = bnRemainder),
  (BigInteger.prototype.divideAndRemainder = bnDivideAndRemainder),
  (BigInteger.prototype.modPow = bnModPow),
  (BigInteger.prototype.modInverse = bnModInverse),
  (BigInteger.prototype.pow = bnPow),
  (BigInteger.prototype.gcd = bnGCD),
  (BigInteger.prototype.isProbablePrime = bnIsProbablePrime),
  (RSAKey.prototype.doPublic = RSADoPublic),
  (RSAKey.prototype.setPublic = RSASetPublic),
  (RSAKey.prototype.encrypt = RSAEncrypt),
  (sha1 = new (function() {
    var s = [1732584193, 4023233417, 2562383102, 271733878, 3285377520],
      u = s.length;
    (this.hex = function(t) {
      return f(e(t));
    }),
      (this.dec = function(t) {
        return e(t);
      }),
      (this.bin = function(t) {
        return d(e(t));
      });
    var e = function(t) {
        var n = [];
        return r(t) ? (n = t) : o(t) && (n = p(t)), (n = l(n)), a(n);
      },
      r = function(t) {
        return t && t.constructor === [].constructor;
      },
      o = function(t) {
        return 'string' == typeof t;
      },
      c = function(t, n) {
        return (t << n) | (t >>> (32 - n));
      },
      a = function(t) {
        var n,
          e,
          i,
          r = [],
          o = [],
          a = [];
        for (e = 0; e < u; e++) r[e] = s[e];
        for (n = 0; n < t.length; n += 64) {
          for (e = 0; e < u; e++) o[e] = r[e];
          for (a = h(t.slice(n, n + 64)), e = 16; e < 80; e++) a[e] = c(a[e - 3] ^ a[e - 8] ^ a[e - 14] ^ a[e - 16], 1);
          for (e = 0; e < 80; e++)
            (i =
              e < 20
                ? ((r[1] & r[2]) ^ (~r[1] & r[3])) + b[0]
                : e < 40
                ? (r[1] ^ r[2] ^ r[3]) + b[1]
                : e < 60
                ? ((r[1] & r[2]) ^ (r[1] & r[3]) ^ (r[2] & r[3])) + b[2]
                : (r[1] ^ r[2] ^ r[3]) + b[3]),
              (i += c(r[0], 5) + a[e] + r[4]),
              (r[4] = r[3]),
              (r[3] = r[2]),
              (r[2] = c(r[1], 30)),
              (r[1] = r[0]),
              (r[0] = i);
          for (e = 0; e < u; e++) r[e] += o[e];
        }
        return g(r);
      },
      l = function(t) {
        var n = t.length,
          e = n;
        for (t[e++] = 128; e % 64 != 56; ) t[e++] = 0;
        return (n *= 8), t.concat(0, 0, 0, 0, g([n]));
      },
      f = function(t) {
        var n,
          e = '';
        for (n = 0; n < t.length; n++) e += (15 < t[n] ? '' : '0') + t[n].toString(16);
        return e;
      },
      g = function(t) {
        var e = [];
        for (n = i = 0; i < t.length; i++)
          (e[n++] = (t[i] >>> 24) & 255),
            (e[n++] = (t[i] >>> 16) & 255),
            (e[n++] = (t[i] >>> 8) & 255),
            (e[n++] = 255 & t[i]);
        return e;
      },
      h = function(t) {
        var n,
          e,
          i = [];
        for (e = n = 0; n < t.length; n += 4, e++) i[e] = (t[n] << 24) | (t[n + 1] << 16) | (t[n + 2] << 8) | t[n + 3];
        return i;
      },
      p = function(t) {
        var n,
          e,
          i,
          r = [];
        for (e = n = 0; n < t.length; n++)
          (i = t.charCodeAt(n)) <= 255 ? (r[e++] = i) : ((r[e++] = i >>> 8), (r[e++] = 255 & i));
        return r;
      },
      d = function(t) {
        var n,
          e = '';
        for (n in t) e += String.fromCharCode(t[n]);
        return e;
      },
      b = [1518500249, 1859775393, 2400959708, 3395469782];
  })()),
  (sha256 = new (function() {
    var v = [1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225],
      S = v.length;
    (this.hex = function(t) {
      return u(e(t));
    }),
      (this.dec = function(t) {
        return e(t);
      }),
      (this.bin = function(t) {
        return l(e(t));
      });
    var e = function(t) {
        var n = [];
        return r(t) ? (n = t) : o(t) && (n = c(t)), (n = s(n)), a(n);
      },
      r = function(t) {
        return t && t.constructor === [].constructor;
      },
      o = function(t) {
        return 'string' == typeof t;
      },
      I = function(t, n) {
        return (t >>> n) | (t << (32 - n));
      },
      a = function(t) {
        var n,
          e,
          i,
          r,
          o,
          a,
          s,
          u,
          c,
          l,
          f,
          g,
          h,
          p,
          d = [],
          b = [],
          m = [];
        for (e = 0; e < S; e++) d[e] = v[e];
        for (n = 0; n < t.length; n += 64) {
          for (e = 0; e < S; e++) b[e] = d[e];
          for (m = T(t.slice(n, n + 64)), e = 16; e < 64; e++)
            m[e] = ((p = m[e - 2]),
            (I(p, 17) ^ I(p, 19) ^ (p >>> 10)) +
              m[e - 7] +
              ((h = m[e - 15]), I(h, 7) ^ I(h, 18) ^ (h >>> 3)) +
              m[e - 16]);
          for (e = 0; e < 64; e++)
            (i =
              d[7] +
              ((g = d[4]), I(g, 6) ^ I(g, 11) ^ I(g, 25)) +
              ((c = d[4]), (l = d[5]), (f = d[6]), (c & l) ^ (~c & f)) +
              k[e] +
              m[e]),
              (u = d[0]),
              (r = (I(u, 2) ^ I(u, 13) ^ I(u, 22)) + ((o = d[0]), (a = d[1]), (s = d[2]), (o & a) ^ (o & s) ^ (a & s))),
              (d[7] = d[6]),
              (d[6] = d[5]),
              (d[5] = d[4]),
              (d[4] = d[3] + i),
              (d[3] = d[2]),
              (d[2] = d[1]),
              (d[1] = d[0]),
              (d[0] = i + r);
          for (e = 0; e < S; e++) d[e] += b[e];
        }
        return C(d);
      },
      s = function(t) {
        var n = t.length,
          e = n;
        for (t[e++] = 128; e % 64 != 56; ) t[e++] = 0;
        return (n *= 8), t.concat(0, 0, 0, 0, C([n]));
      },
      u = function(t) {
        var n,
          e = '';
        for (n = 0; n < t.length; n++) e += (15 < t[n] ? '' : '0') + t[n].toString(16);
        return e;
      },
      C = function(t) {
        var e = [];
        for (n = i = 0; i < t.length; i++)
          (e[n++] = (t[i] >>> 24) & 255),
            (e[n++] = (t[i] >>> 16) & 255),
            (e[n++] = (t[i] >>> 8) & 255),
            (e[n++] = 255 & t[i]);
        return e;
      },
      T = function(t) {
        var n,
          e,
          i = [];
        for (e = n = 0; n < t.length; n += 4, e++) i[e] = (t[n] << 24) | (t[n + 1] << 16) | (t[n + 2] << 8) | t[n + 3];
        return i;
      },
      c = function(t) {
        var n,
          e,
          i,
          r = [];
        for (e = n = 0; n < t.length; n++)
          (i = t.charCodeAt(n)) <= 255 ? (r[e++] = i) : ((r[e++] = i >>> 8), (r[e++] = 255 & i));
        return r;
      },
      l = function(t) {
        var n,
          e = '';
        for (n in t) e += String.fromCharCode(t[n]);
        return e;
      },
      k = [
        1116352408,
        1899447441,
        3049323471,
        3921009573,
        961987163,
        1508970993,
        2453635748,
        2870763221,
        3624381080,
        310598401,
        607225278,
        1426881987,
        1925078388,
        2162078206,
        2614888103,
        3248222580,
        3835390401,
        4022224774,
        264347078,
        604807628,
        770255983,
        1249150122,
        1555081692,
        1996064986,
        2554220882,
        2821834349,
        2952996808,
        3210313671,
        3336571891,
        3584528711,
        113926993,
        338241895,
        666307205,
        773529912,
        1294757372,
        1396182291,
        1695183700,
        1986661051,
        2177026350,
        2456956037,
        2730485921,
        2820302411,
        3259730800,
        3345764771,
        3516065817,
        3600352804,
        4094571909,
        275423344,
        430227734,
        506948616,
        659060556,
        883997877,
        958139571,
        1322822218,
        1537002063,
        1747873779,
        1955562222,
        2024104815,
        2227730452,
        2361852424,
        2428436474,
        2756734187,
        3204031479,
        3329325298,
      ];
  })());
var _RSASIGN_DIHEAD = [];
(_RSASIGN_DIHEAD.sha1 = '3021300906052b0e03021a05000414'),
  (_RSASIGN_DIHEAD.sha256 = '3031300d060960864801650304020105000420');
var _RSASIGN_HASHHEXFUNC = [];
function _rsasign_getHexPaddedDigestInfoForString(t, n, e) {
  for (
    var i = n / 4,
      r = (0, _RSASIGN_HASHHEXFUNC[e])(t),
      o = '00' + _RSASIGN_DIHEAD[e] + r,
      a = '',
      s = i - '0001'.length - o.length,
      u = 0;
    u < s;
    u += 2
  )
    a += 'ff';
  return (sPaddedMessageHex = '0001' + a + o), sPaddedMessageHex;
}
function _rsasign_signString(t, n) {
  var e = parseBigInt(_rsasign_getHexPaddedDigestInfoForString(t, this.n.bitLength(), n), 16);
  return this.doPrivate(e).toString(16);
}
function _rsasign_signStringWithSHA1(t) {
  var n = parseBigInt(_rsasign_getHexPaddedDigestInfoForString(t, this.n.bitLength(), 'sha1'), 16);
  return this.doPrivate(n).toString(16);
}
function _rsasign_signStringWithSHA256(t) {
  var n = parseBigInt(_rsasign_getHexPaddedDigestInfoForString(t, this.n.bitLength(), 'sha256'), 16);
  return this.doPrivate(n).toString(16);
}
function _rsasign_getDecryptSignatureBI(t, n, e) {
  var i = new RSAKey();
  return i.setPublic(n, e), i.doPublic(t);
}
function _rsasign_getHexDigestInfoFromSig(t, n, e) {
  return _rsasign_getDecryptSignatureBI(t, n, e)
    .toString(16)
    .replace(/^1f+00/, '');
}
function _rsasign_getAlgNameAndHashFromHexDisgestInfo(t) {
  for (var n in _RSASIGN_DIHEAD) {
    var e = _RSASIGN_DIHEAD[n],
      i = e.length;
    if (t.substring(0, i) == e) return [n, t.substring(i)];
  }
  return [];
}
function _rsasign_verifySignatureWithArgs(t, n, e, i) {
  var r = _rsasign_getAlgNameAndHashFromHexDisgestInfo(_rsasign_getHexDigestInfoFromSig(n, e, i));
  if (0 == r.length) return !1;
  var o = r[0];
  return r[1] == (0, _RSASIGN_HASHHEXFUNC[o])(t);
}
function _rsasign_verifyHexSignatureForMessage(t, n) {
  return _rsasign_verifySignatureWithArgs(n, parseBigInt(t, 16), this.n.toString(16), this.e.toString(16));
}
function _rsasign_verifyString(t, n) {
  var e = parseBigInt((n = n.replace(/[ \n]+/g, '')), 16),
    i = _rsasign_getAlgNameAndHashFromHexDisgestInfo(
      this.doPublic(e)
        .toString(16)
        .replace(/^1f+00/, '')
    );
  if (0 == i.length) return !1;
  var r = i[0];
  return i[1] == (0, _RSASIGN_HASHHEXFUNC[r])(t);
}
(_RSASIGN_HASHHEXFUNC.sha1 = sha1.hex),
  (_RSASIGN_HASHHEXFUNC.sha256 = sha256.hex),
  (RSAKey.prototype.signString = _rsasign_signString),
  (RSAKey.prototype.signStringWithSHA1 = _rsasign_signStringWithSHA1),
  (RSAKey.prototype.signStringWithSHA256 = _rsasign_signStringWithSHA256),
  (RSAKey.prototype.verifyString = _rsasign_verifyString),
  (RSAKey.prototype.verifyHexSignatureForMessage = _rsasign_verifyHexSignatureForMessage);
var b64map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
  b64pad = '=';
function hex2b64(t) {
  var n,
    e,
    i = '';
  for (n = 0; n + 3 <= t.length; n += 3)
    (e = parseInt(t.substring(n, n + 3), 16)), (i += b64map.charAt(e >> 6) + b64map.charAt(63 & e));
  for (
    n + 1 == t.length
      ? ((e = parseInt(t.substring(n, n + 1), 16)), (i += b64map.charAt(e << 2)))
      : n + 2 == t.length &&
        ((e = parseInt(t.substring(n, n + 2), 16)), (i += b64map.charAt(e >> 2) + b64map.charAt((3 & e) << 4)));
    0 < (3 & i.length);

  )
    i += b64pad;
  return i;
}
function b64tohex(t) {
  var n,
    e,
    i = '',
    r = 0;
  for (n = 0; n < t.length && t.charAt(n) != b64pad; ++n)
    (v = b64map.indexOf(t.charAt(n))),
      v < 0 ||
        (0 == r
          ? ((i += int2char(v >> 2)), (e = 3 & v), (r = 1))
          : 1 == r
          ? ((i += int2char((e << 2) | (v >> 4))), (e = 15 & v), (r = 2))
          : 2 == r
          ? ((i += int2char(e)), (i += int2char(v >> 2)), (e = 3 & v), (r = 3))
          : ((i += int2char((e << 2) | (v >> 4))), (i += int2char(15 & v)), (r = 0)));
  return 1 == r && (i += int2char(e << 2)), i;
}
function b64toBA(t) {
  var n,
    e = b64tohex(t),
    i = new Array();
  for (n = 0; 2 * n < e.length; ++n) i[n] = parseInt(e.substring(2 * n, 2 * n + 2), 16);
  return i;
}
function _asnhex_getByteLengthOfL_AtObj(t, n) {
  if ('8' != t.substring(n + 2, n + 3)) return 1;
  var e = parseInt(t.substring(n + 3, n + 4));
  return 0 == e ? -1 : 0 < e && e < 10 ? e + 1 : -2;
}
function _asnhex_getHexOfL_AtObj(t, n) {
  var e = _asnhex_getByteLengthOfL_AtObj(t, n);
  return e < 1 ? '' : t.substring(n + 2, n + 2 + 2 * e);
}
function _asnhex_getIntOfL_AtObj(t, n) {
  var e = _asnhex_getHexOfL_AtObj(t, n);
  return '' == e
    ? -1
    : (parseInt(e.substring(0, 1)) < 8 ? parseBigInt(e, 16) : parseBigInt(e.substring(2), 16)).intValue();
}
function _asnhex_getStartPosOfV_AtObj(t, n) {
  var e = _asnhex_getByteLengthOfL_AtObj(t, n);
  return e < 0 ? e : n + 2 * (e + 1);
}
function _asnhex_getHexOfV_AtObj(t, n) {
  var e = _asnhex_getStartPosOfV_AtObj(t, n),
    i = _asnhex_getIntOfL_AtObj(t, n);
  return t.substring(e, e + 2 * i);
}
function _asnhex_getPosOfNextSibling_AtObj(t, n) {
  return _asnhex_getStartPosOfV_AtObj(t, n) + 2 * _asnhex_getIntOfL_AtObj(t, n);
}
function _asnhex_getPosArrayOfChildren_AtObj(t, n) {
  var e = new Array(),
    i = _asnhex_getStartPosOfV_AtObj(t, n);
  e.push(i);
  for (var r = _asnhex_getIntOfL_AtObj(t, n), o = i, a = 0; ; ) {
    var s = _asnhex_getPosOfNextSibling_AtObj(t, o);
    if (null == s || 2 * r <= s - i) break;
    if (200 <= a) break;
    e.push(s), (o = s), a++;
  }
  return e;
}
function _x509_pemToBase64(t) {
  var n = t;
  return (
    -1 < n.indexOf('CERTIFICATE') &&
      (n = (n = n.replace('-----BEGIN CERTIFICATE-----', '')).replace('-----END CERTIFICATE-----', '')),
    -1 < n.indexOf('PUBLIC KEY') &&
      (n = (n = n.replace('-----BEGIN PUBLIC KEY-----', '')).replace('-----END PUBLIC KEY-----', '')),
    (n = n.replace(/[ \n]+/g, ''))
  );
}
function _x509_pemToHex(t) {
  return b64tohex(_x509_pemToBase64(t));
}
function _x509_getHexTbsCertificateFromCert(t) {
  return _asnhex_getStartPosOfV_AtObj(t, 0);
}
function _x509_getSubjectPublicKeyInfoPosFromCertHex(t) {
  var n = _asnhex_getPosArrayOfChildren_AtObj(t, _asnhex_getStartPosOfV_AtObj(t, 0));
  return n.length < 1
    ? -1
    : 'a003020102' == t.substring(n[0], n[0] + 10)
    ? n.length < 6
      ? -1
      : n[6]
    : n.length < 5
    ? -1
    : n[5];
}
function _x509_getSubjectPublicKeyPosFromCertHex(t) {
  var n = _x509_getSubjectPublicKeyInfoPosFromCertHex(t);
  if (-1 == n) return -1;
  var e = _asnhex_getPosArrayOfChildren_AtObj(t, n);
  if (2 != e.length) return -1;
  var i = e[1];
  if ('03' != t.substring(i, i + 2)) return -1;
  var r = _asnhex_getStartPosOfV_AtObj(t, i);
  return '00' != t.substring(r, r + 2) ? -1 : r + 2;
}
function _x509_getPublicKeyHexArrayFromCertHex(t) {
  var n = _asnhex_getPosArrayOfChildren_AtObj(t, _x509_getSubjectPublicKeyPosFromCertHex(t));
  if (2 != n.length) return [];
  var e = _asnhex_getHexOfV_AtObj(t, n[0]),
    i = _asnhex_getHexOfV_AtObj(t, n[1]);
  return null != e && null != i ? [e, i] : [];
}
function _x509_getPublicKeyHexArrayFromCertPEM(t) {
  return _x509_getPublicKeyHexArrayFromCertHex(_x509_pemToHex(t));
}
function _x509_readCertPEM(t) {
  var n = _x509_getPublicKeyHexArrayFromCertHex(_x509_pemToHex(t)),
    e = new RSAKey();
  e.setPublic(n[0], n[1]),
    (this.subjectPublicKeyRSA = e),
    (this.subjectPublicKeyRSA_hN = n[0]),
    (this.subjectPublicKeyRSA_hE = n[1]);
}
function _x509_readCertPEMWithoutRSAInit(t) {
  var n = _x509_getPublicKeyHexArrayFromCertHex(_x509_pemToHex(t));
  this.subjectPublicKeyRSA.setPublic(n[0], n[1]),
    (this.subjectPublicKeyRSA_hN = n[0]),
    (this.subjectPublicKeyRSA_hE = n[1]);
}
function X509() {
  (this.subjectPublicKeyRSA = null), (this.subjectPublicKeyRSA_hN = null), (this.subjectPublicKeyRSA_hE = null);
}
(X509.prototype.readCertPEM = _x509_readCertPEM),
  (X509.prototype.readCertPEMWithoutRSAInit = _x509_readCertPEMWithoutRSAInit);
var x509Cert =
  '-----BEGIN CERTIFICATE-----\nMIID4jCCAsqgAwIBAgIEWcterDANBgkqhkiG9w0BAQsFADCBsjELMAkGA1UEBhMC\nVk4xEjAQBgNVBAgMCUjDoCBO4buZaTEVMBMGA1UEBwwMQ+G6p3UgR2nhuqV5MRYw\nFAYDVQQKDA1WTlBUIFNvZnR3YXJlMTgwNgYDVQQLDC9QaMOybmcgR2nhuqNpIHBo\nw6FwIENo4bupbmcgdGjhu7FjIMSQaeG7h24gdOG7rTEmMCQGA1UEAwwdVk5QVC1D\nQSBQbHVnaW4gQXV0aGVudGljYXRpb24wHhcNMTcwOTI3MDgxOTAwWhcNMTgwOTI3\nMDgxOTAwWjCBsjELMAkGA1UEBhMCVk4xEjAQBgNVBAgMCUjDoCBO4buZaTEVMBMG\nA1UEBwwMQ+G6p3UgR2nhuqV5MRYwFAYDVQQKDA1WTlBUIFNvZnR3YXJlMTgwNgYD\nVQQLDC9QaMOybmcgR2nhuqNpIHBow6FwIENo4bupbmcgdGjhu7FjIMSQaeG7h24g\ndOG7rTEmMCQGA1UEAwwdVk5QVC1DQSBQbHVnaW4gQXV0aGVudGljYXRpb24wggEi\nMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCNXA/sRTeNhPww8bC7Yv1r/pjr\nYXTbQ4nw1oNXx7sxQOElIL+ytUUcF91FqsuBlwyEYJa2wTi2hwMXZjZtxFPhMviW\n1Y0AoCT3Yu76K7o4SUmYLSX+pe8+F9CJUUiFoQ1DrBzNUeMH+boZB0GDCpcC8Og7\nkRhnGBNocARnX0Nk2wq0gU/xRm01kFHPzHFP9t4KMvYfdBGZH/qohbV1l2I3yD39\ntO9vKqM49S1UIADNwzjtGAkrkZjnOkXILPDawZuGQ6w8ftDN52ZSS6lgKFcHlC5d\n7YkMFVqZ/M0NkOIjoZDjhDUfKO78gWNaEJVeR+wMVot/47hb3avv0EEXonEhAgMB\nAAEwDQYJKoZIhvcNAQELBQADggEBAAYn1U5T9Qu5W33U4muA7OnWaQrHQ9P64sbn\nblfyuvdrvvK2NUTSnvkt5/UB1MCUPAwqkiWYAiBm1ECAZ0sT8Ia5maplX2+BEx3f\nj22wdkMAKoMfxQt/3bXONeJEftviOTmzeif9jcNpAbJj/pklKyy5KviN61Rlwm3Q\nfUUaTKHlUTSX6i7CGLCPANLP8Q+loCytwUije0HS5CXoGXkhC57zRUrzny9jBPrw\nvPN5/aD2Qf33oQ5Xzf06l0PIMFeeWAi4G6ExsHHv7iUJ8klTTbDuHoWabWMWOKZo\nFRAhKb5sZNqhAjIoTVQLRpdFHbIS64fUegtFGefDqw2RPIHO0og=\n-----END CERTIFICATE-----';
function doVerify(t, n) {
  var e = new X509();
  return e.readCertPEM(x509Cert), e.subjectPublicKeyRSA.verifyString(t, n);
}
'object' != typeof JSON && (JSON = {}),
  (function() {
    'use strict';
    var rx_one = /^[\],:{}\s]*$/,
      rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
      rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
      rx_four = /(?:^|:|,)(?:\s*\[)+/g,
      rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      gap,
      indent,
      meta,
      rep;
    function f(t) {
      return t < 10 ? '0' + t : t;
    }
    function this_value() {
      return this.valueOf();
    }
    function quote(t) {
      return (
        (rx_escapable.lastIndex = 0),
        rx_escapable.test(t)
          ? '"' +
            t.replace(rx_escapable, function(t) {
              var n = meta[t];
              return 'string' == typeof n ? n : '\\u' + ('0000' + t.charCodeAt(0).toString(16)).slice(-4);
            }) +
            '"'
          : '"' + t + '"'
      );
    }
    function str(t, n) {
      var e,
        i,
        r,
        o,
        a,
        s = gap,
        u = n[t];
      switch (
        (u && 'object' == typeof u && 'function' == typeof u.toJSON && (u = u.toJSON(t)),
        'function' == typeof rep && (u = rep.call(n, t, u)),
        typeof u)
      ) {
        case 'string':
          return quote(u);
        case 'number':
          return isFinite(u) ? String(u) : 'null';
        case 'boolean':
        case 'null':
          return String(u);
        case 'object':
          if (!u) return 'null';
          if (((gap += indent), (a = []), '[object Array]' === Object.prototype.toString.apply(u))) {
            for (o = u.length, e = 0; e < o; e += 1) a[e] = str(e, u) || 'null';
            return (
              (r =
                0 === a.length
                  ? '[]'
                  : gap
                  ? '[\n' + gap + a.join(',\n' + gap) + '\n' + s + ']'
                  : '[' + a.join(',') + ']'),
              (gap = s),
              r
            );
          }
          if (rep && 'object' == typeof rep)
            for (o = rep.length, e = 0; e < o; e += 1)
              'string' == typeof rep[e] && (r = str((i = rep[e]), u)) && a.push(quote(i) + (gap ? ': ' : ':') + r);
          else
            for (i in u)
              Object.prototype.hasOwnProperty.call(u, i) &&
                (r = str(i, u)) &&
                a.push(quote(i) + (gap ? ': ' : ':') + r);
          return (
            (r =
              0 === a.length
                ? '{}'
                : gap
                ? '{\n' + gap + a.join(',\n' + gap) + '\n' + s + '}'
                : '{' + a.join(',') + '}'),
            (gap = s),
            r
          );
      }
    }
    'function' != typeof Date.prototype.toJSON &&
      ((Date.prototype.toJSON = function() {
        return isFinite(this.valueOf())
          ? this.getUTCFullYear() +
              '-' +
              f(this.getUTCMonth() + 1) +
              '-' +
              f(this.getUTCDate()) +
              'T' +
              f(this.getUTCHours()) +
              ':' +
              f(this.getUTCMinutes()) +
              ':' +
              f(this.getUTCSeconds()) +
              'Z'
          : null;
      }),
      (Boolean.prototype.toJSON = this_value),
      (Number.prototype.toJSON = this_value),
      (String.prototype.toJSON = this_value)),
      'function' != typeof JSON.stringify &&
        ((meta = { '\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"': '\\"', '\\': '\\\\' }),
        (JSON.stringify = function(t, n, e) {
          var i;
          if (((indent = gap = ''), 'number' == typeof e)) for (i = 0; i < e; i += 1) indent += ' ';
          else 'string' == typeof e && (indent = e);
          if ((rep = n) && 'function' != typeof n && ('object' != typeof n || 'number' != typeof n.length))
            throw new Error('JSON.stringify');
          return str('', { '': t });
        })),
      'function' != typeof JSON.parse &&
        (JSON.parse = function(text, reviver) {
          var j;
          function walk(t, n) {
            var e,
              i,
              r = t[n];
            if (r && 'object' == typeof r)
              for (e in r)
                Object.prototype.hasOwnProperty.call(r, e) && (void 0 !== (i = walk(r, e)) ? (r[e] = i) : delete r[e]);
            return reviver.call(t, n, r);
          }
          if (
            ((text = String(text)),
            (rx_dangerous.lastIndex = 0),
            rx_dangerous.test(text) &&
              (text = text.replace(rx_dangerous, function(t) {
                return '\\u' + ('0000' + t.charCodeAt(0).toString(16)).slice(-4);
              })),
            rx_one.test(
              text
                .replace(rx_two, '@')
                .replace(rx_three, ']')
                .replace(rx_four, '')
            ))
          )
            return (j = eval('(' + text + ')')), 'function' == typeof reviver ? walk({ '': j }, '') : j;
          throw new SyntaxError('JSON.parse');
        });
  })(),
  (function(t) {
    if ('object' == typeof exports && 'undefined' != typeof module) module.exports = t();
    else if ('function' == typeof define && define.amd) define([], t);
    else {
      ('undefined' != typeof window
        ? window
        : 'undefined' != typeof global
        ? global
        : 'undefined' != typeof self
        ? self
        : this
      ).protocolCheck = t();
    }
  })(function() {
    return (function o(a, s, u) {
      function c(e, t) {
        if (!s[e]) {
          if (!a[e]) {
            var n = 'function' == typeof require && require;
            if (!t && n) return n(e, !0);
            if (l) return l(e, !0);
            var i = new Error("Cannot find module '" + e + "'");
            throw ((i.code = 'MODULE_NOT_FOUND'), i);
          }
          var r = (s[e] = { exports: {} });
          a[e][0].call(
            r.exports,
            function(t) {
              var n = a[e][1][t];
              return c(n || t);
            },
            r,
            r.exports,
            o,
            a,
            s,
            u
          );
        }
        return s[e].exports;
      }
      for (var l = 'function' == typeof require && require, t = 0; t < u.length; t++) c(u[t]);
      return c;
    })(
      {
        1: [
          function(t, n, e) {
            function l(t, n, e) {
              return t.addEventListener
                ? (t.addEventListener(n, e),
                  {
                    remove: function() {
                      t.removeEventListener(n, e);
                    },
                  })
                : (t.attachEvent(n, e),
                  {
                    remove: function() {
                      t.detachEvent(n, e);
                    },
                  });
            }
            function f(t, n) {
              var e = document.createElement('iframe');
              return (e.src = n), (e.id = 'hiddenIframe'), (e.style.display = 'none'), t.appendChild(e), e;
            }
            function g(t, n, e) {
              var i, r, o, a;
              10 === s()
                ? (function(t, n, e) {
                    var i = setTimeout(n, 1e3);
                    window.addEventListener('blur', function() {
                      clearTimeout(i), e();
                    });
                    var r = document.querySelector('#hiddenIframe');
                    r || (r = f(document.body, 'about:blank'));
                    try {
                      r.contentWindow.location.href = t;
                    } catch (t) {
                      n(), clearTimeout(i);
                    }
                  })(t, n, e)
                : 9 === s() || 11 === s()
                ? (function(t, n, e) {
                    var i = setTimeout(function() {
                        n(), o.remove();
                      }, 1e3),
                      r = document.querySelector('#hiddenIframe');
                    r || (r = f(document.body, 'about:blank'));
                    var o = l(window, 'blur', function() {
                      clearTimeout(i), o.remove(), e();
                    });
                    r.contentWindow.location.href = t;
                  })(t, n, e)
                : ((i = t),
                  (r = n),
                  (o = e),
                  (a = window.open('', '', 'width=0,height=0')).document.write("<iframe src='" + i + "'></iframe>"),
                  setTimeout(function() {
                    try {
                      a.location.href, a.setTimeout('window.close()', 1e3), o();
                    } catch (t) {
                      a.close(), r();
                    }
                  }, 1e3));
            }
            function s() {
              var t = -1;
              if ('Microsoft Internet Explorer' === navigator.appName) {
                var n = navigator.userAgent;
                null != new RegExp('MSIE ([0-9]{1,}[.0-9]{0,})').exec(n) && (t = parseFloat(RegExp.$1));
              } else if ('Netscape' === navigator.appName) {
                n = navigator.userAgent;
                null != new RegExp('Trident/.*rv:([0-9]{1,}[.0-9]{0,})').exec(n) && (t = parseFloat(RegExp.$1));
              }
              return t;
            }
            n.exports = function(t, n, e) {
              function i() {
                n && n();
              }
              function r() {
                e && e();
              }
              if (navigator.msLaunchUri) (s = t), (u = n), (c = e), navigator.msLaunchUri(s, c, u);
              else {
                var o = {
                  isOpera: (a = !!window.opera || 0 <= navigator.userAgent.indexOf(' OPR/')),
                  isFirefox: 'undefined' != typeof InstallTrigger,
                  isSafari: 0 < Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor'),
                  isChrome: !!window.chrome && !a,
                  isIE: !!document.documentMode,
                };
                o.isFirefox
                  ? (function(t, n, e) {
                      var i = document.querySelector('#hiddenIframe');
                      i || (i = f(document.body, 'about:blank'));
                      try {
                        (i.contentWindow.location.href = t), e();
                      } catch (t) {
                        'NS_ERROR_UNKNOWN_PROTOCOL' == t.name && n();
                      }
                    })(t, i, r)
                  : o.isChrome
                  ? (function(t, n, e) {
                      for (
                        var i = setTimeout(function() {
                            n(), o.remove();
                          }, 1e3),
                          r = window;
                        r != r.parent;

                      )
                        r = r.parent;
                      var o = l(r, 'blur', function() {
                        clearTimeout(i), o.remove(), e();
                      });
                      window.location = t;
                    })(t, i, r)
                  : o.isIE && g(t, i, r);
              }
              var a, s, u, c;
            };
          },
          {},
        ],
      },
      {},
      [1]
    )(1);
  });
