// pages/exchange/exchange.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //请求配置
    wx.Apis.api.getConfigValue('exchangeCode',(code, data) => {
      that.setData({
        exchangeCode: data.value
      })
    });

    wx.Apis.api.getConfigValue('code_use_days',(code, data) => {
      that.setData({
        code_use_days: data.value
      })
    });
  },

  exchange: function() {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '兑换激活码将消耗' +  parseInt(this.data.exchangeCode) + '积分',
      success (res) {
        if (res.confirm) {
          var userInfo = wx.getStorageSync('userInfo');
          if(parseInt(userInfo.integral) < parseInt(that.data.exchangeCode)) {
            wx.showToast({
              icon: 'error',
              title: '积分不足',
            })
            return false;
          }
          wx.Apis.api.exchangeCode(userInfo.uid, (code, data) => {
            if(code == 200) {
              wx.showToast({
                title: '兑换成功',
              });
              userInfo.integral-=parseInt(that.data.exchangeCode);
              wx.setStorageSync('userInfo', userInfo);
            }else {
              wx.showToast({
                icon: 'error',
                title: '兑换失败',
              })
              return false;
            }
          })
        }
      }
    })
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})