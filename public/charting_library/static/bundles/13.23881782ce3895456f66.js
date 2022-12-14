webpackJsonp([13], {
  1194: function(t, e, n) {
    'use strict';
    function r(t, e, n, r) {
      return l.__awaiter(this, void 0, void 0, function() {
        var a;
        return l.__generator(this, function(o) {
          return (
            (a = new s.SaveRenameDialog({
              fields: [new h.InputField({ name: w, label: t + ':', error: e, maxLength: 64 })],
              title: n,
            })),
            void 0 !== r && a.setField(w, r),
            [
              2,
              a.show().then(function(t) {
                return t[w];
              }),
            ]
          );
        });
      });
    }
    function a(t) {
      return l.__awaiter(this, void 0, void 0, function() {
        return l.__generator(this, function(e) {
          return [2, r(f.labelRename, f.error, f.titleRename, t)];
        });
      });
    }
    function o(t) {
      return l.__awaiter(this, void 0, void 0, function() {
        return l.__generator(this, function(e) {
          return [2, r(f.labelRename, f.error, f.titleCopy, f.valueCopy.format(t))];
        });
      });
    }
    function i(t) {
      return l.__awaiter(this, void 0, void 0, function() {
        return l.__generator(this, function(e) {
          return [2, r(f.labelRename, f.error, f.titleNew, t)];
        });
      });
    }
    function u(t) {
      '/chart/' === location.pathname && (location.href = '/chart/' + t);
    }
    function c() {
      return l.__awaiter(this, void 0, void 0, function() {
        return l.__generator(this, function(t) {
          return [
            2,
            new Promise(function(t) {
              v.enabled('saved_charts_count_restriction') && !window.user.is_pro
                ? _.getCharts(function(e) {
                    t(e.length < 5);
                  })
                : t(!0);
            }),
          ];
        });
      });
    }
    var l, s, h, _, v, d, f, w, m;
    Object.defineProperty(e, '__esModule', { value: !0 }),
      (l = n(0)),
      (s = n(396)),
      (h = n(395)),
      (_ = n(92)),
      (v = n(5)),
      (d = n(40)),
      (f = {
        labelName: window.t('Chart layout name'),
        labelRename: window.t('Enter a new chart layout name'),
        error: window.t('Please enter chart layout name'),
        titleNew: window.t('Save New Chart Layout'),
        titleRename: window.t('Rename Chart Layout'),
        titleCopy: window.t('Copy Chart Layout'),
        valueCopy: window.t('{0} copy', { context: 'ex: AAPL chart copy' }),
      }),
      (w = 'chart-title'),
      (m = (function() {
        function t(t, e) {
          (this._chartWidgetCollection = t), (this._chartSaver = e);
        }
        return (
          (t.prototype.tryCloneChart = function() {
            var t = this;
            !(function() {
              l.__awaiter(t, void 0, void 0, function() {
                var t, e, n;
                return l.__generator(this, function(r) {
                  switch (r.label) {
                    case 0:
                      return (t = this._chartWidgetCollection), [4, c()];
                    case 1:
                      return (e = r.sent()), e ? [4, o(t.metaInfo.name.value())] : [3, 3];
                    case 2:
                      return (n = r.sent()), this._saveCurrentChartAsNewWithTitle(n), [3, 3];
                    case 3:
                      return [2];
                  }
                });
              });
            })();
          }),
          (t.prototype.tryRenameChart = function() {
            var t = this;
            !(function() {
              l.__awaiter(t, void 0, void 0, function() {
                var t, e, n;
                return l.__generator(this, function(r) {
                  switch (r.label) {
                    case 0:
                      return (t = this._chartWidgetCollection), (e = t.metaInfo.name.value()), [4, a(e)];
                    case 1:
                      return (n = r.sent()), t.metaInfo.name.setValue(n), this._doSave(), [2];
                  }
                });
              });
            })();
          }),
          (t.prototype.trySaveNewChart = function() {
            var t = this;
            !(function() {
              l.__awaiter(t, void 0, void 0, function() {
                var t, e, n, r;
                return l.__generator(this, function(a) {
                  switch (a.label) {
                    case 0:
                      return (t = this._chartWidgetCollection), (e = t.metaInfo.name.value()), [4, c()];
                    case 1:
                      return (n = a.sent()), n ? [4, i(e)] : [3, 3];
                    case 2:
                      return (r = a.sent()), t.metaInfo.name.setValue(r), this._doSave(), [3, 3];
                    case 3:
                      return [2];
                  }
                });
              });
            })();
          }),
          (t.prototype.trySaveExistentChart = function() {
            this._doSave();
          }),
          (t.prototype._saveCurrentChartAsNewWithTitle = function(t) {
            var e = this._chartWidgetCollection;
            v.enabled('saveload_storage_customization')
              ? (e.metaInfo.uid.deleteValue(), e.metaInfo.id.deleteValue(), e.metaInfo.name.setValue(t), this._doSave())
              : window.open('/chart/?clone=' + e.metaInfo.uid.value() + '&name=' + encodeURIComponent(t), '_blank');
          }),
          (t.prototype._doSave = function() {
            var t = this._chartWidgetCollection;
            this._chartSaver.saveChartSilently(function() {
              d.trackEvent('GUI', 'Save Chart Layout'), u(t.metaInfo.uid.value());
            });
          }),
          t
        );
      })()),
      (e.SaveAsService = m);
  },
});
