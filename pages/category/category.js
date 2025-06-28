// pages/category/category.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    items: [],
    mainActiveIndex: 0,
    activeId: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.showLoading({})
    //请求一二级分类数据
    wx.Apis.api.firstCategoryList((code, data) => {
      wx.hideLoading({})
      that.setData({
        items: data
      })
      if (app.globalData.mainActiveIndex == 0) {
        that.setData({
          mainActiveIndex: 0,
          firstCategoryName: data[0].text
        })
      } else {
        data.forEach((item, index) => {
          if (item.id == app.globalData.mainActiveIndex) {
            that.setData({
              mainActiveIndex: index,
              firstCategoryName: item.text
            })
          }
        })
      }
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
    var that = this;
    that.setData({
      activeId: null
    })
    if(that.data.items.length){
      if (app.globalData.mainActiveIndex == 0) {
        that.setData({
          mainActiveIndex: 0,
          firstCategoryName: that.data.items[0].text
        })
      } else {
        that.data.items.forEach((item, index) => {
          if (item.id == app.globalData.mainActiveIndex) {
            that.setData({
              mainActiveIndex: index,
              firstCategoryName: that.data.items[index].text
            })
          }
        })
      }
    }
  },
  onClickNav({
    detail = {}
  }) {
    var index = detail.index || 0;
    app.globalData.mainActiveIndex = this.data.items[index].id;
    this.setData({
      mainActiveIndex: index,
      firstCategoryName: this.data.items[index].text
    });
  },
  goCategory({
    detail = {}
  }) {
    const activeId = this.data.activeId === detail.id ? null : detail.id;
    console.log(this.data.firstCategoryName)
    console.log(activeId)
    this.setData({
      activeId
    });
    wx.navigateTo({
      url: '/pages/course/course?id=' + activeId + '&firstCategoryName=' + this.data.firstCategoryName + '&secondCategoryName=' + detail.text,
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
  },
})