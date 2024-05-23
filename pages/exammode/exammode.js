// pages/exammode/exammode.js
const question = require('../../utils/question')
const { questions } = require('../../utils/question')
const utils = require('../../utils/util')
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
      questions: [],
      records: [],
      questionType: '',
      indexes: 0, // 当前题目索引
      spendTime: 0,
      startTime: null,
      allDown: false,
      currentRate: 0,
      options: [],
      selectedOptions: [], // 用户选择的选项
      allOptions: [], // 控制所有选项的样式
      showComments: false, // 是否显示题解
      favor: false,
      answer: '',
      userAnswer:　'',
      showMenu: false,
      first_id: 0,
      showResult: false,
      score: 0,
      classMode: [],
      showModal: false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      let that = this
      let date = new Date()
      let startTime = date.getTime()
      this.setData({
        startTime
      })
      
      let record = []
      let info = null
      if(options.records) {
        info = JSON.parse(decodeURIComponent(options.records))
        record = JSON.parse(info.record)
      }
      // console.log(decodeURIComponent(options.records))
      wx.request({
        url: 'https://www.skyseaee.cn/routine/auth_api/gen_mock_exam',
        method: 'POST',
        header:{
          "content-type": "application/x-www-form-urlencoded",
          'personal': 'skyseaee',
        },
        data: {
          uid: app.globalData.uid,
          first_id: options.category,
          question: options.question,
          mode: options.class,
        },
        success: function(res) {
          let data = res.data.data
          if(record.length == 0) {
            for(let i=0; i<res.data.count; i++) {
              record.push({"index": i, "isAnswer": false, "userAnswer": '', 'first_id': data[i].first_id, 'second_id': data[i].second_id, 'exercise_id': data[i].id, "correctAnswer": data[i].answer})
              data[i].user_answer = ''
            }
          }
          let selectedOptions = record[0].userAnswer.toString().split('').map(Number)
          that.setData({
            first_id:  options.category,
            questions: data,
            questionType: utils.mappingExercise(data[0].exercise_type),
            options: data[0].options.split('~+~').map((item, i) => {
              return {
                text: utils.convertToLetters(i.toString()) + '. ' + item,
                selected: selectedOptions.includes(i),
              }
            }),
            records: record,
            favor: data[0].favor,
          })
          
          if(options.class == 'record') {
            let classMode = that.generateStyleMap(data, record)
            that.setData({
              allDown: true,
              showComments: true,
              answer: utils.convertToLetters(data[0].answer.toString()),
              userAnswer: utils.convertToLetters(record[0].userAnswer.toString()),
              spendTime: that.secondsToHMS(info.use_time),
              score: info.score,
              classMode,
              currentRate: that.formateRate(data[0].correct_rate),
            })
            
            wx.disableAlertBeforeUnload()
          }
        }
      })

      wx.enableAlertBeforeUnload({
        message: '离开页面后答题记录将消失',
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
      let selectedOptions = this.data.selectedOptions;
  
      // 根据题型判断是否为多选题，单选题直接替换选项，多选题追加或删除选项
      const optionType = this.data.questions[this.data.indexes].exercise_type;
      if (optionType === 0 || optionType === 2) {
        selectedOptions = []
        selectedOptions.push(index)
      } else if (optionType === 1) {
        const isSelected = selectedOptions.includes(index);
        if (isSelected) {
          selectedOptions.splice(selectedOptions.indexOf(index), 1);
        } else {
          selectedOptions.push(index);
        }
      }
      const allOptions = this.data.options.map((item, i) => {
        return {
          text: item.text,
          selected: selectedOptions.includes(i),
        }
      })
  
      this.setData({
        selectedOptions: selectedOptions,
        options: allOptions,
      });
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
        let selectedOptions = this.data.records[index].userAnswer.toString().split('').map(Number)
        let options = this.data.questions[index].options.split('~+~').map((item, i) => {
          return {
            text: utils.convertToLetters(i.toString()) + '. ' + item,
            selected: selectedOptions.includes(i),
          }
        })
        let record = this.data.records
        
        if(this.data.selectedOptions.length > 0 && this.data.selectedOptions[0] !== "") {
          record[this.data.indexes].isAnswer = true
          record[this.data.indexes]['userAnswer'] = this.data.selectedOptions.join('')
        }
        if(!this.data.allDown) {
          this.setData({
            showComments: false,
            records: record,
          })
        } else {
          this.setData({
            showComments: true,
          })
        }
        this.setData({
          indexes: index,
          selectedOptions: this.data.records[index].userAnswer.split(),
          options: options,
          answer: utils.convertToLetters(this.data.questions[index].answer.toString()),
          userAnswer: utils.convertToLetters(this.data.records[index].userAnswer.toString()),
          currentRate: this.formateRate(this.data.questions[index].correct_rate),
          favor: this.data.questions[index].favor,
          showModal: false,
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
      if(this.data.selectedOptions.length > 0 && this.data.selectedOptions[0] !== "") {
        record[this.data.indexes].isAnswer = true
        record[this.data.indexes]['userAnswer'] = this.data.selectedOptions.join('')
        isDown = true
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
        'record': this.data.records
      })
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
    console.log(favors, second_ids, indexs)
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
  }
})