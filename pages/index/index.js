const app = getApp()

Page({
  data: {
    bannerList: [],
    firstCategory1: [],
    firstCategory2: [],
    notice: '',
  },
  onLoad() {
    var that = this;
    // if (wx.getUserProfile) {
    //   this.setData({
    //     canIUseGetUserProfile: true
    //   })
    // }
    
    //请求轮播图数据
    wx.Apis.api.bannerList((code, data) => {
      that.setData({
        bannerList: data,
        notice: wx.getStorageSync('notice')
      })
    });
    //一级分类
    wx.Apis.api.firstShowCategory((code, data) => {
      let firstCategory1 = [];
      let firstCategory2 = [];
      if (data.length < 4) {
        for (let i = 0; i < 3; i++) {
          firstCategory1.push(data[i]);
        }
        firstCategory1.push({'id':0,'name':'更多','pic_url':''})
      } else {
        for (let i = 0; i < 4; i++) {
          firstCategory1.push(data[i]);
        }
        if(data.length >= 8){
          for (let i = 4; i < 7; i++) {
            firstCategory2.push(data[i]);
          }
        }else{
          for (let i = 4; i < data.length; i++) {
            firstCategory2.push(data[i]);
          }
        }
        firstCategory2.push({'id':0,'name':'更多','pic_url':'https://treasure.mambaxin.com/uploads/question/20221110/636d1b7192033.png'})
      }
      console.log(firstCategory1)
      that.setData({
        firstCategory1: firstCategory1,
        firstCategory2: firstCategory2
      })
    });
  },
  onShow() {
    var userInfo = wx.getStorageSync('userInfo');
    if(userInfo){
        this.setData({
            myCategory: wx.getStorageSync('myCategory')
        })
    }
  },
  goCategry(t){
    var id = t.currentTarget.dataset.id;
    app.globalData.mainActiveIndex = id;
    wx.switchTab({
      url: '/pages/category/category',
    })
  },
  goDetail(t) {
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + t.currentTarget.dataset.id + '&name=' + t.currentTarget.dataset.name + '&time=' + t.currentTarget.dataset.time
    })
  },
  onShareAppMessage: function () {
    return {
      title: "智慧考题宝，考试助手 ！",
      path: "pages/index/index",
      imageUrl: "/images/share.png"
    };
},
})