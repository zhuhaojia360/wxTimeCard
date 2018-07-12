// pages/buyCard/buyCardResult.js
let app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        info: {},
        goodsCount: '' // 购买张数
    },
    obj: {
        timeoutNo: 0 //循环次数
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 订单号
        this.obj.listid = decodeURIComponent(options.listid || '');
        // 购买份数
        this.obj.goodsCount = decodeURIComponent(options.goodsCount || '');
        this.setData({
            goodsCount: this.obj.goodsCount
        });
        this.loadData();
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

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

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

    // 完成
    jumpToAddCard: function () {
        let that = this;
        wx.showLoading({
            title: '加载中',
            mask: true,
            success: function () {
                app.request({
                    url: '/cmallaction/receive_card.do',
                    data: {
                        listid: that.obj.listid
                    },
                    success: function (res) {
                        var card = res.data.data || [];
                        if (card.length > 0 && res.data.retcode == '0') {
                            var objList = [];
                            for (var i = 0, len = card.length; i < len; i++) {
                                var obj = {};
                                obj.cardId = card[i].real_goods_wxcardid;
                                obj.cardExt = '{"code": "' + card[i].real_goods_code + '", "openid":"", "timestamp": "' + card[i].timestamp + '", "nonce_str":"' + card[i].nonce_str + '", "signature":"' + card[i].signature + '"}';
                                objList.push(obj);
                            }
                            if (objList.length > 0) {
                                wx.addCard({
                                    cardList: objList,
                                    success: function () {
                                        wx.showModal({
                                            title: '提示',
                                            content: '领取成功',
                                            showCancel: false,
                                            success: function (res) {
                                                if (res.confirm) {
                                                    wx.navigateBack();
                                                }
                                            }
                                        });
                                    },
                                    fail: function (err) {
                                        wx.showModal({
                                            title: '提示',
                                            content: err,
                                            showCancel: false
                                        });
                                    }
                                });
                            }
                        }
                    },
                    complete: function (res) {
                        wx.hideLoading();
                    }
                });
            }
        });
    },
    // 返回
    jumpToBack: function () {
        wx.navigateBack();
    },
    // 刷新
    handleRefresh: function () {
        this.loadData();
    },

    loadData: function () {
        var that = this;
        if (!this.obj.listid) {
            wx.showModal({
                title: '出错了',
                content: '订单号为空',
                showCancel: false
            });
            return;
        }
        wx.showLoading({
            title: '加载中',
            mask: true,
            success: function () {
                app.request({
                    url: '/tradeaction/query_trade_order_detail.do',
                    data: {
                        listid: that.obj.listid
                    },
                    success: function (res) {
                        let data = res.data.data;
                        if (data && res.data.retcode == '0') {
                            that.setData({
                                info: data,
                            });

                            // 充值成功或者失败，不刷新数据
                            if (data.state == 4 || data.state == 3) {
                            } else {
                                that.loadResultData();
                            }
                        }
                    },
                    complete: function (res) {
                        wx.hideLoading();
                    }
                });
            }
        });
    },

    loadResultData: function () {
        var that = this;
        app.request({
            url: '/tradeaction/query_trade_order_detail.do',
            data: {
                listid: that.obj.listid
            },
            success: function (res) {
                let data = res.data.data;
                if (data && res.data.retcode == '0') {
                    that.setData({
                        info: data,
                    });

                    that.obj.timeoutNo = that.obj.timeoutNo + 1;
                    // 自动刷新数据,循环10次
                    if (data.state == 4 || data.state == 3 || that.obj.timeoutNo >= 10) {
                        var timer = that.obj.timer;
                        if (timer) {
                            clearTimeout(timer);
                        }
                    } else {
                        that.obj.timer = setTimeout(function () {
                            that.loadResultData();
                        }, 2000);
                    }
                }

            },
            fail: function () {
                var timer = that.obj.timer;
                if (timer) {
                    clearTimeout(timer);
                }
            },
            complete: function () {

            }
        });
    }

})