// pages/rank/rank.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rankList:[],
    page:1,
    limit:20,
    nodata:true,
    moreData: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    console.log(e.id)
    this.setData({
      id:e.id
    })
    this.getRankList(e.id,this.data.page,this.data.limit);
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

  goBack(){
    wx.navigateBack({

    })
  },

  //排行榜
  getRankList(id,page,limit){
    var that = this;
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    var params = {id:id,page:page,limit:limit}
    wx.Apis.api.getRankList(params,(code, data) => {
      var rankList = that.data.rankList;
      var page = that.data.page;
      console.log(data.length)
      if(data.length){
        data.forEach(v => {
          rankList.push(v)
        });
        that.setData({
          rankList:rankList,
          page:page+1,
          nodata:false
        })
      }else{
        that.setData({
          rankList:rankList,
          moreData:false
        })
      }
      
      setTimeout(function(){
        wx.hideLoading({
          success: (res) => {},
        })
      },1500);
    })
  },

  onReachBottom: function () {
    if(this.data.moreData){
      this.getRankList(this.data.id,this.data.page, this.data.limit);
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: "考题星，考试助手 ！",
      path: "pages/index/index",
      imageUrl: "/images/share.png"
    };
  },
})