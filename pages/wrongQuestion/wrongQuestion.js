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
      selectedOptions: '', // 用户选择的选项
      allOptions: [], // 控制所有选项的样式
      indexList: [], // 用于题目的索引对应
      currentRate: "",
      options: [],
      answer: "",
      userAnswer: "",
      noData: false,
      favor: false,
      showModal: false,
      mode: false,
      stage: 'none',
      show_answer: false,
      already_answer: [],
      origin_time: '',
      questionImageHeight: 0,
      commentImageHeight: 0,
      option_type: 0,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      this.setData({firstID: options.firstID, stage: options.stage})
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

    switchOption(option_type, options, selectedOptions, answer, mode) {
      console.log(options, selectedOptions, answer)
      if (option_type == 1) {
        return ['A', 'B', 'C', 'D'].map((item, i) => {
          return {
            text: item,
            selected: util.mappingOptions(i, answer, selectedOptions != undefined ? selectedOptions : -1, mode),
          }
        });
      } else {
        return options.split('~+~').map((item, i) => {
          return {
            text: util.convertToLetters(i.toString()) + '. ' + item,
            selected: util.mappingOptions(i, answer, selectedOptions != undefined ? selectedOptions : -1),
          }
        })
      }
    },

    getQuestionData: function(id) {
      let that = this
      wx.request({
        url: 'https://www.skyseaee.cn/routine/auth_api/get_wrong_answer_by_firstID',
        header: {
          "content-type": "application/x-www-form-urlencoded",
        },
        data: {
          userid: app.globalData.uid,
          first_id: id,
          stage: this.data.stage,
        },
        success: function(res) {
          if(res.data.count == 0) {
            console.log('no data')
            that.setData({
              noData: true,
            })
            wx.showModal({
              title: '提示',
              content: '您在当前题库下暂无错题或尚未刷新，请稍后再试',
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
  
            let selectedOptions = res.data.data[indexList[0]].correct_answer.toString()
            
            that.setData({
              questionData: res.data.data,
              currentIndex: 0,
              indexList: indexList,
              options: that.switchOption(res.data.data[indexList[0]].option_type, res.data.data[indexList[0]].options, selectedOptions, res.data.data[indexList[0]].correct_answer.toString()),
              totalData: res.data.count,
              questionIndex: indexList[0],
              currentRate: that.formateRate(res.data.data[indexList[0]].correct_rate),
              answer: util.convertToLetters(res.data.data[indexList[0]].correct_answer.toString()),
              userAnswer: util.convertToLetters(res.data.data[indexList[0]].answer.toString()),
              favor: res.data.data[indexList[0]].favor,
              option_type: res.data.data[indexList[0]].option_type,
            })
          }
        },
        fail: function(res) {
          wx.showToast({
            title: '暂无错题',
            icon: 'none'
          });
          
          // Optionally, you can navigate back to the previous page
          wx.navigateBack({
            delta: 1  // 1 means navigate back to the previous page
          });
        }
      })
    },

    selectOption: function (e) {
      if(this.data.mode || this.data.show_answer) return;
      const index = e.currentTarget.dataset.index;
      const selectedOptions = index

      const allOptions = this.switchOption(this.data.option_type, this.data.questionData[this.data.questionIndex].options, selectedOptions, this.data.questionData[this.data.questionIndex].correct_answer)
      console.log(allOptions)
      this.addToSet(this.data.questionIndex)
      this.setData({
        selectedOptions: selectedOptions,
        options: allOptions,
      });
      
      this.submitAnswer()
    },

    submitAnswer: function () {
      // 提交答案的逻辑，比对用户选择和正确答案
      let key = this.data.questionData[this.data.questionIndex].correct_answer
      let that = this
      let is_correct = 0
      let user_answer = this.data.selectedOptions
      let questionData = this.data.questionData

      if(key == user_answer) {
        is_correct = 1
      }

      questionData[this.data.questionIndex].answer_time = util.getCurrentTime()
      questionData[this.data.questionIndex].answer = user_answer
      questionData[this.data.questionIndex].is_correct = is_correct

      let exercise_type = questionData[this.data.questionIndex].exercise_type

      this.setData({
        questionData: questionData,
        answer: util.convertToLetters(key.toString()),
        userAnswer:  util.convertToLetters(user_answer.toString()),
        currentRate: that.formateRate(questionData[this.data.questionIndex].correct_rate),
      })

      wx.request({
        url: 'https://www.skyseaee.cn/routine/auth_api/upload_exam_record',
        header: {
          "content-type": "application/x-www-form-urlencoded",
        },
        data: {
          userid: app.globalData.uid,
          is_correct: is_correct,
          second_id: that.data.questionData[that.data.questionIndex].second_id,
          first_id: that.data.firstID,
          exercise_id: that.data.questionIndex,
          answer_time: util.getCurrentTime(),
          answer: this.data.selectedOptions,
          exercise_type: exercise_type,
        },
        success: function(res) {
          // 示例：显示题解和下一题按钮
          that.setData({
            show_answer: true,
          });
        },
        fail: function(res) {
          that.setData({
            exerciseRecord: tempRecord
          })
          wx.showToast({
            title: '答题上传失败',
            icon: 'failed',
            duration: 2000
          })
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
        let selectedOptions = this.data.questionData[nextIndex].correct_answer
        let options = []
        let show_answer = true
        if(this.data.mode) {
          options = this.switchOption(this.data.questionData[nextIndex].option_type, this.data.questionData[nextIndex].options, selectedOptions, this.data.questionData[nextIndex].correct_answer)
        } else {
          selectedOptions = this.data.questionData[nextIndex].answer
          if(!this.isInSet(nextIndex)) {
            show_answer = false
            selectedOptions = -1
          }
          options = this.switchOption(this.data.questionData[nextIndex].option_type, this.data.questionData[nextIndex].options, selectedOptions, this.data.questionData[nextIndex].correct_answer)
        }

        this.setData({
          questionIndex: nextIndex,
          currentIndex: currentIndex,
          selectedOptions: selectedOptions,
          options: options,
          answer: util.convertToLetters(this.data.questionData[nextIndex].correct_answer.toString()),
          userAnswer: util.convertToLetters(this.data.questionData[nextIndex].answer.toString()),
          currentRate: this.formateRate(this.data.questionData[nextIndex].correct_rate),
          favor:  this.data.questionData[nextIndex].favor,
          option_type: this.data.questionData[nextIndex].option_type,
          show_answer,
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

    switchMode() {
      let mode = this.data.mode

      this.setData({
        mode: !mode,
      })

      if (!this.data.mode) {
        this.setData({
          show_answer: false,
        })
      }

      if(this.data.mode) {
        let selectedOptions = this.data.questionData[this.data.questionIndex].correct_answer.toString()
        let options = this.switchOption(this.data.option_type, this.data.questionData[this.data.questionIndex].options, selectedOptions, this.data.questionData[this.data.questionIndex].answer)

        this.setData({
          options,
        })
      } else {
        let options = this.data.options.map((item, i) => {
          return {
            text: item.text,
            selected: false,
          }
        })
        this.setData({
          options,
        })
      }
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
          exercise_type: that.data.questionData[that.data.questionIndex].exercise_type,
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
      console.log('输入框1的值:', e.detail.value1);  
      console.log('输入框2的值:', e.detail.value2);
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
    },

    addToSet: function (value) {
      let mySet = new Set(this.data.already_answer);
      mySet.add(value);
      this.setData({
        already_answer: Array.from(mySet)
      });
    },

    isInSet: function (value) {
      let mySet = new Set(this.data.already_answer);
      return mySet.has(value);
    },

    onQuestionImageLoad(event) {
      const { width, height } = event.detail;
      this.setData({
        questionImageHeight: Math.ceil(height*0.8)
      });
    },

    onCommentImageLoad(event) {
      const { width, height } = event.detail;
      this.setData({
        commentImageHeight: Math.ceil(height*0.8)
      });
    }
})