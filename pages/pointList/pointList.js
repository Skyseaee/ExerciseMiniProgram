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
    var userInfo = wx.getStorageSync('userInfo')
    this.setData({
      userInfo:userInfo
    })
    this.getIntegral(this.data.page,this.data.limit,userInfo.uid)
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
      title: "研题帮，考试助手 ！",
      path: "pages/index/index",
      imageUrl: "/images/share.png"
    };
  }
})