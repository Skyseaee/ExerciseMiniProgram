// pages/sign/sign.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active:false,
    signSystemList:[],
    userSign:'',
    signCount:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.Apis.api.getSignConfig((code, data) => {
      console.log(data)
      that.setData({
        signSystemList:data,
        day: that.Rp(data.length)
      })
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
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    wx.Apis.api.getUserSign(this.data.userInfo.uid,(code, data) => {
      wx.hideLoading({})
      that.setData({
        userSign:data,
        sign_index:data.sign_num,
        signCount: that.PrefixInteger(data.sum_sign_day, 4)
      })
   });
   this.getSignList();
  },
  close:function(){
    this.setData({active: false});
  },

  Rp: function (n) {
    var cnum = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    var s = '';
    n = '' + n; // 数字转为字符串
    for (var i = 0; i < n.length; i++) {
      s += cnum[parseInt(n.charAt(i))];
    }
    return s;
  },
  /**
   * 数字分割为数组
   * @param int num 需要分割的数字
   * @param int length 需要分割为n位数组
  */
  PrefixInteger: function (num, length) {
    return (Array(length).join('0') + num).slice(-length).split('');
  },

  //签到
  goSign:function(e){
    wx.showLoading({
      title: '',
    })
    var that = this, sum_sign_day = that.data.userSign.sum_sign_day
    //今日已签到
    if(that.data.userSign.is_day_sign) {
      $Toast({
        content: '您今日已签到!'
      });
      wx.hideLoading({})
      return false;
    }
    wx.Apis.api.userSign(this.data.userInfo.uid,(code, data) => {
      wx.hideLoading({})
      that.setData({
        active:true,
        integral: data.integral,
        sign_index: (that.data.sign_index + 1) > that.data.signSystemList.length ? 1 : that.data.sign_index + 1,
        signCount: that.PrefixInteger(sum_sign_day + 1, 4),
        'userSign.is_day_sign':true,
        'userInfo.integral': parseInt(that.data.userInfo.integral)+parseInt(data.integral),
        'userInfo.sign_num': parseInt(that.data.userInfo.sign_num)+1
      })
      wx.setStorageSync('userInfo', that.data.userInfo)
      that.getSignList();
   });
  },
  //获取签到列表
  getSignList:function(){
    var that = this;
    var params = {'uid':that.data.userInfo.uid,'page':1,'limit':3};
    wx.Apis.api.getSignList(params,(code, data) => {
      that.setData({signList:data});
    })
  },

  goSignList:function (params) {
      wx.navigateTo({
        url: '/pages/signList/signList',
      })
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
    return {
      title: "智慧考题宝，考试助手 ！",
      path: "pages/index/index",
      imageUrl: "/images/share.png"
    };
  },

  switchSignList: function() {
    wx.navigateTo({
      url: '/pages/signList/signList',
    })
  },
})