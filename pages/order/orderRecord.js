// pages/order/orderRecord.js
let app = getApp();

let util = require('../../utils/util');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        isShowDialog: false, // 授权提示弹窗

        info: {},
        orderInfoList: [],
    },
    obj: {
        offset: 0, // 偏移量
        limit: 20, // 每页显示条数
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 加密卡号
        this.obj.encrypt_code = decodeURIComponent(options.encrypt_code || '');
        // this.obj.encrypt_code = "NHBN/Z1BIGGGdrreJlZMdacTUfmzQlYUtevjqCssKXiAGCWwaDzIlp4rS6RtawrG";
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
        this.loadData();
        wx.stopPullDownRefresh();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        this.obj.offset = this.obj.offset + this.obj.limit;
        this.loadData(this.obj.offset);
    },

    jumpToOrderHistory: function () {
        wx.navigateTo({
            url: '/pages/order/orderHistory'
        });
    },
    jumpToOrderDetail: function (e) {
        wx.navigateTo({
            url: '/pages/order/orderDetail?listid=' + e.currentTarget.dataset.listid
        });
    },

    loadData: function (offset = 0) {
        var that = this;
        if (!this.obj.encrypt_code) {
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
                    url: '/tradeaction/query_trade_order_record.do',
                    data: {
                        encrypt_code: that.obj.encrypt_code,
                        offset: offset,
                    },
                    success: function (res) {
                        let data = res.data;
                        let dataList = res.data.data_list;
                        if (data && res.data.retcode == '0') {

                            that.obj.offset = data.offset
                            that.obj.limit = data.limit

                            let arr = that.data.orderInfoList;
                            if (offset === 0) {
                                arr = [];
                            }
                            for (let i = 0, len = dataList.length; i < len; i++) {
                                arr.push(dataList[i]);
                            }
                            that.setData({
                                info: data,
                                orderInfoList: arr
                            });
                        }
                    },
                    complete: function (res) {
                        wx.hideLoading();
                    }
                });
            }
        });
    },
})