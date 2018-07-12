//app.js
App({
    onLaunch: function () {
        console.log('onLaunch');
        wx.clearStorageSync();
    },
    onShow: function () {
        // Do something when show.
        console.log('onShow');
    },
    onHide: function () {
        // Do something when hide.
        console.log('onHide');
    },
    onError: function (msg) {
        console.log('onError');
    },
    login: function (callBackFunc, options) {
        options = options || {};
        var that = this;
        // 获取临时登录凭证
        wx.login({
            success: function (wxloginres) {
                if (wxloginres.code) {
                    // 获取用户信息
                    wx.getUserInfo({
                        withCredentials: true,
                        success: function (wxgetuserres) {
                            // 将key和用户绑定
                            wx.request({
                                url: that.globalData.apiurl + '/wxaaction/login.do',
                                method: 'POST',
                                header: {
                                    'content-type': 'application/x-www-form-urlencoded'
                                },
                                data: {
                                    code: wxloginres.code,
                                    rawData: wxgetuserres.rawData,
                                    signature: wxgetuserres.signature,
                                    encryptedData: wxgetuserres.encryptedData,
                                    iv: wxgetuserres.iv
                                },
                                success: function (syncres) {
                                    if (syncres.data.retcode !== '0' || syncres.statusCode !== 200) {
                                        var flag = false;
                                        if (typeof options.complete === 'function') {
                                            flag = options.complete(syncres, 'wxsyncuser');
                                        }

                                        if (!flag) {
                                            that.parseError(syncres.data);
                                        }
                                        return;
                                    }
                                    // 保存cookie
                                    wx.setStorageSync('sessionid', syncres.header["Set-Cookie"]);
                                    typeof callBackFunc === "function" && callBackFunc(syncres);
                                },
                                fail: function () {

                                },
                                complete: function (syncres) {
                                    if (syncres.statusCode !== 200) {
                                        var flag = false;
                                        if (typeof options.complete === 'function') {
                                            flag = options.complete(syncres, 'wxsyncuser');
                                        }
                                        if (!flag) {
                                            wx.showModal({
                                                title: '出错了',
                                                content: '服务器繁忙,请稍后重试',
                                                showCancel: false
                                            });
                                        }
                                    }
                                }
                            });
                        },
                        fail: function (wxgetuserres) {
                            var flag = false;
                            if (typeof options.complete === 'function') {
                                flag = options.complete(wxgetuserres, 'wxgetuser');
                            }

                            if (!flag) {
                                wx.showModal({
                                    title: '出错了',
                                    content: '获取用户信息失败',
                                    showCancel: false
                                });
                            }
                        },
                        complete: function (res) {

                        }
                    });
                } else {
                    console.log('获取用户登录态code失败:' + wxloginres);
                    var flag = false;
                    if (typeof options.complete === 'function') {
                        flag = options.complete(wxloginres, 'wxlogincode');
                    }

                    if (!flag) {
                        wx.showModal({
                            title: '出错了',
                            content: '获取用户信息失败',
                            showCancel: false
                        });
                    }
                }
            },
            fail: function (wxloginfail) {
                var flag = false;
                if (typeof options.complete === 'function') {
                    flag = options.complete(wxloginfail, 'wxlogin');
                }

                if (!flag) {
                    wx.showModal({
                        title: '出错了',
                        content: '获取用户信息失败',
                        showCancel: false
                    });
                }
            }
        });
    },
    auth: function (callBackFunc) {
        // 获取用户的当前设置
        wx.getSetting({
            success(res) {
                if (!res.authSetting['scope.userInfo']) {
                    wx.hideLoading();
                    wx.showModal({
                        title: '出错了',
                        content: '小程序需要您的授权才能提供更好的服务哦',
                        showCancel: false,
                        success: function (res) {
                            if (res.confirm) {
                                // 调起客户端小程序设置界面
                                wx.openSetting();
                            }
                        }
                    });
                    // 向用户发起授权请求，该wx.authorize接口已经不支持授权弹窗了
                    // wx.authorize({
                    //     scope: 'scope.userInfo',
                    //     success() {
                    //         callBackFunc();
                    //     },
                    //     fail() {
                    //         // 调起客户端小程序设置界面
                    //         wx.openSetting();
                    //     }
                    // });
                } else {
                    callBackFunc();
                }
            }
        });
    },

    // 发起业务请求
    request: function (options, notretry, noCheckAuth, noCheckSession) {
        var that = this;
        if (!noCheckAuth) {// 无授权
            this.auth(function () {
                that.request(options, false, true, false);
            });
        } else if (!noCheckSession) {// 是否校验session_key
            // 当前session_key是否有效
            wx.checkSession({
                success: function () {
                    that.request(options, false, true, true);
                },
                fail: function () {
                    wx.removeStorageSync('sessionid');
                    that.request(options, false, true, true);
                }
            });
        } else {
            var sessionId = wx.getStorageSync('sessionid');
            if (!sessionId) {
                that.login(function () {
                    that.request(options, false, true, true);
                }, options);
                return;
            } else {
                var data = options.data || {};
                var apiurl = options.apiurl || that.globalData.apiurl;
                var header = options.header || {};
                header['content-type'] = header['content-type'] || 'application/x-www-form-urlencoded';
                header['cookie'] = sessionId;

                wx.request({
                    url: apiurl + options.url,
                    method: options.method || 'POST',
                    header: header,
                    data: data,
                    success: function (res) {
                        if (res.data.retcode !== '0' || res.statusCode !== 200) {
                            if (typeof options.fail === 'function') {
                                options.fail(res);
                            } else {
                                that.parseError(res.data);
                            }
                            return;
                        }

                        typeof options.success === 'function' && options.success(res);
                    },
                    dataType: options.dataType || 'json',
                    fail: function (res) {
                        if (typeof options.fail === 'function') {
                            options.fail(res);
                        } else {
                            wx.showModal({
                                title: '出错了',
                                content: '服务器繁忙,请稍后重试',
                                showCancel: false
                            });
                        }
                    },
                    complete: function (res) {
                        var flag = false;
                        if (typeof options.complete === 'function') {
                            flag = options.complete(res, 'request');
                        }

                        if (!flag) {
                            if (res.statusCode !== 200) {
                                wx.showModal({
                                    title: '出错了',
                                    content: '服务器繁忙,请稍后重试',
                                    showCancel: false
                                });
                            }
                        }
                    }
                });
            }
        }
    },
    globalData: {
        // apiurl: 'https://d4.infix.siemin.com/eppc-web'
        apiurl: 'https://testapp.test.siemin.com/eppc-web'
        // apiurl: 'https://eppc.siemin.com/wxapp'
    },
    parseError: function (result) {
        if (result && typeof result.retcode !== 'undefined' && result.retcode !== '0') {
            wx.showModal({
                title: '出错了',
                content: result.retmsg || '服务器繁忙,请稍后重试',
                showCancel: false
            });
        }
    }
})