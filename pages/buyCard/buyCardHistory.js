// pages/buyCard/buyCardHistory.js
let app = getApp();
let util = require("../../utils/util");

Page({

    /**
     * 页面的初始数据
     */
    data: {
        orderList: []
    },
    obj: {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 商城ID
        this.obj.mall_id = decodeURIComponent(options.mall_id || '');
        // 货架ID
        this.obj.storage_id = decodeURIComponent(options.storage_id || '');
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

    jumpToBuyCardOrderDetail: function (e) {
        wx.navigateTo({
            url: '/pages/buyCard/buyCardOrderDetail?pkid=' + e.currentTarget.dataset.pkid
        });
    },
    // 领取未成功的卡券
    getCard: function (e) {
        let that = this;
        wx.showLoading({
            title: '加载中',
            mask: true,
            success: function () {
                app.request({
                    url: '/cmallaction/receive_card.do',
                    data: {
                        listid: e.currentTarget.dataset.listid
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
                                            showCancel: false
                                        });
                                        that.loadData();
                                    },
                                    fail: function(err){
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
    loadData: function () {
        var that = this;
        wx.showLoading({
            title: '加载中',
            mask: true,
            success: function () {
                app.request({
                    url: '/cmallaction/query_buy_history.do',
                    data: {
                        pkid: that.obj.mall_id,
                        storage_id: that.obj.storage_id,
                    },
                    success: function (res) {
                        if (res.data.data_list.length > 0 && res.data.retcode == '0') {
                            let arr = res.data.data_list;
                            that.setData({
                                orderList: arr,
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