// pages/order/orderDetail.js
let app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        info:{}
    },
    obj: {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 订单号ID
        this.obj.listid = decodeURIComponent(options.listid || '');
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

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    jumpToCardBag: function () {
        wx.navigateTo({
            url: '/pages/cardBag/cardBag'
        });
    },

    loadData: function () {
        var that = this;
        if (!this.obj.listid) {
            wx.showModal({
                title: '出错了',
                content: '订单号ID为空',
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
                                info:data
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