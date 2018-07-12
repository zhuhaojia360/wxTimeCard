// pages/pay/pay.js
var app = getApp();
var wxbarcode = require('../../utils/code');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        isShowDialog: false, // 授权提示弹窗

        loading: true,
        card: {},
    },
    obj: {
        refresh: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options);
        // 微信加密后的卡号
        this.obj.encrypt_code = decodeURIComponent(options.encrypt_code || '');
        // 卡号
        this.obj.card_code = decodeURIComponent(options.card_code || '');
        // this.obj.card_code = "1000008096349402938";
        this.obj.pcid = decodeURIComponent(options.pcid || '');
        // 卡券ID
        this.obj.card_id = decodeURIComponent(options.card_id || '');
        // this.obj.card_id = '2385';
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        let that = this;
        // 获取用户当前设置
        wx.getSetting({
            success(res) {
                // 没有授权
                if (!res.authSetting['scope.userInfo']) {
                    that.setData({
                        isShowDialog: true
                    });
                    that.handleAutoRefreshAccredit();
                } else {
                    that.loadData();
                }
            }
        });
    },
    confirmEvent: function () {
        this.setData({
            isShowDialog: false
        });
    },
    // 判断用户是否已经点击授权弹窗的允许按钮
    handleAutoRefreshAccredit: function () {
        var that = this;
        var timer = that.obj.timer;
        if (timer) {
            clearTimeout(timer);
        }
        that.obj.timer = setTimeout(function () {
            // 获取用户当前设置
            wx.getSetting({
                success(res) {
                    // 已经授权
                    if (res.authSetting['scope.userInfo']) {
                        that.loadData();
                    } else {
                        that.handleAutoRefreshAccredit();
                    }
                }
            });
        }, 2000);
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        var timer = this.obj.timer;
        if (timer) {
            clearTimeout(timer);
        }

        var timerQR = this.obj.timerQR;
        if (timerQR) {
            clearTimeout(timerQR);
        }

        var timerPayResult = this.obj.timerPayResult;
        if (timerPayResult) {
            clearTimeout(timerPayResult);
        }
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        var timer = this.obj.timer;
        if (timer) {
            clearTimeout(timer);
        }

        var timerQR = this.obj.timerQR;
        if (timerQR) {
            clearTimeout(timerQR);
        }

        var timerPayResult = this.obj.timerPayResult;
        if (timerPayResult) {
            clearTimeout(timerPayResult);
        }
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: '返回首页',
            path: '/pages/index/index'
        }
    },

    // 跳转到充值页面
    jumpToRecharge: function () {
        wx.navigateTo({
            url: '/pages/topUp/topUp?pcid=' + this.obj.pcid + '&encrypt_code=' + this.obj.encrypt_code
        });
    },

    handleRefreshCode: function () {
        if (!this.data.loading) {
            this.loadData();
        }
    },

    // 二维码刷新
    handleAutoRefreshCode: function () {
        var that = this;
        var timerQR = that.obj.timerQR;
        if (timerQR) {
            clearTimeout(timerQR);
        }
        that.obj.timerQR = setTimeout(function () {
            that.loadData();
        }, 60000);
    },

    loadData: function () {
        var that = this;
        if (!this.obj.card_id) {
            wx.showModal({
                title: '出错了',
                content: '卡券ID为空',
                showCancel: false
            });
            return;
        }
        that.obj.loading = true;
        that.setData({
            loading: true
        });
        wx.showLoading({
            title: '加载中',
            mask: true,
            success: function () {
                app.request({
                    url: '/tradeaction/get_user_pay_q_r_code_link.do',
                    data: {
                        encrypt_code: that.obj.encrypt_code,
                        card_code: that.obj.card_code,
                        card_id: that.obj.card_id,
                    },
                    success: function (res) {
                        if (res.data.data) {
                            var card = res.data.data;
                            // times_limit，是否限制次数，仅限于次卡，默认0，1表示不限次数
                            card.flag = card.times_limit === 1 ? true : (card.available_times > 0);
                            var ott_code = card.ott_code;
                            if (card.flag && card.card_code) {
                                card.ott_code_str = card.card_code.replace(/(.{4})/g, "$1 ")
                            }
                            that.setData({
                                loading: false,
                                card: card
                            });
                            if (card.flag) {
                                wxbarcode.barcode('barcode', ott_code, 550, 170);
                                if (card.payment_code_content_type == 1) {
                                    wxbarcode.qrcode('qrcode', ott_code, 330, 330);
                                } else {
                                    wxbarcode.qrcode('qrcode', card.link, 330, 330);
                                }
                            } else {
                                that.obj.refresh = false;
                            }
                            that.loadPayResultData(card);
                        }
                    },
                    complete: function () {
                        wx.hideLoading();
                        that.obj.loading = false;
                        if (that.obj.refresh) {
                            that.handleAutoRefreshCode();
                        }
                        that.setData({
                            loading: false
                        });
                    }
                });
            }
        });
    },
    // 获取付款结果数据
    loadPayResultData: function (card) {
        var that = this;
        app.request({
            url: '/tradeaction/check_cashier_collect_money.do',
            data: {
                ottCode: card.ott_code,
                paramSign: card.param_sign,
            },
            success: function (res) {
                let data = res.data.data;
                if (data && res.data.retcode == '0') {
                    // 交易成功
                    if (data.state === 4) {
                        var timerPayResult = that.obj.timerPayResult;
                        if (timerPayResult) {
                            clearTimeout(timerPayResult);
                        }

                        wx.navigateTo({
                            url: '/pages/pay/payResult'
                        });
                    } else {
                        that.obj.timerPayResult = setTimeout(function () {
                            that.loadPayResultData(card);
                        }, 2000);
                    }
                } else {
                    that.obj.timerPayResult = setTimeout(function () {
                        that.loadPayResultData(card);
                    }, 2000);
                }
            },
            fail: function () {
                var timerPayResult = that.obj.timerPayResult;
                if (timerPayResult) {
                    clearTimeout(timerPayResult);
                }
            },
            complete: function () {

            }
        });
    }
})