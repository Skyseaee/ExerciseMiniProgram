// pages/result/result.js
var question_js = require('../../utils/question.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        var userInfo = wx.getStorageSync('userInfo')
        this.setData({
            title:options.title,
            score:options.score,
            green:options.green,
            right:options.right,
            time:options.time,
            nickName: userInfo.nickName,
            avatarUrl: userInfo.avatarUrl,
            record:options.record,
            category_id:options.id
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

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
              wx.navigateTo({
                url: '/pages/exam/exam?id='+data.id+'&timeback=1',
              })
            }
          }
        })
      },

      goRank: function () {
        wx.navigateTo({
          url: '/pages/rank/rank?id='+this.data.activity,
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
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

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