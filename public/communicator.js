function onIframeLoad() {
  console.log('onIframeLoad Loaded');
  let msgId = 0;
  const callbackResults = {};
  const iframe = document.getElementById('COMMUNICATORIFR');
  const communicatorWidow = iframe.contentWindow;
  let keysUseInCommunicator = JSON.parse(lsKeysToUse[0]);
  const src = iframe.src;
  if (src == null || !(src.startsWith('http://') || src.startsWith('https://'))) {
    return;
  }
  const temp = document.createElement('a');
  temp.href = src;
  const origin = temp.origin;
  if (origin === window.origin) {
    return;
  }
  const onTimeOut = msgId => {
    const cb = callbackResults[msgId];
    if (cb != null) {
      cb(new Error('TIME_OUT'));
    }
  };
  const sendRequest = (request, callback, timeout = 2000) => {
    callbackResults[msgId] = callback;
    setTimeout(() => onTimeOut(msgId), timeout);
    communicatorWidow.postMessage({ ...request, msgId: msgId }, origin);
    msgId++;
  };
  const onMessage = e => {
    console.log(e.origin, origin);
    if (e.origin === origin) {
      if (e.data.msgId != null) {
        const cb = callbackResults[e.data.msgId];
        if (cb != null) {
          cb(null, e.data.data);
        }
      }
    }
  };
  window.addEventListener('message', onMessage);
  window.setKey = (key, value) => {
    console.log('setKey', key, keysUseInCommunicator);
    if (keysUseInCommunicator.find(i => i === key) != null) {
      return new Promise((resolve, reject) => {
        sendRequest(
          {
            method: 'setItem',
            param: {
              key,
              value,
            },
          },
          (e, v) => {
            if (e != null) {
              reject(e);
            } else {
              resolve(v);
            }
          }
        );
      });
    } else {
      return Promise.resolve(window.localStorage.setItem(key, value));
    }
  };

  window.getKey = key => {
    console.log('getKey', key, keysUseInCommunicator);
    if (keysUseInCommunicator.find(i => i === key) != null) {
      console.log('getKey', 'use promise');
      return new Promise((resolve, reject) => {
        console.log('getKey', 'send request');
        sendRequest(
          {
            method: 'getItem',
            param: key,
          },
          (e, v) => {
            console.log('getKey', 'result', e, v);
            if (e != null) {
              reject(e);
            } else {
              resolve(v);
            }
          }
        );
      });
    } else {
      console.log('getKey', 'use local');
      return Promise.resolve(window.localStorage.getItem(key));
    }
  };

  window.removeKey = key => {
    console.log('removeKey', key, keysUseInCommunicator);
    if (keysUseInCommunicator.find(i => i === key) != null) {
      return new Promise((resolve, reject) => {
        sendRequest(
          {
            method: 'removeItem',
            param: key,
          },
          (e, v) => {
            if (e != null) {
              reject(e);
            } else {
              resolve(v);
            }
          }
        );
      });
    } else {
      return Promise.resolve(window.localStorage.removeItem(key));
    }
  };
}
