// pages/topUp/topUp.js
let app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        isShowDialog: false, // 授权提示弹窗

        cardSelected: 1,                        // 当前选中的卡面下标, -1 表示未选中
        info: {},
        guideCheck: true,
        payAmt: 0, // 支付金额
        goodsCount: 0, // 到账次数
    },
    obj: {
        cardid:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 加密卡号
        console.log(options);
        this.obj.encrypt_code = decodeURIComponent(options.encrypt_code || '');
        // 卡券ID
        this.obj.pcid = decodeURIComponent(options.pcid || '');
        // this.obj.pcid = '2385';
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

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        var timer = this.obj.timer;
        if (timer) {
            clearTimeout(timer);
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

    jumpToGuide: function () {
        wx.navigateTo({
            url: '/pages/topUp/topUpExplain'
        });
    },
    // 电子卡指引
    isSelectedGuide: function () {
        this.setData({
            guideCheck: !this.data.guideCheck
        });
    },
    // 卡面选择
    selectCardTopUp: function (e) {
        var index = parseInt(e.currentTarget.dataset.index, 10);
        var payAmt = parseFloat(e.currentTarget.dataset.payamt).toFixed(2);
        var cardtimes = e.currentTarget.dataset.cardtimes;

        this.setData({
            cardSelected: index,
            payAmt: payAmt,
            goodsCount: cardtimes,
        });
    },
    // 充值
    topUp: function () {
        let that = this;
        if (!this.data.guideCheck) {
            wx.showToast({
                title: '请勾选《电子卡指引》',
                icon: 'none',
                duration: 2000
            })
            return;
        }
        if (!this.obj.cardid) {
            wx.showModal({
                title: '出错了',
                content: '卡号ID为空',
                showCancel: false
            });
            return;
        }
        wx.showLoading({
            title: '加载中',
            mask: true,
            success: function () {
                app.request({
                    url: '/tradeaction/recharge_pcard.do',
                    data: {
                        h5_pay_amount: that.data.payAmt,
                        amt: that.data.payAmt,
                        changed_times: that.data.goodsCount,
                        cardid: that.obj.cardid,
                        client_type: 4
                    },
                    success: function (res) {
                        let data = res.data.data;
                        if (data && res.data.retcode == '0') {
                            if (data.need_wx_pay) {
                                var payInfo = JSON.parse(data.pay_info);
                                wx.requestPayment({
                                    'timeStamp': payInfo.timeStamp,
                                    'nonceStr': payInfo.nonceStr,
                                    'package': payInfo['package'],
                                    'signType': payInfo.signType,
                                    'paySign': payInfo.paySign,
                                    'success': function (payres) {
                                        wx.navigateTo({
                                            url: '/pages/topUp/topUpResult?listid=' + data.listid + '&goodsCount=' + that.data.goodsCount
                                        });
                                    },
                                    'fail': function (payres) {
                                        console.log("支付失败");
                                        console.log(payres);
                                    },
                                    'complete': function (payres) {
                                        console.log(payres);
                                    }
                                });
                            } else {
                                wx.navigateTo({
                                    url: '/pages/topUp/topUpResult?listid=' + data.listid + '&goodsCount=' + that.data.goodsCount
                                });
                            }
                            
                        }
                    },
                    complete: function () {
                        wx.hideLoading();
                    }
                });
            }
        });
    },
    loadData: function () {
        let that = this;
        if (!this.obj.encrypt_code) {
            wx.showModal({
                title: '出错了',
                content: '加密卡号为空',
                showCancel: false
            });
            return;
        }
        if (!this.obj.pcid) {
            wx.showModal({
                title: '出错了',
                content: '卡卷ID为空',
                showCancel: false
            });
            return;
        }
        wx.showLoading({
            title: '加载中',
            mask: true,
            success: function () {
                app.request({
                    url: '/cmallaction/query_pcard_amount_info.do',
                    data: {
                        encrypt_code: that.obj.encrypt_code,
                        pcid: that.obj.pcid
                    },
                    success: function (res) {
                        let data = res.data.data;
                        if (data && res.data.retcode == '0') {
                            that.obj.cardid = data.code;
                            that.setData({
                                goodsCount:data.card_times1,
                                payAmt:data.card_amount1,
                                info:data
                            });
                        }
                    },
                    complete: function () {
                        wx.hideLoading();
                    }
                });
            }
        });
    },
})