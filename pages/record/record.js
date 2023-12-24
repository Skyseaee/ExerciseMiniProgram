// pages/record/record.js
var question_js = require('../../utils/question.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page:1,
    limit:10,
    nodata:true,
    recordList:[],
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
    this.getRecord(this.data.page,this.data.limit,userInfo.uid)
  },

  //请求数据
  getRecord(page,limit,uid){
    var that = this;
    wx.showLoading({
      title: '加载中',
      mask:true,
      icon: 'loading'
    })
    wx.Apis.api.getUserRecord(page,limit,uid,(code, data) => {
      var recordList = that.data.recordList;
      var page = that.data.page;
      console.log(data.length)
      if(data.length){
        data.forEach(v => {
          recordList.push(v)
        });
        that.setData({
          recordList:recordList,
          page:page+1,
          nodata:false
        })
      }else{
        that.setData({
          recordList:recordList,
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

  getRecordDetail: function(t) {
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    var id = t.currentTarget.dataset.id;
    wx.Apis.api.getRecordDetail(id,(code, data) => {
      console.log(data)
      wx.setStorage({
        key:'examids'+data.id,
        data:data.ids
      })
      wx.setStorage({
        key:'examlist'+data.id,
        data:data.list
      })
      wx.setStorage({
        key:'exam'+data.id,
        data:data.record
      })
      var question = wx.getStorageSync('question_'+data.category)
      if(!question){
        //加载题库
        that.uploadQuestion(data.category,data.id,data.ids);
      }else{
        //重新请求题库
        var question_update_time = wx.getStorageSync('question_update_time_'+data.category)
        if(question_update_time < data.q_update_time){
          that.uploadQuestion(data.category,data.id,data.ids);
        }else{
          question_js.initAllQuestionFromStorage(data.category);
          // var questionArr = question_js.getQuestionsByIds(data.ids)
          // wx.setStorage({
          //   key:'examall'+data.id,
          //   data:questionArr
          // })
          wx.navigateTo({
            url: '/pages/exam/exam?id='+data.id+'&timeback=1',
          })
        }
      }
    })
  },

  //加载题库
  uploadQuestion(category,id,ids){
    var that = this;
    wx.Apis.api.getQuestionList(category,(code, data) => {
      wx.setStorageSync('question_id_'+category, data.question_id)
      wx.setStorageSync('question_'+category, data.question_list)
      wx.setStorageSync('question_update_time_'+category, data.q_update_time)

      question_js.initAllQuestionFromStorage(category);
      // var questionArr = question_js.getQuestionsByIds(ids)
      // wx.setStorage({
      //   key:'examall'+id,
      //   data:questionArr
      // })
      wx.navigateTo({
        url: '/pages/exam/exam?id='+id+'&timeback=1',
      })
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  onReachBottom: function () {
    if(this.data.moreData){
      this.getRecord(this.data.page, this.data.limit,this.data.userInfo.uid);
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
  },
})