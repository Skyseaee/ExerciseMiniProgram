// pages/code/code.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[],
    nodata:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var userInfo = wx.getStorageSync('userInfo');
    wx.Apis.api.userCodeList(userInfo.uid, (code, data) => {
      if(data.length) {
        that.setData({
          nodata: false
        })
      }
      that.setData({
        list:data
      })
    })
  },

  copy: function (e){
    wx.setClipboardData({
      data:e.currentTarget.dataset.code,
      success: function (res) {

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