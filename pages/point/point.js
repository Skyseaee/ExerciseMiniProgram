// pages/point/point.js
var videoAd = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page:1,
    limit:15,
    nodata:true,
    integralList:[],
    moreData: true,//更多数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var userInfo = wx.getStorageSync('userInfo')
    this.setData({
      userInfo:userInfo
    })
    this.getIntegral(this.data.page,this.data.limit,userInfo.uid);
    if (wx.createRewardedVideoAd) {
      videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-3199944fae31efe9'
      })
      videoAd.onError((err) => {})
      try{
          if(videoAd.closeHandler){
            videoAd.offClose(videoAd.closeHandler);
            console.log("---videoAd.offClose 卸载成功---");
          }
      } catch (e) {
          console.log("---videoAd.offClose 卸载失败---");
          console.error(e);
      }
      videoAd.closeHandler = function (res) {
        // 用户点击了【关闭广告】按钮
        
        if (res && res.isEnded || res === undefined) {
            // 正常播放结束，可以下发奖励
              console.log("播放完毕");
              wx.Apis.api.addVideoPoints(userInfo.uid, (code, data) => {
                if (code == 200) {
                  userInfo.integral+= parseInt(data.point);
                  wx.setStorageSync('userInfo', userInfo);
                  that.setData({
                    userInfo: userInfo
                  })
                  wx.showToast({
                    title: '获取积分成功',
                  })
                }
              })
            } else {
                //提前关闭小程序
            }
        };
        videoAd.onClose(videoAd.closeHandler);
    }
  },

  //请求数据
  getIntegral(page,limit,uid){
    var that = this;
    wx.showLoading({
      title: '加载中',
      mask:true,
      icon: 'loading'
    })
    wx.Apis.api.getUserIntegral(page,limit,uid,(code, data) => {
      var integralList = that.data.integralList;
      var page = that.data.page;
      console.log(data.length)
      if(data.length){
        data.forEach(v => {
          integralList.push(v)
        });
        that.setData({
          integralList:integralList,
          page:page+1,
          nodata:false
        })
      }else{
        that.setData({
          integralList:integralList,
          moreData:false
        })
      }
      
      setTimeout(function(){
        wx.hideLoading({
          success: (res) => {},
        })
      },1000);
    });
  },

  goRule: function() {
    wx.navigateTo({
      url: '/pages/pointRule/pointRule',
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
    var that = this;
    this.setData({
      userInfo:wx.getStorageSync('userInfo')
    })
  },

  goList: function() {
    wx.navigateTo({
      url: '/pages/pointList/pointList',
    })
  },

  goCategory: function() {
    wx.switchTab({
      url: '/pages/category/category',
    })
  },

  seeVideo: function() {
    if (videoAd) {
      videoAd.show().catch(() => {
        // 失败重试
        videoAd.load()
          .then(() => videoAd.show())
          .catch(err => {
            console.log('激励视频 广告显示失败')
          })
      })
    }
  },

  goExchange: function() {
    wx.navigateTo({
      url: '/pages/exchange/exchange',
    })
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
    if(this.data.moreData){
      this.getIntegral(this.data.page, this.data.limit,this.data.userInfo.uid);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: "智慧考题宝，考试助手 ！",
      path: "pages/index/index",
      imageUrl: "/images/share.png"
    };
  }
})