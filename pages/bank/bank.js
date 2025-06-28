// pages/bank/bank.js
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
    wx.setNavigationBarTitle({
      title: options.name,
    })
    wx.showLoading({
      title: '',
    })
    wx.Apis.api.categoryList(options.id, (code, data) => {
      if(data.length){
        data.forEach(v => {
          v.start = v.start_time.substr(0,10)
          v.end = v.end_time.substr(0,10)
        })
      }
      that.setData({
          categoryList: data
      })
      wx.hideLoading({})
  });
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

  detail: function (t) {
    console.log(t)
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + t.currentTarget.dataset.id + '&name=' + t.currentTarget.dataset.name + '&count=' + t.currentTarget.dataset.count + '&time=' + t.currentTarget.dataset.time
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: "研题帮，考试助手 ！",
      path: "pages/index/index",
      imageUrl: "/images/share.png"
    };
  }
})