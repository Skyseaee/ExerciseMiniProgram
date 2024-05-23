const app = getApp()
const util = require('../../utils/util');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    firstID: 0,
    questionData: {}, // 接口返回的题目数据
    totalData: 1,
    questionIndex: 1, // 当前题目ID
    currentIndex: 0, //当前题目索引
    selectedOptions: [], // 用户选择的选项
    allOptions: [], // 控制所有选项的样式
    indexList: [], // 用于题目的索引对应
    currentRate: "",
    options: [],
    answer: "",
    noData: false,
    favor: false,
    showModal: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({firstID: options.firstID})
    this.getQuestionData(this.data.firstID);
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

  getQuestionData: function(id) {
    let that = this
    wx.request({
      url: 'https://www.skyseaee.cn/routine/auth_api/get_favor_exercise',
      header: {
        "content-type": "application/x-www-form-urlencoded",
      },
      data: {
        user_id: app.globalData.uid,
        first_id: id,
      },
      success: function(res) {
        if(res.data.count == 0) {
          that.setData({
            noData: true,
          })
          wx.showModal({
            title: '提示',
            content: '您在当前题库下暂未收藏或尚未刷新，请稍后再试',
            showCancel: false,
            complete: (res) => {
              wx.navigateBack({delta: 1})
              return
            }
          })
        } else {
          let indexList = []
          for(let key in res.data.data) {
            indexList.push(key)
          }
          // console.log(res.data.data[indexList[0]])
          let selectedOptions = res.data.data[indexList[0]].correct_answer.toString().split("").map(Number)
          
          that.setData({
            questionData: res.data.data,
            currentIndex: 0,
            indexList: indexList,
            options: res.data.data[indexList[0]].options.split('~+~').map((item, i) => {
              return {
                text: util.convertToLetters(i.toString()) + '. ' + item,
                selected: selectedOptions.includes(i),
              }
            }),
            totalData: res.data.count,
            questionIndex: indexList[0],
            currentRate: that.formateRate(res.data.data[indexList[0]].correct_rate),
            answer: util.convertToLetters(res.data.data[indexList[0]].correct_answer.toString()),
            favor: res.data.data[indexList[0]].favor,
          })
        }
      },
      fail: function(res) {
        wx.showToast({
          title: '暂未收藏该题库题目',
          icon: 'none'
        });
        
        // Optionally, you can navigate back to the previous page
        wx.navigateBack({
          delta: 1  // 1 means navigate back to the previous page
        });
      }
    })
  },


  nextQuestion: function () {
    this.findQuestion(this.data.currentIndex + 1)
  },

  foreQuestion: function() {
    this.findQuestion(this.data.currentIndex - 1)
  },

  findQuestion: function (index) {
    const currentIndex = index

    if(index < 0) {
      wx.showToast({
        title: '当前是第一题',
        icon: 'success',
        duration: 2000
      });
      return
    }

    if (currentIndex < this.data.totalData) {
      // 还有下一题，重置状态
      const nextIndex = this.data.indexList[currentIndex]
      let selectedOptions = this.data.questionData[nextIndex].correct_answer.toString().split('').map(Number)
      let options = this.data.questionData[nextIndex].options.split('~+~').map((item, i) => {
        return {
          text: util.convertToLetters(i.toString()) + '. ' + item,
          selected: selectedOptions.includes(i),
        }
      })

      this.setData({
        questionIndex: nextIndex,
        currentIndex: currentIndex,
        selectedOptions: selectedOptions,
        options: options,
        answer: util.convertToLetters(this.data.questionData[nextIndex].correct_answer.toString()),
        currentRate: this.formateRate(this.data.questionData[nextIndex].correct_rate),
        favor: this.data.questionData[nextIndex].favor,
      });
    } else {
      // 没有下一题，可以显示完成页面或其他逻辑
      wx.showToast({
        title: '已经是最后一题',
        icon: 'success',
        duration: 2000
      });
    }
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
        first_id: that.data.firstID,
        second_id: that.data.questionData[that.data.questionIndex].second_id,
        exercise_id: that.data.questionIndex,
      },
      success: function(res) {
        let questionList = that.data.questionData
        questionList[that.data.questionIndex].favor = favor
        that.setData({
          favor: favor,
          questionList: questionList
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
    util.feedback(this.data.questionData[this.data.questionIndex], app.globalData.uid, e.detail.value1, e.detail.value2)
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