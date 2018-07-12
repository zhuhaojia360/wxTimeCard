// pages/index/index.js
let app = getApp();
let util = require('../../utils/util');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isShowDialog: false, // 授权提示弹窗

        imgUrls: [
            // 'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
            // 'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
            // 'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'
        ],
        indicatorDots: false,
        autoplay: true,
        interval: 5000,
        duration: 1000,

        category_resp: [], // 货架列表
    },
    obj: {
        mall_id: '', // 商城ID
        category_id: '', // 分类ID
        storage_id: '', // 货架ID
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 商城ID
        this.obj.mall_id = decodeURIComponent(options.mall_id || '');
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

    },

    // banner链接跳转
    jumpToBbannerLink: function (e) {
        wx.navigateTo({
            url: e.currentTarget.dataset.link
        });
    },
    // 跳转到购买页面
    jumpToBuyCard: function (e) {
        wx.navigateTo({
            url: '/pages/buyCard/buyCard?mall_id=' + this.obj.mall_id + '&category_id=' + e.currentTarget.dataset.categoryid + '&storage_id=' + e.currentTarget.dataset.storageid
        });
    },
    // jumpToTopUp: function () {
    //     wx.navigateTo({
    //         url: '/pages/topUp/topUp'
    //     });
    // },
    // jumpToOrderRecord: function () {
    //     wx.navigateTo({
    //         url: '/pages/order/orderRecord'
    //     });
    // },
    // jumpToPay: function () {
    //     wx.navigateTo({
    //         url: '/pages/pay/pay'
    //     });
    // },
    // 我的卡包
    jumpToMyCard: function () {
        wx.navigateTo({
            url: '/pages/cardBag/cardBag'
        });
    },
    // 购买历史
    jumpToBuyOrder: function () {
        wx.navigateTo({
            url: '/pages/buyCard/buyCardHistory?mall_id=' + this.obj.mall_id
        });
    },

    loadData: function () {
        let that = this;
        wx.showLoading({
            title: '加载中',
            mask: true,
            success: function () {
                app.request({
                    url: '/cmallaction/query_mall_info.do',
                    data: {
                        pkid: that.obj.mall_id
                    },
                    success: function (res) {
                        let data = res.data.data;
                        // 商品已下架
                        if (data == null) {
                            wx.navigateTo({
                                url: '/pages/explain/noStock'
                            });
                        }
                        if (data && res.data.retcode == '0') {
                            // 商品已下架
                            if (data.state == 1) {
                                wx.navigateTo({
                                    url: '/pages/explain/noStock'
                                });
                            } else {
                                wx.setNavigationBarTitle({
                                    title: data.topic_name || '首页'
                                })

                                that.obj.mall_id = data.pkid; // 商城ID

                                let arr = data.category_resp || [];
                                for (var i = 0; i < arr.length; i++) {
                                    arr[i].storage_info_list = util.getTwoArr(arr[i].storage_info_list);
                                };

                                that.setData({
                                    imgUrls: [{
                                        "banner_url": data.banner_url,
                                        "banner_link": data.banner_link
                                    }],
                                    category_resp: arr
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

})