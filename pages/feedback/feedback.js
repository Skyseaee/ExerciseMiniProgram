// pages/feedback/feedback.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    feedback_template_id:'',
    title:'',
    content:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
     //请求通知模板id
     var that = this;
     wx.showLoading({
       title: '加载中',
       mask:true
     })
     wx.Apis.api.getConfigValue('feedback_template_id',(code, data) => {
      that.setData({
        feedback_template_id:data.value
      })
      wx.hideLoading({})
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

  },

  bindTextAreaInputTitle: function(e){
    console.log(e.detail.value)
    this.setData({
      title:e.detail.value
    })
  },

  bindTextAreaInputContent: function(e){
    console.log(e.detail.value)
    this.setData({
      content:e.detail.value
    })
  },

  bindsubmit: function (e) {
    console.log(e)
    var that = this;
    var params = {
      'content': that.data.content,
      'title': that.data.title
    }
    if (params.content == "" || params.title == "") {
      wx.showToast({
        icon:'error',
        title: '请填写完整',
      })
      return false;
    }
    var tempid = [];
    tempid.push(that.data.feedback_template_id)
    console.log(tempid)
    wx.requestSubscribeMessage({
      tmplIds: tempid,
      success(res) {
	      console.log(res)
	    },
	    complete(){
        wx.showLoading({
          title: '正在提交',
        })
        var userInfo = wx.Apis.get('userInfo');
        params.uid = userInfo.uid;
        wx.Apis.api.saveFeedback(params,(code,data) => {
          wx.hideLoading({})
          if(code == 200){
            wx.showModal({
              title: "反馈成功",
              content: "已经收到您的反馈，我们会尽快处理！",
              showCancel: !1,
              confirmText: "关闭",
              confirmColor: "#46C6BA",
              success: function (e) {
                wx.navigateBack();
              }
            });
          }else{
            wx.showToast({
              icon:'error',
              title: '提交失败',
            })
          }
        })
	    }
    })
  },
  onShareAppMessage: function () {
    return {
      title: "考题星，考试助手 ！",
      path: "pages/index/index",
      imageUrl: "/images/share.png"
    };
  },
})