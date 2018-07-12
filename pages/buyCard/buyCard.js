// pages/buyCard/buyCard.js
let app = getApp();
let util = require('../../utils/util');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        isShowDialog: false, // 授权提示弹窗

        imgUrls: [],
        goodsList: [],
        swiperCurrent: 0, // 当前正在显示的 swiper index
        goodsCount: 0,
        goodsCountAmt: '0.00',
    },
    obj: {
        swiperCurrentId: 0, // 当前正在显示的 卡片背景ID
        sele_card_list: [], // 用户选择购买的兑换值列表(用于接口上传参数使用)
        sele_card_list_cal: [], // 用户选择购买的兑换值列表(用于计算)
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 商城ID
        this.obj.mall_id = decodeURIComponent(options.mall_id || '');
        // 分类ID
        this.obj.category_id = decodeURIComponent(options.category_id || '');
        // 货架ID,有可能不传，从初始化数据接口获取
        this.obj.storage_id = decodeURIComponent(options.storage_id || '');
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
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        var timer = this.obj.timer;
        if (timer) {
            clearTimeout(timer);
        }
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

    //swiper滚动时触发
    swiperChange: function (e) {
        this.obj.swiperCurrentId = e.detail.currentItemId;
        this.setData({
            swiperCurrent: e.detail.current
        })
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    // 购买历史
    jumpToBuyOrder: function () {
        wx.navigateTo({
            url: '/pages/buyCard/buyCardHistory?mall_id=' + this.obj.mall_id + '&storage_id=' + this.obj.storage_id
        });
    },

    loadData: function () {
        var that = this;
        // if (!this.obj.storage_id) {
        //     wx.showModal({
        //         title: '出错了',
        //         content: '货架ID为空',
        //         showCancel: false
        //     });
        //     return;
        // }
        wx.showLoading({
            title: '加载中',
            mask: true,
            success: function () {
                app.request({
                    url: '/cmallaction/query_storage_detail.do',
                    data: {
                        pkid: that.obj.storage_id
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
                            // 货架ID
                            that.obj.storage_id = data.pkid
                            // 商品已下架
                            if (data.state == 1) {
                                wx.navigateTo({
                                    url: '/pages/explain/noStock'
                                });
                            } else {
                                wx.setNavigationBarTitle({
                                    title: data.storage_name || '购买货架'
                                })

                                // 默认选取第一个卡片背景
                                that.obj.swiperCurrentId = data.storage_bg_resp_list[0].pkid;
                                let arr = data.storage_bg_resp_list || [];
                                let arrtemp = [];
                                for (let i = 0; i < arr.length; i++) {
                                    let obj = {
                                        id: arr[i].pkid,
                                        imgUrl: arr[i].bg_pic_url,
                                    }
                                    arrtemp.push(obj);
                                };

                                let goodsList = data.storage_goods_info_resp_list || [];
                                for (let j = 0; j < goodsList.length; j++) {
                                    if (goodsList[j].state == 1) {
                                        goodsList.splice(j, 1);
                                    }
                                };
                                let goodsArr = util.getTwoArr(goodsList) || [];

                                that.setData({
                                    imgUrls: arrtemp,
                                    goodsList: goodsArr,
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
    nominalMinusEvent: function (e) {
        this.getSele_card_list(e.detail.pkid, e.detail.buyNumber, e.detail.card_amt);
    },
    nominalAddEvent: function (e) {
        this.getSele_card_list(e.detail.pkid, e.detail.buyNumber, e.detail.card_amt);
    },
    // 组装用户选择的卡片列表
    getSele_card_list: function (id, num, amt) {
        let arr = this.obj.sele_card_list;
        let arr_cal = this.obj.sele_card_list_cal;
        let obj = { id: id, num: num };
        let obj_cal = { id: id, num: num, amt: amt };
        if (arr.length == 0) {
            arr.push(obj);
            arr_cal.push(obj_cal);
        } else {
            let flag = false;
            for (let i = 0, len = arr.length; i < len; i++) {
                if (arr[i].id == obj.id) {
                    flag = true;
                    arr[i].num = obj.num;
                    arr_cal[i].num = obj.num;
                    break;
                }
            }

            if (flag == false) {
                arr.push(obj);
                arr_cal.push(obj_cal);
            }
        }
        this.obj.sele_card_list = arr;
        this.obj.sele_card_list_cal = arr_cal;

        let goodsCount = 0;
        let goodsCountAmt = 0;
        for (let i = 0, len = arr_cal.length; i < len; i++) {
            goodsCount = goodsCount + arr_cal[i].num;
            goodsCountAmt = goodsCountAmt + arr_cal[i].num * arr_cal[i].amt;
        }

        this.setData({
            goodsCount: goodsCount,
            goodsCountAmt: parseFloat(goodsCountAmt).toFixed(2),
        });
    },

    // 过滤掉面额为0的数据
    getFilterArrNum: function (arr) {
        let tempArr = [];
        for (let i = 0, len = arr.length; i < len; i++) {
            if (arr[i].num !== 0) {
                tempArr.push(arr[i]);
            }
        }
        return tempArr;
    },

    buyCard: function () {
        let that = this;

        if (this.data.goodsCount == 0) {
            wx.showToast({
                title: '请选择卡面值/兑换值',
                icon: 'none',
                duration: 2000
            })
            return;
        }

        let prepay_params = {
            mall_id: this.obj.mall_id,
            category_id: this.obj.category_id,
            storage_id: this.obj.storage_id,
            card_bg_id: this.obj.swiperCurrentId,
            buy_rice: this.data.goodsCountAmt,
            card_list: this.getFilterArrNum(this.obj.sele_card_list),
        };
        wx.showLoading({
            title: '加载中',
            mask: true,
            success: function () {
                app.request({
                    url: '/thirdpayaction/prepay.do',
                    data: {
                        pay_biz_type: "mall_storage",
                        pay_client_type: 4,
                        pay_callback_url: "/pages/buyCard/buyCard",
                        prepay_params: JSON.stringify(prepay_params)
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
                                            url: '/pages/buyCard/buyCardResult?listid=' + data.listid + '&goodsCount=' + that.data.goodsCount
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
                                let obj = {
                                    "goodsCount": that.data.goodsCount,
                                    "goodsCountAmt": that.data.goodsCountAmt,
                                };
                                wx.setStorageSync('buyCardResult', obj);
                                wx.navigateTo({
                                    url: '/pages/buyCard/buyCardResult'
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
    }
});