// pages/cardBag/cardBag.js
let app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        cardList: []
    },
    obj: {

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

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    // 电子卡信息
    showCardDetail: function (e) {
        let that = this;
        let wxpacket = e.currentTarget.dataset.wxpacket;
        let cardid = e.currentTarget.dataset.cardid;
        let code = e.currentTarget.dataset.code;

        // 未放入微信卡包
        if (wxpacket == 1) {
            let timestamp = parseInt((new Date().getTime()) / 1000);
            let nonce_str = Math.random().toString(36).substr(2, 15);
            app.request({
                url: '/cardaction/gen_card_sign.do',
                data: {
                    code: code,
                    timestamp: timestamp,
                    nonce_str: nonce_str,
                    card_id: cardid
                },
                success: function (res) {
                    let data = res.data.data;
                    if (data && res.data.retcode == '0') {
                        let objList = [{
                            cardId: cardid,
                            cardExt: '{"code": "' + code + '", "openid":"", "timestamp": "' + timestamp + '", "nonce_str":"' + nonce_str + '", "signature":"' + data + '"}'
                        }];
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
                            fail: function (err) {
                                wx.showModal({
                                    title: '提示',
                                    content: err,
                                    showCancel: false
                                });
                            }
                        });
                    }
                },
                complete: function (res) {
                    wx.hideLoading();
                }
            });
        } else {
            wx.openCard({
                cardList: [{
                    cardId: cardid,
                    code: code
                }],
                success: function (res) {
                }
            });
        }
    },

    loadData: function () {
        var that = this;
        wx.showLoading({
            title: '加载中',
            mask: true,
            success: function () {
                app.request({
                    url: '/cardaction/card_list.do',
                    data: {},
                    success: function (res) {
                        let data = res.data.data;
                        if (data && res.data.retcode == '0') {
                            let arr = res.data.data.prepaidCardList.data_list;

                            // 格式化卡号
                            for (let i = 0, len = arr.length; i < len; i++) {
                                arr[i]['codeCnt'] = arr[i]['code'] && arr[i]['code'].replace(/(.{4})/g, "$1 ");
                            }


                            that.setData({
                                cardList: arr,
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