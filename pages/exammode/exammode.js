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
      is_first: 0,
      questions: [],
      records: [],
      indexes: 0, // 当前题目索引
      spendTime: 0,
      startTime: null,
      allDown: false,
      currentRate: 0,
      options: [],
      exam_id: 0, 
      objectiveScore: [],
      selectedOptions: '', // 用户选择的选项
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
      questionImageHeight: 0,
      commentImageHeight: 0,
      option_type: 0,
      countdown: "180:00:00", // 默认 180分钟
      timer: null,
      uploadImages: '',
      imgHeight: 100,
      imgWidth: 100,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      let that = this
      let date = new Date()
      let startTime = date.getTime()
      this.setData({
        startTime,
        exam_id: options.id
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
          exam_id: options.id,
        },
        success: function(res) {
          let data = res.data.data
          console.log(data)
          if(data.score == -1 && options.class == 'mock') {
            for(let i=0; i<data.question.length; i++) {
              record.push({"index": i, "isAnswer": false, "userAnswer": '', 'first_id': data.question[i].first_id, 'second_id': data.question[i].second_id, 'exercise_id': data.question[i].id, "correctAnswer": data.question[i].answer})
              data.question[i].user_answer = ''
            }
          } else if(options.class == 'answer'){
            record = JSON.parse(data.record)
            let classMode = that.generateStyleMap(data.question, record)
            that.setData({
              allDown: true,
              showComments: true,
              answer: utils.convertToLetters(record[0].correctAnswer.toString()),
              userAnswer: utils.convertToLetters(record[0].userAnswer.toString()),
              spendTime: that.secondsToHMS(data.use_time),
              score: data.score,
              currentRate: that.formateRate(data.question[0].correct_rate),
              classMode,
            })
            wx.disableAlertBeforeUnload()
          }
          // let selectedOptions = record[0].userAnswer.toString().split('').map(Number)
          let option = that.switchOptions(data.question[0].option_type, data.question[0].options, record[0].userAnswer, record[0].correctAnswer, that.data.showComments)
          that.setData({
            is_first: data.is_first,
            first_id: options.category,
            questions: data.question,
            options: option,
            records: record,
            favor: data.question[0].favor,
            option_type: data.question[0].option_type,
            uploadImages: data.question[0].user_answer,
          })
          // console.log(that.data.is_first) 

          if(data.score != -1) {
            that.setData({
              record: data.record,
              score: data.score,
              use_time: data.use_time,
            })
          }
          
          if(options.class == 'record') {
            let classMode = that.generateStyleMap(data.question, record)
            that.setData({
              allDown: true,
              showComments: true,
              answer: utils.convertToLetters(data.question[0].answer.toString()),
              userAnswer: utils.convertToLetters(record[0].userAnswer.toString()),
              spendTime: that.secondsToHMS(info.use_time),
              score: info.score,
              classMode,
              currentRate: that.formateRate(data.question[0].correct_rate),
            })
            
            wx.disableAlertBeforeUnload()
          }
        }
      })

      this.startCountdown(180 * 60);

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
      clearInterval(this.data.timer);
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
  
      selectedOptions = index
      
      let allOptions = this.switchOptions(this.data.option_type, this.data.questions[this.data.indexes].options, selectedOptions, this.data.questions[this.data.indexes].answer, this.data.showComments)

      let record = this.data.records
      let questions = this.data.questions
      if(selectedOptions != undefined) {
        record[this.data.indexes].isAnswer = true
        record[this.data.indexes].exercise_type = questions[this.data.indexes].exercise_type
        record[this.data.indexes]['userAnswer'] = selectedOptions
        questions[this.data.indexes]['isAnswer'] = 'answered'
      }

      this.setData({
        selectedOptions: selectedOptions,
        options: allOptions,
        records: record,
        questions,
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
        // let selectedOptions = this.data.records[index].userAnswer.toString().split('').map(Number)
        // let options = this.data.questions[index].options.split('~+~').map((item, i) => {
        //   return {
        //     text: utils.convertToLetters(i.toString()) + '. ' + item,
        //     selected: selectedOptions.includes(i),
        //   }
        // })
        let options = this.switchOptions(this.data.questions[index].option_type, this.data.questions[index].options, this.data.records[index].userAnswer, this.data.records[index].correctAnswer, this.data.showComments)
        let record = this.data.records
        if(this.data.selectedOptions.length > 0 && this.data.selectedOptions !== "") {
          record[this.data.indexes].isAnswer = true
          record[this.data.indexes]['userAnswer'] = this.data.selectedOptions
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
          selectedOptions: this.data.records[index].userAnswer,
          options: options,
          answer: utils.convertToLetters(this.data.questions[index].answer.toString()),
          userAnswer: utils.convertToLetters(this.data.records[index].userAnswer.toString()),
          currentRate: this.formateRate(this.data.questions[index].correct_rate),
          favor: this.data.questions[index].favor,
          showModal: false,
          option_type: this.data.questions[index].option_type,
          uploadImages: this.data.questions[index].user_answer,
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
          title: '无客观题答题记录，无法提交',
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
      let classMode = this.generateStyleMap(this.data.questions, this.data.records)
      let objectiveScore = [0, 0]
      for(let i=0; i<this.data.questions.length; i++) {
        question_id.push(this.data.questions[i].id)
        if (this.data.questions[i].option_type != 2) {
          objectiveScore[1] += 1
          if (this.data.records[i].userAnswer != undefined && this.data.records[i].userAnswer == this.data.records[i].correctAnswer) {
            objectiveScore[0] += 1
          }
        } 
      }
      
      let params = JSON.stringify({
        "uid": app.globalData.uid,
        'score': -1,
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
            score: -1,
            spendTime: that.secondsToHMS(internal),
            classMode,
            objectiveScore: objectiveScore,
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
      if (questions[i].option_type == 2) {
        classMode.push('stableAnswer')
      } else if(questions[i].answer === records[i].userAnswer) {
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
  },

  startCountdown(totalSeconds) {
    let that = this;
    let remain = totalSeconds;

    function update() {
      let h = Math.floor(remain / 3600);
      let m = Math.floor((remain % 3600) / 60);
      let s = remain % 60;

      let timeStr = 
        (h < 10 ? "0" + h : h) + ":" +
        (m < 10 ? "0" + m : m) + ":" +
        (s < 10 ? "0" + s : s);

      that.setData({ countdown: timeStr });

      if (remain <= 0) {
        clearInterval(that.data.timer);
        wx.showToast({
          title: '考试时间到',
          icon: 'none'
        });
        // 这里可以自动提交答案
      }
      remain--;
    }

    update(); // 先执行一次
    let timer = setInterval(update, 1000);
    this.setData({ timer });
  },

  chooseImage: function() {
    let that = this
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['original', 'compressed'],
      success(res) {
        console.log('选择结果:', res);

        const path = res.tempFiles[0].tempFilePath;
        that.setData({
          uploadImages: path
        });

        wx.uploadFile({
          url: 'https://www.skyseaee.cn/routine/auth_api/update_image', // 换成后端接口
          filePath: path,
          name: 'img_file',
          formData: {
            type: 'subjective' // 自定义目录，比如主观题图片
          },
          success(uploadRes) {
            // 后端返回的图片 URL
            const data = JSON.parse(uploadRes.data);
            if (data.code === 200) {  
              // 你的 JsonService::successful 返回的格式应该是 { code:200, data:url }
              let records = that.data.records
              let questions = that.data.questions
              records[that.data.indexes].isAnswer = true
              records[that.data.indexes].exercise_type = questions[that.data.indexes].exercise_type
              records[that.data.indexes]['userAnswer'] = data.msg
              questions[that.data.indexes]['user_answer'] = data.msg
              questions[that.data.indexes]['isAnswer'] = 'answered'
              that.setData({
                uploadImages: data.data.msg,
                questions: questions,
                records: records,
              });
              wx.showToast({
                title: '上传成功',
                icon: 'success'
              });
            } else {
              wx.showToast({
                title: '上传失败',
                icon: 'none'
              });
            }
          },
          fail(err) {
            console.error('上传失败:', err);
            wx.showToast({
              title: '上传失败',
              icon: 'none'
            });
          }
        });
      },
      fail(err) {
        console.error('选择失败:', err);
        wx.showToast({
          title: '图片上传失败',
          icon: 'error'
        })
      }
    })
  },

  switchOption: function(option_type, options, selectedOptions, answer, mode) {
    if (option_type == 1) {
      return ['A', 'B', 'C', 'D'].map((item, i) => {
        return {
          text: item,
          selected: utils.mappingOptions(i, answer, selectedOptions != undefined ? selectedOptions : -1, mode),
        }
      });
    } else {
      return options.split('~+~').map((item, i) => {
        return {
          text: utils.convertToLetters(i.toString()) + '. ' + item,
          selected: utils.mappingOptions(i, answer, selectedOptions != undefined ? selectedOptions : -1),
        }
      })
    }
  },

  switchOptionExamMode: function(option_type, options, selectedOptions, answer, mode) {
    if (option_type == 1) {
      return ['A', 'B', 'C', 'D'].map((item, i) => {
        return {
          text: item,
          selected: utils.mappingOptionsExamMode(i, answer, selectedOptions != undefined ? selectedOptions : -1, mode),
        }
      });
    } else {
      return options.split('~+~').map((item, i) => {
        return {
          text: utils.convertToLetters(i.toString()) + '. ' + item,
          selected: utils.mappingOptionsExamMode(i, answer, selectedOptions != undefined ? selectedOptions : -1),
        }
      })
    }
  },

  switchOptions: function(option_type, options, selectedOptions, answer, mode) {
    if (mode) {
      return this.switchOption(option_type, options, selectedOptions, answer, mode)
    } else {
      return this.switchOptionExamMode(option_type, options, selectedOptions, answer, mode)
    }
  },

  previewQuestionImage() {
    const currentImage = this.data.questions[this.data.indexes].question_img;
    if (!currentImage) return;
  
    wx.previewImage({
      current: currentImage, // 当前显示图片的链接
      urls: [currentImage]   // 图片列表（可预览多张）
    });
  },

  previewCommentImage() {
    const currentImage = this.data.questions[this.data.indexes].comment_img;
    if (!currentImage) return;
  
    wx.previewImage({
      current: currentImage, // 当前显示图片的链接
      urls: [currentImage]   // 图片列表（可预览多张）
    });
  },

  onImageLoad(e) {
    const { width, height } = e.detail;
    const scale = height / width;
    const baseWidth = wx.getSystemInfoSync().windowWidth * 0.9;
  
    // 想放大 1.5 倍，比如
    const displayWidth = baseWidth;
    const displayHeight = displayWidth * scale;

    this.setData({
      imgWidth: displayWidth,
      imgHeight: displayHeight
    });
  }

})