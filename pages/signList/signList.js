// pages/signList/signList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
      loading:false,
      loadend:false,
      loadtitle:'加载更多',
      page:1,
      limit:10,
      signList:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      
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
      this.getSignMoneList();
  },

  /**
 * 获取签到记录列表
*/
  getSignMoneList:function(){
      var that = this;

      if(that.data.loading) return;
      if(that.data.loadend) return;
      that.setData({loading:true,loadtitle:""});
      var params = {'uid':that.data.userInfo.uid,'page':1,'limit':10};
      wx.Apis.api.getSignMonthList(params,(code, data) => {
          var list = data.data;
          var loadend=list.length < that.data.limit;
          that.data.signList = that.SplitArray(list,that.data.signList);
          that.setData({
              signList:that.data.signList,
              loadend:loadend,
              loading:false,
              loadtitle:loadend ? "已加载完":"加载更多"
            });
      },function(){
          that.setData({ loading: false, loadtitle:'加载更多'});
      });
  },
  SplitArray: function (list, sp) {
      if (typeof list != 'object') return [];
      if (sp === undefined) sp = [];
      for (var i = 0; i < list.length; i++) {
          sp.push(list[i]);
      }
      return sp;
  },

   /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
      this.getSignMoneList();
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