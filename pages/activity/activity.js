// pages/activity/activity.js
const util = require('../../utils/util');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        nodata:false,
        activityList:[],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getActivity(this.data.page,this.data.limit)
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

    //请求活动数据
  getActivity(page,limit){
    var that = this;
    wx.showLoading({
      title: '加载中',
      mask:true,
      icon: 'loading'
    })
    wx.Apis.api.getActivityList(page,limit,(code, data) => {
      var activityList = that.data.activityList;
      var page = that.data.page;
      console.log(data.length)
      if(data.length){
        data.forEach(v => {
          v.status = util.judgeDate(v.start_time,v.end_time)
          v.start = v.start_time.substr(0,16)
          v.end = v.end_time.substr(0,16)
          activityList.push(v)
        });
        console.log(activityList)
        that.setData({
          activityList:activityList,
          page:page+1,
          nodata:false
        })
      }else{
        that.setData({
          activityList:activityList,
          moreData:false
        })
      }
      
      setTimeout(function(){
        wx.hideLoading({
          success: (res) => {},
        })
      },1500);
    });
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