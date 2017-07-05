/* eslint-disable */
let cbID = 0;
// 升权之后 按情况更新之前请求参数的 write_access_token
function refreshRequestParamsToken(params) {
  const data = params.data;
  if (data && data.aid) {
    if (data.write_access_token) {
      xqBridge.getWriteToken({
        aid: data.aid,
        success: function (token) {
          params.data.write_access_token = token;
          xqBridge.render(params);
        }
      });
    } else {
      xqBridge.render(params);
    }
  }
}
// 检测是否需要升权
function processExpireToken(ret, params) {
  const successCb = params.success;
  // 70005 过期 重新输入密码
  // 70006 券商服务器重启 数据丢失 重绑
  // 70015 第一证券
  if (ret && (ret.result_code == 70005 || ret.result_code == 70006 || ret.result_code == 70015)) {
    if (Util.appVersion() >= 6.5 && ret.result_data && ret.result_data.page_type && ret.result_data.page_type == 2) {
      ret.result_data.tid = ret.result_data.tid || ret.result_data.oauth_params.tid;
      if (!window.hasRedirect) {
        window.hasRedirect = true;

        xqBridge.refreshBrokerToken({
          data: ret,
          success: function (obj) {
            // 拿到token之后用新token 去请求
            if (params.name === "request") {
              window.hasRedirect = false;
              refreshRequestParamsToken(params);
            }
          },
          cancel: function () {
            window.hasRedirect = false;
            if (typeof params.error === 'function') {
              params.error(ret);
            }
          }
        });
      }
    } else {
      let url = ret.refresh_url || ret.rebind_url;

      if (url) {
        if (!window.hasRedirect) {
          window.hasRedirect = true;
          if (url.search('xueqiu.com') === -1) {
            url = "/broker/proxy?url=" + encodeURIComponent(url)
          } else {
            url = encodeURI(url)
          }
          xqBridge.showLoading();
          xqBridge.redirect({
            url: url,
            type: "MODAL",
            success: function () {
              if (params.name === "request") {
                window.hasRedirect = false;
                refreshRequestParamsToken(params);
              }
            },
            cancel: function () {
              window.hasRedirect = false;
              if (typeof params.error === 'function') {
                params.error(ret);
              }
            }
          });
        }
      }
    }
  } else if (ret && ret.result_code == 70008) {
    // 手机号码没有验证
    xqBridge.verifyTelephone({
      type: "bind",
      success: function () {
        if (params.name === "request") {
          xqBridge.render(params);
        }
      },
      cancel: function () {
        if (typeof params.error === 'function') {
          params.error(ret);
        }
      }
    });
  } else {
    if (successCb) {
      if (typeof successCb === 'function') {
        successCb(ret)
      } else {
        window[successCb] && window[successCb](ret);
      }
    }
  }
}
// 把回调函数绑定到window上
function changeCallback(params) {
  // token 过期 拦截success
  if (params.name === "request") {
    const rawParams = Object.assign({}, params);
    // 如果success 是函数 不是cb1  或者未定义
    if (typeof params.success === 'function' || params.success === 'undefined') {
      params.success = function (ret) {
        processExpireToken(ret, rawParams);
      }
    }
  }
  const cbs = ['success', 'cancel', 'error', 'complete', 'action'];
  cbs.map((cb) => {
    if (params[cb]) {
      const cbName = 'cb' + (++cbID);
      const realCb = params[cb];
      params[cb] = cbName;
      window[cbName] = (data) => {
        if (typeof data === 'string') {
          data = decodeURIComponent(data);
          if (/^\{.*\}$/.test(data) || (/^\[.*\]$/).test(data)) {
            data = JSON.parse(data);
          }
        }
        realCb(data);
        if (cb !== 'action') {
          console.log('delete ' + cbName);
        }
      };
    }
  });
}
const xqBridge = {
  hideLoading($ele) {
    if ($ele) {
      if ($ele.target) {
        $ele.target.disabled = false;
      } else {
        $ele.disabled = false;
      }
    }
    this.render('hideloading');
  },
  showLoading($ele) {
    if ($ele) {
      if ($ele.target) {
        $ele.target.disabled = true;
      } else {
        $ele.disabled = true;
      }
    }
    this.render('showloading');
  },
  goToTradeHome() {
    this.render('goToTradeHome');
  },
  redirect(options) {
    if (!navigator.userAgent.toUpperCase().match('XUEQIU')) {
      location.href = options.url
    }else if(options.url.startsWith('/')){
      options.url = 'https://baoxian.xueqiu.com' + options.url
    }
    if (options && typeof options === 'object') {
      options.name = 'redirect';
    }
    if (options.url && options.url.indexOf('broker/proxy') > -1) {
      options.url += '&hasEncode=1';
    }
    this.render(options);
  },
  request(options) {
    if (options && typeof options === 'object') {
      options.name = 'request';
      if (!options.type) {
        options.type = 'GET';
      }
      if (options.data && !!options.data.tid && Util.appVersion() >= 7.7) {
        if (options.url.search('/tc/snowx/') !== -1) {
          options.url = options.url.replace('/snowx/', '/snowx/' + options.data.tid.toUpperCase() + '/');
        } else {
          options.url = options.url.replace('/tc/', '/tc/' + options.data.tid.toUpperCase() + '/');
        }
      }
    }
    this.render(options);
  },
  encryptWithRSA(options) {
    if (options && typeof options === 'object') {
      options.name = 'encryptWithRSA';
      options.origin = options.origin + '';
    }
    this.render(options);
  },
  pickPhoto(options) {
    if (options && typeof options === 'object') {
      options.name = 'pickPhoto';
    }
    this.render(options);
  },
  // 调用客户端弹层
  confirm(options) {
    if (options && typeof options === 'object') {
      options.name = 'confirm';
      options.nativeCallback = function() {
        let result = confirm(options.message)
        if (result) {
          options.success()
        }
      }
    }
    this.render(options);
  },
  alert(options) {
    if (!navigator.userAgent.toUpperCase().match('XUEQIU')) {
      alert(options.message)
    } else {
      if (options && typeof options === 'object') {
        options.name = 'alert';
        options.nativeCallback = function() {
          alert(options.message)
        }
      }
      this.render(options);
    }
  },
  // get方法集合
  getUserInfo(options) {
    if (options && typeof options === 'object') {
      options.name = 'getUserInfo';
    }
    this.render(options);
  },
  getAccessToken: function (options) {
    if (options && typeof options === 'object') {
      options.name = "getAccessToken";
    }

    this.render(options);
  },
  /**
   * 获取指定绑定券商的写token
   * {aid:aid}
   * @param options
   */
  getWriteToken(options) {
    if (options && typeof options === 'object') {
      options.name = 'getWriteToken';
    }
    this.render(options);
  },
  setRightNavigationButton(options) {
    if (options && typeof options === 'object') {
      options.name = 'setRightNavigationButton';
    }
    this.render(options);
  },
  addHelpButton() {
    this.setRightNavigationButton({
      title: '电话帮助',
      action: () => {
        location.href = 'tel://4006858589';
      },
    });
  },
  startPAOpenAccountVideo(options) {
    if (options && typeof options === 'object') {
      options.name = 'startPAOpenAccountVideo';
    }
    this.render(options);
  },
  /**
   * SNB事件统计
   * 对照文档：http://docs.snowballfinance.com/pages/viewpage.action?pageId=3081077
   * @param options (page:页面ID type int, event:控件类型 type int, info: 附加信息 type obj)
   */
  SNBTrackEvent (options) {
    if (Util.appVersion() < 7.6) {
      return false;
    }
    if (navigator.userAgent.indexOf('Android') > 0 && Util.appVersion() < 7.8) {
      return false;
    }
    if (options && typeof options === 'object') {
      options.name = 'SNBTrackEvent';
    }
    this.render(options);
  },
  refreshBrokerToken: function (options) {
    if (options && typeof options === 'object') {
      options.name = 'refreshBrokerToken';
    }
    this.render(options);
  },
  /**
   * 验证电话号码
   * @param options
   */
  verifyTelephone: function (options) {
    if (options && typeof options === 'object') {
      options.name = 'verifyTelephone';
    }
    this.render(options);
  },
  /**
   * 分享
   *
   * @param options
   */
  share: function (options) {
    if (options && typeof options === 'object') {
      options.name = "share";
    }
    this.render(options);
  },
  /**
   * 更新券商的tid, aid, writetoken
   * 在绑定成功的 回调页面 或者 验证密码成功的回调页面调用
   * @param options
   */
  updateBroker: function (options) {
    if (options && typeof options === 'object') {
      options.name = 'updateBroker';
    }
    this.render(options);
  },
  /**
   * 通知客户端更新券商列表
   */
  updateBrokerList: function () {
    this.render('updateBrokerList');
  },
  render(params) {
    if (!params) {
      return '';
    }
    if (!navigator.userAgent.toUpperCase().includes('XUEQIU')) {
      console.log(params)
      if (params['nativeCallback']) {
        params['nativeCallback']()
      }
      return
    }
    // setToolbar 需要特殊处理一下 他的action 在buttons里面
    if (params.name === "setToolbar" && params.buttons && params.buttons.length) {
      if (!window.isSetToolbar) {
        // set toolbar  只绑定一次
        window.isSetToolbar = true;
        params.buttons.forEach(function (button) {
          changeCallback(button);
        });
      } else {
        return false;
      }
    } else if (params.name === "setRightNavigationButton") {
      // 也只绑一次
      if (!window.isSetRightNavigationButton) {
        window.isSetRightNavigationButton = true;
        changeCallback(params)
      } else {
        return false;
      }
    } else {
      changeCallback(params)
    }
    let iframe = document.createElement('iframe');
    const parameters = typeof params === 'object' ? JSON.stringify(params) : params;
    iframe.setAttribute('frameborder', 'no');
    iframe.setAttribute('border', '0');
    iframe.setAttribute('height', '0');
    iframe.setAttribute('width', '0');
    iframe.setAttribute('src', 'js://' + encodeURIComponent(parameters));
    document.documentElement.appendChild(iframe);
    iframe.parentNode.removeChild(iframe);
    iframe = null;
  },
};
export default xqBridge;