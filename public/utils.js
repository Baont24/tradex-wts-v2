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

var browser = get_browser();

console.log(browser);

if (browser.name !== 'Chrome' && browser.name !== 'Firefox' && browser.name !== 'Safari' && browser.name !== 'Opera') {
  alert(
    'Your browser is not supported for this website. To continue, please visit other browsers such as Google Chrome and Firefox'
  );
}
