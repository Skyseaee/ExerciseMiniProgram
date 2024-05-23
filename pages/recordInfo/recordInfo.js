// pages/recordInfo/recordInfo.js
const app = getApp()
const util = require("../../utils/util")

Page({

    /**
     * 页面的初始数据
     */
    data: {
      exam: null,
      first_name: '',
      second_name: '',
      question_img: '',
      question: '',
      options: '',
      answer: '',
      userAnswer: '',
      currentRate: 0,
      comments: '',
      comments_img: '',
      answer_time: '',
      favor: false,
      showModal: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      let data = decodeURIComponent(options.info)
      let info = JSON.parse(data)
      console.log(info)
      let selectedOptions = info.answer.toString().split("").map(Number)
      this.setData({
        exam: info,
        first_name: info.first_name,
        second_name: info.second_name,
        answer_time: info.answer_time,
        question: info.question,
        currentRate: info.correct_rate,
        comments: info.comments,
        answer: info.correct_answer.toString(),
        userAnswer: info.answers.toString(),
        question_img: info.question_img,
        comments_img: info.comment_img,
        options: info.options.split('~+~').map((item, i) => {
          return {
            text: util.convertToLetters(i.toString()) + '. ' + item,
            selected: selectedOptions.includes(i),
          }
        }),
        favor: info.favor,
      })
      console.log(this.data.comments_img.length)
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
    onShareAppMessage() {

    },

    formateRate: function(rate) {
      let r = rate.toFixed(3) * 100
      return r.toString().substring(0, 4)
    },

    favorQuestion: function() {
      let that = this
      let favor = this.data.favor
      favor = !favor
      wx.request({
        url: 'https://www.skyseaee.cn/routine/auth_api/insert_favor_exercise',
        header: {
          "content-type": "application/x-www-form-urlencoded",
        },
        data: {
          user_id: app.globalData.uid,
          first_id: that.data.exam.first_id,
          second_id: that.data.exam.second_id,
          exercise_id: that.data.exam.exercise_id,
        },
        success: function(res) {
          that.setData({
            favor: favor,
          })
  
          let title = favor ? '收藏成功' : '取消成功'
          wx.showToast({
            title: title,
            icon: 'success',
            duration: 1000
          })
        },
        fail: function(res) {
          wx.showToast({
            title: '收藏失败',
            icon: 'fail',
            duration: 1000
          });
        }
      })
    },

    handleConfirm(e) {  
      // 处理确认事件，e.detail 中包含了从组件传递过来的值  
      if(e.detail.value1.length == 0) {
        wx.showToast({
          title: '正确答案不能为空',
          icon: 'none'
        })
        return
      } else if(e.detail.value1 == this.data.answer) {
        wx.showToast({
          title: '无法提交相同的答案',
          icon: 'none'
        })
        return
      }
      let that = this
      util.feedback({
        "exercise_id": that.data.info.exercise_id,
        "first_id": that.data.info.first_id,
        "second_id": that.data.info.second_id,
      }, app.globalData.uid, e.detail.value1, e.detail.value2)
      this.setData({
        showModal: false  
      })
    },  

    handleCloseModal() {  
      // 处理关闭模态框的事件  
      this.setData({  
        showModal: false  
      });  
    },  
    
    showModal() {  
      // 显示模态框的方法  
      this.setData({  
        showModal: true  
      });  
    }  
})