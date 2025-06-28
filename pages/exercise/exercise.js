// pages/exercise/exercise.js
const util = require('../../utils/util');
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
      firstID: 0,
      catagoryID: 0,
      questionData: {}, // 接口返回的题目数据
      totalData: 1,
      stage: 'basic',
      questionIndex: 1, // 当前题目ID
      currentIndex: 0, //当前题目索引
      selectedOptions: '', // 用户选择的选项
      allOptions: [], // 控制所有选项的样式
      showComments: false, // 是否显示题解
      showNextButton: false, // 是否显示下一题按钮
      exerciseRecord: [], // 用户刷过的题目, 标明第几题用户没有做 而不是题目id
      indexList: [], // 用于题目的索引对应
      currentRate: 0,
      point_name: '',
      currentFrequency: 0,
      options: [],
      answer: "",
      userAnswer: "",
      favor: false,
      showModal: false,
      auth: false,
      mode: false,
      showTable: false,
      origin_time: '',
      questionImageHeight: 0,
      commentImageHeight: 0,
      feedback: '',
      feedback_list: [],
      favor_state: 0,
      favors: 0,
      disfavors: 0,
      tags: [],
      examinetype: -1,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {  
      this.setData({catagoryID: options.id, firstID: options.firstID, auth: options.auth, stage: options.stage, examinetype: options.examinetype})
      this.getQuestionData(this.data.catagoryID);
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
        url: 'https://www.skyseaee.cn/routine/auth_api/get_exercise_by_second_category',
        header: {
          "content-type": "application/x-www-form-urlencoded",
        },
        data: {
          uid:app.globalData.uid,
          second_id: id,
          auth: that.data.auth,
          stage: this.data.stage,
          examinetype: this.data.examinetype,
        },
        success: function(res) {
          let index = -1
          let i = 0
          let indexList = []
          let exerciseRecord = []
          let feedback_list = []
          // console.log(res.data.data)
          for(let key in res.data.data) {
            indexList.push(key)
            res.data.data[key]['index'] = i+1
            feedback_list.push('暂无')
            if(res.data.data[key].user_answer.length == 0) {
              if(index == -1)
                index = i
              res.data.data[key]['class'] = 'unanswered'
            } else if(res.data.data[key].user_answer.length != 0) {
              exerciseRecord.push(i)
              if(res.data.data[key].user_answer == res.data.data[key].answer)
                res.data.data[key]['class'] = 'trueAnswer'
              else
                res.data.data[key]['class'] = 'wrongAnswer'
            }
            i++
          }
          that.setData({feedback_list})
          // 所有题目已刷过
          if(index == -1) {
            index = 0
            that.setData({
              showComments: true,
              showNextButton: true,
            })
          }
          that.requestComment(index, indexList[index])
          let selectedOptions = res.data.data[indexList[index]].user_answer
          let tags = res.data.data[indexList[index]].tags.split(',')
          that.setData({
            questionData: res.data.data,
            currentIndex: index,
            exerciseRecord: exerciseRecord,
            indexList: indexList,
            options: res.data.data[indexList[index]].options.split('~+~').map((item, i) => {
              return {
                text: util.convertToLetters(i.toString()) + '. ' + item,
                selected: util.mappingOptions(i, res.data.data[indexList[index]].answer, selectedOptions != undefined ? selectedOptions : -1),
              }
            }),
            totalData: res.data.count,
            questionIndex: indexList[index],
            currentRate: that.formateRate(res.data.data[indexList[index]].correct_rate),
            answer: util.convertToLetters(res.data.data[indexList[index]].answer.toString()),
            userAnswer: util.convertToLetters(res.data.data[indexList[index]].user_answer.toString()),
            favor: res.data.data[indexList[index]].favor,
            favor_state: res.data.data[indexList[index]].state,
            point_name: res.data.data[indexList[index]].point_name,
            origin_time: res.data.data[indexList[index]].origin_time,
            favors: res.data.data[indexList[index]].favors,
            disfavors: res.data.data[indexList[index]].disfavors,
            tags,
          })
        },
        fail: function(res) {
          wx.showToast({
            title: '当前题库正在加紧录入题目',
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
      if(this.data.showComments || this.data.mode || this.data.showTable) return;
      const index = e.currentTarget.dataset.index;
      let selectedOptions = this.data.selectedOptions;
      let that = this
      // 根据题型判断是否为多选题，单选题直接替换选项，多选题追加或删除选项
      selectedOptions = index
      const allOptions = this.data.options.map((item, i) => {
        return {
          text: item.text,
          selected: util.mappingOptions(i, that.data.questionData[that.data.questionIndex].answer, selectedOptions),
        }
      })
  
      this.setData({
        selectedOptions: selectedOptions,
        options: allOptions,
      });

      this.submitAnswer()
    },

    submitAnswer: function () {
      // 提交答案的逻辑，比对用户选择和正确答案
      let key = this.data.questionData[this.data.questionIndex].answer
      let that = this
      let is_correct = 0
      let user_answer = this.data.selectedOptions
      let questionData = this.data.questionData

      if(key == user_answer) {
        is_correct = 1
      }

      questionData[this.data.questionIndex].answer_time = util.getCurrentTime()
      questionData[this.data.questionIndex].user_answer = user_answer
      questionData[this.data.questionIndex].is_correct = is_correct

      if(is_correct) {
        questionData[this.data.questionIndex]['class'] = 'trueAnswer'
      } else {
        questionData[this.data.questionIndex]['class'] = 'wrongAnswer'
      }
      let exercise_type = questionData[this.data.questionIndex].exercise_type
      let exerciseRecord = this.data.exerciseRecord
      let tempRecord = exerciseRecord.slice()
      exerciseRecord.push(this.data.currentIndex)
      this.setData({
        exerciseRecord: exerciseRecord,
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
          second_id: that.data.catagoryID,
          first_id: that.data.firstID,
          exercise_id: that.data.questionIndex,
          answer_time: util.getCurrentTime(),
          answer: this.data.selectedOptions,
          exercise_type: exercise_type,
        },
        success: function(res) {
          // 示例：显示题解和下一题按钮
          that.setData({
            showComments: true,
            showNextButton: true
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
      let that = this
      if (currentIndex < this.data.totalData) {
        // 还有下一题，重置状态
        if(this.data.feedback_list[currentIndex] == '暂无') {
          this.requestComment(currentIndex, this.data.indexList[currentIndex])
        } else {
          let feedback = this.data.feedback_list[currentIndex]
          this.setData({feedback,})
        }
        const nextIndex = this.data.indexList[currentIndex]
        let selectedOptions = this.data.questionData[nextIndex].user_answer
        let tags = this.data.questionData[nextIndex].tags.split(',')
        let options = this.data.questionData[nextIndex].options.split('~+~').map((item, i) => {
          return {
            text: util.convertToLetters(i.toString()) + '. ' + item,
            selected: util.mappingOptions(i, that.data.questionData[nextIndex].answer, selectedOptions != undefined ? selectedOptions : -1)
          }
        })
        if(this.data.questionData[nextIndex].user_answer.length == 0) {
          this.setData({
            showComments: false,
            showNextButton: false,
          })
        } else {
          this.setData({
            showComments: true,
            showNextButton: true,
          })
        }

        this.setData({
          questionIndex: nextIndex,
          currentIndex: currentIndex,
          selectedOptions: '',
          options: options,
          answer: util.convertToLetters(this.data.questionData[nextIndex].answer.toString()),
          userAnswer: util.convertToLetters(this.data.questionData[nextIndex].user_answer.toString()),
          currentRate: this.formateRate(this.data.questionData[nextIndex].correct_rate),
          favor: this.data.questionData[nextIndex].favor,
          favor_state: this.data.questionData[nextIndex].state,
          favors:  this.data.questionData[nextIndex].favors,
          disfavors:  this.data.questionData[nextIndex].disfavors,
          showModal: false,
          point_name: this.data.questionData[nextIndex].point_name,
          origin_time: this.data.questionData[nextIndex].origin_time,
          tags,
        });
      } else {
        // 没有下一题，可以显示完成页面或其他逻辑
        if(this.data.auth == 'true') {
          wx.showToast({
            title: '最后一题',
            icon: 'success',
            duration: 2000
          });
        } else {
          wx.showModal({
            title: '暂无权限查看后续题目',
            content: '是否前往开通权限',
            complete: (res) => {
              if (res.cancel) {
                return
              }
          
              if (res.confirm) {
                wx.navigateTo({
                  url: '/pages/unlockBank/unlockBank',
                })
              }
            }
          })
        }
      }
    },

    formateRate: function(rate) {
      let r = rate.toFixed(3) * 100
      return r.toString().substring(0, 4)
    },

    favorQuestion: function() {
      let that = this
      let favor = this.data.favor
      let exercise_type = this.data.questionData[this.data.questionIndex].exercise_type
      favor = !favor
      wx.request({
        url: 'https://www.skyseaee.cn/routine/auth_api/insert_favor_exercise',
        header: {
          "content-type": "application/x-www-form-urlencoded",
        },
        data: {
          user_id: app.globalData.uid,
          first_id: that.data.firstID,
          second_id: that.data.catagoryID,
          exercise_id: that.data.questionIndex,
          exercise_type: exercise_type,
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
      if(e.detail.value1 == '请选择') {
        wx.showToast({
          title: '反馈类型不能为空',
          icon: 'none'
        })
        return
      } 
      util.feedback(this.data.questionIndex, this.data.questionData[this.data.questionIndex], app.globalData.uid, e.detail.value1, e.detail.value2)
      let feedbacks = this.data.feedback_list
      let fb = e.detail.value1 + ' - ' + e.detail.value2
      feedbacks[this.data.currentIndex] = fb
      this.setData({
        showModal: false,
        feedback_list: feedbacks,
        feedback: fb,
      })
    },  

    handleCloseModal() {  
      // 处理关闭模态框的事件  
      this.setData({  
        showModal: false  
      });  
    }, 

    requestComment(index, exercise_id) {
      let that = this
      wx.request({
        url: 'https://www.skyseaee.cn/routine/auth_api/get_feedback_exercise',
        header: {
          "content-type": "application/x-www-form-urlencoded",
        },
        data: {
          uid: app.globalData.uid,
          exercise_id: exercise_id,
        },
        success: function(res) {
          let feedbacks = that.data.feedback_list
          let feedback = ''
          if(res.data.count == 0) {
            feedbacks[index] = ''
          } else {
            feedback = res.data.data[0]['correct_answer'] + ' - ' + res.data.data[0]['comment']
            feedbacks[index] = feedback
          }
          that.setData({feedback_list: feedbacks, feedback: feedback,})
        }
      })
    },
    
    showModal() {  
      // 显示模态框的方法  
      this.setData({  
        showModal: true  
      });  
    },

    switchMode() {
      let mode = this.data.mode
      this.setData({
        mode: !mode,
      })
    },

    swicthMenu() {
      let showTable = this.data.showTable
      this.setData({
        showTable: !showTable,
      })
    },

    switchExam: function(e) {
      const index = e.currentTarget.dataset.index - 1
      this.findQuestion(index)
      this.swicthMenu()
    },

    closeMenu() {
      this.setData({
        showTable: false,
      })
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
    },

    likeQuestion() {
      let state = this.favor_state
      let that = this

      if(state == 0) {
        that.setData({
          favor_state: 1,
        })
      } else {
        that.setData({
          favor_state: 1
        })
      }
    },

    likeQuestion() {
      let state = this.data.favor_state
      let that = this
      let exercise_type = this.data.questionData[this.data.questionIndex].exercise_type
      let favors = this.data.questionData[this.data.questionIndex].favors
      let disfavors = this.data.questionData[this.data.questionIndex].disfavors
      if(state == 0 || state == 2) {
        if(state == 2) disfavors--
        state = 1
        favors++
      } else {
        state = 0
        favors--
      }
      wx.request({
        url: 'https://www.skyseaee.cn/routine/auth_api/insert_favor_state',
        header: {
          "content-type": "application/x-www-form-urlencoded",
        },
        data: {
          uid: app.globalData.uid,
          first_id: that.data.firstID,
          second_id: that.data.catagoryID,
          exercise_id: that.data.questionIndex,
          exercise_type: exercise_type,
          favor_or_not: state,
        },
        success: function(res) {
          let questionList = that.data.questionData
          questionList[that.data.questionIndex].state = state
          questionList[that.data.questionIndex].favors = favors
          questionList[that.data.questionIndex].disfavors = disfavors

          that.setData({
            favor_state: state,
            favors: favors,
            disfavors: disfavors,
            questionList: questionList
          })
        },
        fail: function(res) {
          wx.showToast({
            title: '评分失败',
            icon: 'fail',
            duration: 1000
          });
        }
      })
    },

    dislikeQuestion() {
      let state = this.data.favor_state
      let that = this
      let exercise_type = this.data.questionData[this.data.questionIndex].exercise_type
      let disfavors = this.data.questionData[this.data.questionIndex].disfavors
      let favors = this.data.questionData[this.data.questionIndex].favors
      if(state == 0 || state == 1) {
        if(state == 1) favors--
        state = 2
        disfavors++
      } else {
        state = 0
        disfavors--
      }
      // console.log(state, favors)
      wx.request({
        url: 'https://www.skyseaee.cn/routine/auth_api/insert_favor_state',
        header: {
          "content-type": "application/x-www-form-urlencoded",
        },
        data: {
          uid: app.globalData.uid,
          first_id: that.data.firstID,
          second_id: that.data.catagoryID,
          exercise_id: that.data.questionIndex,
          exercise_type: exercise_type,
          favor_or_not: state,
        },
        success: function(res) {
          let questionList = that.data.questionData
          questionList[that.data.questionIndex].disfavors = disfavors
          questionList[that.data.questionIndex].favors = favors
          that.setData({
            favor_state: state,
            disfavors: disfavors,
            favors: favors,
            questionList: questionList
          })
        },
        fail: function(res) {
          wx.showToast({
            title: '评分失败',
            icon: 'fail',
            duration: 1000
          });
        }
      })
    }
})