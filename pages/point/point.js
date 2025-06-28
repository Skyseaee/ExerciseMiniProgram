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
    days_style: [],  
    signSystemList:[],
    userSign:'',
    signDays: 0,
    signList: [], // 仅用于更新日历 不能用做其他
    curMonth: null,
    active:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var userInfo = wx.getStorageSync('userInfo')
    this.setData({
      userInfo:userInfo,
      curMonth: this.isDateMatching(new Date()),
    })
    this.getIntegral(this.data.page,this.data.limit,userInfo.uid);
    var that = this;

    wx.Apis.api.getUserSign(this.data.userInfo.uid,(code, data) => {
      wx.hideLoading({})
      that.setData({
        userSign:data,
        sign_index:data.sign_num,
        signDays: data.sum_sign_day,
      })
    })
    this.getSignList(this.data.curMonth);
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
      title: "研题帮，考试助手 ！",
      path: "pages/index/index",
      imageUrl: "/images/share.png"
    };
  },

  goSignd() {
    if (this.data.userInfo.nickName == undefined || this.data.userInfo.nickName == '') {
        this.login()
        return false;
    }
    wx.navigateTo({
        url: '/pages/sign/sign',
    })
  },

  getSignList:function(month){
    var that = this;
    wx.request({
      url: 'https://www.skyseaee.cn/routine/auth_api/get_sign_month',
      header: {
        "content-type": "application/x-www-form-urlencoded",
      },
      data: {
        "month": month,
        'uid':that.data.userInfo.uid,
      },
      success: function(res) {
        let signList = []
        if(res.data.data.data.length != 0) {
          let signs = res.data.data.data[0].list
          for(let i=0; i<signs.length; i++) {
            signList.push(signs[i].add_time)
          }
        }
        that.setData({
          signList,
          curMonth: month,
        })
        let year = month.split('-')[0]
        let months = month.split('-')[1]
        that.updateDays(year, months) 
      },
    })
  },

  updateDays: function(year, month) {
    const days_count = new Date(year, month, 0).getDate();
    let targets = new Set(this.data.signList)
    let days = []
    for(let i=1; i<=days_count; i++) {
      let date = new Date(year, month - 1, i);
      if(targets.has(this.isDateMatching(date))) {
        days.push(
          {month: 'current', day:  date.getDate(), color: '#f3f3f3', background: '#1569E4'},
        )
      } else {
        days.push(
          {month: 'current', day:  date.getDate(), color: '#202020'},
        )
      }
    }
    this.setData({
      days_style: days,
    })
    // console.log(days)
  },

  isDateMatching: function(date) {
    // 获取年、月、日的部分
    var year = date.getFullYear();
    var month = date.getMonth() + 1; // 月份是从 0 开始的，所以要加 1
    var day = date.getDate();

    // 将日期部分格式化为与目标字符串相同的格式
    return year + '-' + (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day;
  },

  changeMonthEvent: function(month) {
    this.setData({
      curMonth: month,
    })
    this.getSignList(month)
  },

  nextMonth: function(event) {
    let month = event.detail.currentYear + '-' + (event.detail.currentMonth < 10 ? '0' : '') + event.detail.currentMonth;
    this.changeMonthEvent(month)
  },

  pervMonth: function(event) {
    let month = event.detail.currentYear + '-' + (event.detail.currentMonth < 10 ? '0' : '') + event.detail.currentMonth;
    this.changeMonthEvent(month)
  },

  goSign:function(e){
    wx.showLoading({
      title: '',
    })
    var that = this, sum_sign_day = that.data.userSign.sum_sign_day
    //今日已签到
    if(that.data.userSign.is_day_sign) {
      wx.showToast({
        title: '您今日已签到!',
        icon: 'fail'
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
        signDays: that.data.signDays + 1,
        'userSign.is_day_sign':true,
        'userInfo.integral': parseInt(that.data.userInfo.integral)+parseInt(data.integral),
        'userInfo.sign_num': parseInt(that.data.userInfo.sign_num)+1
      })
      wx.setStorageSync('userInfo', that.data.userInfo)
      that.getSignList(that.data.curMonth);
   });
  },
})