// pages/exammode/exammode.js
const question = require('../../utils/question')
const { questions } = require('../../utils/question')
const util = require('../../utils/util')
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
      is_first: 0,
      questions: [],
      records: [],
      indexes: 0, // 当前题目索引
      spendTime: 0,
      startTime: null,
      allDown: false,
      currentRate: 0,
      options: [],
      option_type: 0,
      exam_id: 0, 
      selectedOptions: [], // 用户选择的选项
      allOptions: [], // 控制所有选项的样式
      showComments: false, // 是否显示题解
      favor: false,
      answer: '',
      userAnswer:　'',
      showMenu: false,
      first_id: 0,
      showResult: false,
      classMode: [],
      showModal: false,
      questionImageHeight: 0,
      commentImageHeight: 0,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      let that = this
      // let date = new Date()

      this.setData({
        count: options.count,
        first_id: options.first_id,
      })

      // console.log(decodeURIComponent(options.records))
      wx.request({
        url: 'https://www.skyseaee.cn/routine/auth_api/get_random_exercises_by_first_category',
        method: 'POST',
        header:{
          "content-type": "application/x-www-form-urlencoded",
          'personal': 'skyseaee',
        },
        data: {
          uid: app.globalData.uid,
          first_id: options.first_id,
          count: options.count,
        },
        success: function(res) {
          let data = res.data.data
          let record = []
          for(let i=0; i<data.length; i++) {
            record.push(-1)
            data[i]['class'] = 'unanswered'
          }
          
          let option_type = data[0].option_type

          that.setData({
            is_first: data.is_first,
            first_id: options.category,
            questions: data,
            options: that.switchOption(option_type, data[0].options, data[0].correct_answer),
            records: record,
            indexes: 0,
            favor: data[0].favor,
            option_type: option_type,
          })
          // console.log(that.data.is_first) 
        }
      })

      wx.enableAlertBeforeUnload({
        message: '重新进入题目会重新抽取',
      })

    },

    switchOption(option_type, options, selectedOptions, answer) {
      if (option_type == 1) {
        return ['A', 'B', 'C', 'D'].map((item, i) => {
          return {
            text: item,
            selected: util.mappingOptions(i, answer, selectedOptions != undefined ? selectedOptions : -1),
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

    showMenu() {
      let showMenu = this.data.showMenu
      this.setData({
        showMenu: !showMenu
      })
    },

    selectOption: function (e) {
      if(this.data.allDown || this.data.showComments) return;
      const index = e.currentTarget.dataset.index;
      let selectedOptions = index;
      let question = this.data.questions[this.data.indexes]

      let answer = Number(question.answer)
      let is_correct = 0
      let that = this

      if(answer == selectedOptions) {
        is_correct = 1
      }
      
      const allOptions = this.switchOption(this.data.option_type, question.options, selectedOptions, answer)
      console.log(allOptions, is_correct, answer, selectedOptions)
      let records = this.data.records
      let questions = this.data.questions
      if(selectedOptions != -1) {
        questions[this.data.indexes]['class'] =  is_correct == 1? 'trueAnswer' : 'wrongAnswer'
        records[this.data.indexes] = selectedOptions
      }


      this.setData({
        selectedOptions: selectedOptions,
        options: allOptions,
        records: records,
        questions: questions,
        answer: util.convertToLetters(answer.toString()),
        userAnswer: util.convertToLetters(selectedOptions.toString()),
      });

      wx.request({
        url: 'https://www.skyseaee.cn/routine/auth_api/upload_exam_record',
        header: {
          "content-type": "application/x-www-form-urlencoded",
        },
        data: {
          userid: app.globalData.uid,
          is_correct: is_correct,
          second_id: question.second_id,
          first_id: question.first_id,
          exercise_id: question.id,
          answer_time: util.getCurrentTime(),
          answer: selectedOptions,
          exercise_type: question.exercise_type,
        },
        success: function(res) {
          // 示例：显示题解和下一题按钮
          that.setData({
            showComments: true,
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

    lastQuestion: function() {
      this.findQuestion(this.data.indexes - 1)
    },

    nextQuestion: function() {
      this.findQuestion(this.data.indexes + 1)
    },

    switchExam: function(e) {
      const index = e.currentTarget.dataset.index;
      this.findQuestion(index)
    },

    findQuestion: function (index) {
      this.setData({
        showResult: false,
      })
      if(index < 0) {
        wx.showToast({
          title: '已是第一题',
          icon: 'success',
          duration: 2000
        });
        return
      }

      if (index < this.data.questions.length) {
        // 还有下一题，重置状态
        let selectedOptions = this.data.records[index]
        let question = this.data.questions[index]
        let options = this.switchOption(question.option_type, question.options, selectedOptions, Number(question.answer))
        if(this.data.records[index] != -1) {
          this.setData({
            showComments: true,
          })
        } else {
          this.setData({
            showComments: false,
          })
        }

        this.setData({
          indexes: index,
          selectedOptions: this.data.records[index].userAnswer||''.split(),
          options: options,
          option_type: this.data.records[index].option_type,
          answer: util.convertToLetters(question.answer.toString()),
          userAnswer: util.convertToLetters(this.data.records[index].toString()),
          currentRate: this.formateRate(question.correct_rate),
          favor: question.favor,
          showModal: false,
          showMenu: false,
        })
      } else {
        // 没有下一题，可以显示完成页面或其他逻辑
        wx.showToast({
          title: '已是最后一题',
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
          first_id: that.data.first_id,
          second_id: that.data.questions[that.data.indexes].second_id,
          exercise_id: that.data.questions[that.data.indexes].id,
          exercise_type: that.data.questions[that.data.indexes].exercise_type,
        },
        success: function(res) {
          let questionList = that.data.questions
          
          questionList[that.data.indexes].favor = favor
          that.setData({
            favor: favor,
            questions: questionList
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

    submitAnswer: function() {
      let that = this
      let record = this.data.records
      let isDown = false
      for(let i=0; i<this.data.questions.length; i++) {
        if(record[i].isAnswer) {
          isDown = true
          break
        }
      }

      if(!isDown) {
        wx.showToast({
          title: '无答题记录，无法提交',
          icon: 'none'
        })
        return
      }

      let finishTime = new Date()
      if((finishTime.getTime() - this.data.startTime) < 60000) {
        wx.showToast({
          title: '答题时间过短，无法判断为有效答题',
          icon: 'none'
        })
        return
      }

      console.log(this.data.records)
      let un_answered = []
      for(let i=0; i<record.length; i++) {
        if(!record[i].isAnswer) {
          un_answered.push(i+1)
        }
      }

      if(un_answered.length != 0) {
        wx.showModal({
          title: '是否确认提交',
          content: '题目:' + un_answered.join(',') +'尚未作答, 是否仍然提交',
          complete: (res) => {
            if (res.cancel) {
              return
            }
            if (res.confirm) {
              that.uploadRecords()
            }
          }
        })
      } else {
        that.uploadRecords()
      }
    },

    uploadRecords: function() {
      let that = this
      let finishTime = new Date()
      let internal = (finishTime.getTime() - this.data.startTime) / 1000
      let question_id = []
      let score = 0
      let classMode = this.generateStyleMap(this.data.questions, this.data.records)
      for(let i=0; i<this.data.questions.length; i++) {
        question_id.push(this.data.questions[i].id)
        if(this.data.questions[i].answer === this.data.records[i].userAnswer) {
          score++
        }
      }
      
      let params = JSON.stringify({
        "uid": app.globalData.uid,
        'score': score,
        'use_time': internal,
        'category_id': this.data.first_id,
        'question_id': question_id.join(','),
        'record': this.data.records,
        'exam_id': this.data.exam_id,
        'is_first': this.data.is_first,
      })
      console.log(params)
      wx.request({
        url: 'https://www.skyseaee.cn/routine/auth_api/save_exam_records',
        header: {
          "content-type": "application/x-www-form-urlencoded",
        },
        data: {
          params: params
        },
        success: function(res) {
          that.setData({
            allDown: true,
            showComments: true,
            showResult: true,
            score,
            spendTime: that.secondsToHMS(internal),
            classMode,
          })
          wx.disableAlertBeforeUnload()
        },
        fail: function(res) {
          console.log(res)
        }
      })
    },

  secondsToHMS: function(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.ceil(seconds % 60);
    
    if(minutes == 0 && hours == 0) return `${remainingSeconds}s`;
    else if(hours == 0) return `${minutes}min${remainingSeconds}s`;
    else return `${hours}h${minutes}min${remainingSeconds}s`;
  },

  showResult: function() {
    this.setData({
      showResult: true,
    })
  },

  generateStyleMap: function(questions, records) {
    let classMode = []
    for(let i=0; i<questions.length; i++) {
      if(questions[i].answer === records[i].userAnswer) {
        classMode.push('trueAnswer')
      } else if(records[i].userAnswer === "") {
        classMode.push('emptyAnswer')
      } else {
        classMode.push('wrongAnswer')
      }
    }
    return classMode
  },

  formatUserAnswer: function(answer) {
    if(answer !== "") {
      return answer.split('').map(Number).map(m => m+1).join(' , ')
    } else {
      return '未作答'
    }
  },

  favorWrongQuestion: function() {
    this.favorQuestions('wrong')
  },

  favorAll: function() {
    this.favorQuestions('all')
  },

  favorQuestions: function(mode) {
    let favors = []
    let seconds = []
    let indexs = []
    for(let i=0; i<this.data.questions.length; i++) {
      if(this.data.questions[i].favor) continue
      if(mode == 'wrong') {
        if(this.data.questions[i].answer === this.data.records[i].userAnswer) {
          continue
        }
      }
      favors.push(this.data.questions[i].id)
      seconds.push(this.data.questions[i].second_id)
      indexs.push(i)
    }
    if(favors.length == 0) {
      wx.showToast({
        title: '已全部收藏',
        icon: 'success'
      })
      return
    } else {
      this.favorsExam(favors, seconds, indexs)
    }
  },

  favorsExam: function(favors, second_ids, indexs) {
    let that = this
    
    wx.request({
      url: 'https://www.skyseaee.cn/routine/auth_api/insert_favor_exercises',
      header: {
        "content-type": "application/x-www-form-urlencoded",
      },
      data: {
        user_id: app.globalData.uid,
        first_id: that.data.first_id,
        second_id: second_ids.join(','),
        exercises_id: favors.join(','),
      },
      success: function(res) {
        let questionList = that.data.questions
        
        for(let i=0; i<indexs.length; i++) {
          questionList[indexs[i]].favor = true
        }
        that.setData({
          questions: questionList
        })

        wx.showToast({
          title: '收藏成功' ,
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
    util.feedback(this.data.questions[this.data.indexes], app.globalData.uid, e.detail.value1, e.detail.value2)
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