// components/NominalValue/NominalValue.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    info: {          // 信息数据
      type: Object,
      value: {
        'card_config_name': 'XXX',
        'available_times': 0,
        'card_sku': 0,
        'card_used_sku': 0,
        'card_amt': '0',
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    buyNumber: 0,
    repertory: false // 是否库存不足
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _nominalMinusEvent() {
      let buyNumber = this.data.buyNumber;
      if (buyNumber > 0) {
        buyNumber = buyNumber - 1;
      } else {
        buyNumber = 0;
      }
      this.setData({
        buyNumber: buyNumber,
      });
      // 小于库存，隐藏库存不足
      if (buyNumber <= (this.properties.info.card_sku - this.properties.info.card_used_sku)) {
        this.setData({
          repertory: false
        });
      }
      var obj = {};
      obj.buyNumber = buyNumber;
      obj = Object.assign(obj, this.properties.info);

      var myEventDetail = obj; // detail对象，提供给事件监听函数
      var myEventOption = {}; // 触发事件的选项
      this.triggerEvent('nominalMinusEvent', myEventDetail, myEventOption);
    },
    _nominalAddEvent() {
      let buyNumber = this.data.buyNumber;
      // 大于库存，显示库存不足
      if ((buyNumber + 1) > (this.properties.info.card_sku - this.properties.info.card_used_sku)) {
        this.setData({
          repertory: true
        });
      }
      // 判断购买数量是否大于库存
      if (buyNumber < (this.properties.info.card_sku - this.properties.info.card_used_sku)) {
        buyNumber = buyNumber + 1;
      }
      this.setData({
        buyNumber: buyNumber
      });
      var obj = {};
      obj.buyNumber = buyNumber;
      obj = Object.assign(obj, this.properties.info);

      var myEventDetail = obj; // detail对象，提供给事件监听函数
      var myEventOption = {}; // 触发事件的选项
      this.triggerEvent('nominalAddEvent', myEventDetail, myEventOption);
    }
  }
})
