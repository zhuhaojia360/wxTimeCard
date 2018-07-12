// pages/order/orderHistory.js
let app = getApp();
let util = require('../../utils/util');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        info: {},
        orderInfoList: [],
    },
    obj: {
        offset: 0, // 第一页
        limit: 20, // 每页显示条数
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
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

    jumpToOrderDetail: function (e) {
        wx.navigateTo({
            url: '/pages/order/orderDetail?listid=' + e.currentTarget.dataset.listid
        });
    },

    loadData: function (offset = 0) {
        var that = this;
        wx.showLoading({
            title: '加载中',
            mask: true,
            success: function () {
                app.request({
                    url: '/tradeaction/query_trade_order_record.do',
                    data: {
                        limit: that.obj.limit,
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