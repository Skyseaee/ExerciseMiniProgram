// pages/examinfo.js
const app = getApp();

const question = require('../../utils/question');
const util = require('../../utils/util')

Page({

    /** 
     * 页面的初始数据
     */
    data: {
        isLogin: false,
        current_question_bank_type: 0, // 当前题库的ID
        current_question_bank: null,  // 当前题库的具体信息
        total_exams: [],
        total_questions_num: 0,
        already_answered: 0,
        correct_answer_rate: 100,
        check_days: 0,
        info_images: [
            { src: '/images/tests.png', id: 0, description: '模拟考试', func: 'genTest'},
            { src: '/images/wrong_answers.png', id: 1, description: '错题集', func: 'wrongAnswer' },
            { src: '/images/favor.png', id: 2, description: '我的收藏', func: 'myFavor' },
            { src: '/images/random_test.png', id: 3, description: '随机练习', func: 'randomTest' },
            { src: '/images/ranking.png', id: 4, description: '刷题排行', func: 'ranking' },
        ],
        auth: 'false',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        var that = this;
        var openid = wx.getStorageSync('openid')
        if (openid == '' || openid == undefined) {
            wx.login({
                success(res) {
                    if (res.code) {
                        console.log(res.code)
                        wx.Apis.login.login(res.code, (code, data) => {
                            console.log(data);
                            wx.Apis.setUid(data.openid); //openid
                            wx.Apis.set('openid', data.openid);
                            wx.setStorageSync('userInfo', data);
                            that.setData({
                                userInfo: data
                            })
                        });
                    }
                }
            });
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
        // 查看用户数是否已经选择了题库
        let mainActiveIndex = wx.getStorageSync('mainActiveIndex')
        
        // 如果选择了则加载题库对应的二级题库
        if(mainActiveIndex != 0) {
            wx.Apis.api.firstShowCategory((code, data) => {
                for(let i=0; i<data.length; i++) {
                    if(data[i].id == this.data.current_question_bank_type) {
                        this.setData({
                            current_question_bank: data[i],
                        })
                    } else {
                        continue
                    }
                }
            });

            this.setData({
                current_question_bank_type: mainActiveIndex,
            })

            this.updateTotalExam()
        }
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

    /**
     *  调用接口更新total exam
     *  TODO: finish api 
     */
    updateTotalExam() {
      let total_exams = []
      let that = this
      wx.request({
        url: 'https://www.skyseaee.cn/routine/auth_api/get_exercise_by_first_category',
        method: "POST",
        header:{
          "content-type": "application/x-www-form-urlencoded",
          'personal': 'skyseaee',
        },
        data: {
          userid: app.globalData.uid,
          first_id: this.data.current_question_bank_type,
        },
        success: function(res) {
          // console.log(res.data.data.secondMap)
          let data = res.data.data.secondMap
          for(let id in data) {
            if(data[id].count == 0) continue
            total_exams.push({
              "exam_id": id,
              "exam_title": data[id].name,
              "finish_question": data[id].alreadyPratice,
              "total_question_num": data[id].count,
              "correct_answer": data[id].correct,
              "percent": Math.round(data[id].alreadyPratice * 100 / data[id].count),
            })
          }

          let temp_total_questions = 0
          let already_answered = 0
          let correct_answered = 0
          for(let i=0; i<total_exams.length; i++) {
            temp_total_questions += total_exams[i]["total_question_num"]
            already_answered += total_exams[i]["finish_question"]
            correct_answered += total_exams[i]["correct_answer"]
            total_exams[i].correct_rate = total_exams[i]["correct_answer"] / total_exams[i]["finish_question"]
          }
          
          that.setData({
            auth: res.data.data.auth,
            total_exams: total_exams,
            total_questions_num: temp_total_questions,
            already_answered: already_answered,
            correct_answer_rate: already_answered != 0 ? (correct_answered * 100 / already_answered).toFixed(1) : 100,
          })
          // console.log(total_exams)
        },
        fail: function(res) {
          wx.showToast({
            title: '当前学科正在加紧录入题目中，请暂时选择其他学科',
            icon: 'none'
          });
      
          // Optionally, you can navigate back to the previous page
          wx.navigateBack({
            delta: 1  // 1 means navigate back to the previous page
          });
        }
      })
    },

    redirectToExam(event) {
      let id = event.currentTarget.dataset.id;
      let exam_pointed = this.data.total_exams[id];
      console.log(exam_pointed)
      wx.navigateTo({
        url: '/pages/exercise/exercise?id=' + exam_pointed.exam_id + '&firstID=' + this.data.current_question_bank_type + '&auth=' + this.data.auth,
      })
    },

    genTest: function() {
      if(!this.data.auth) {
        wx.showToast({
          title: '您暂未开通该题库权限',
          icon: 'none'
        })
        return
      }

      if(this.data.total_questions_num < 4) {
        wx.showToast({
          title: '本科目暂时不支持该功能',
          icon: 'none'
        })
        return
      }
      let question = util.getRandomItems(5, this.data.total_questions_num - 1).join()
      let cate = this.data.current_question_bank_type
      console.log(this.data.current_question_bank_type)
      wx.navigateTo({
        url: '/pages/exammode/exammode?class=mock&question=' + question + "&category=" + cate,
      })
    },

    wrongAnswer: function() {
      console.log('wrong answer')
      wx.navigateTo({
        url: '/pages/wrongQuestion/wrongQuestion?firstID=' + this.data.current_question_bank_type,
      })
    },

    myFavor: function() {
      console.log('my favor')
      wx.navigateTo({
        url: '/pages/favorExam/favorExam?firstID=' + this.data.current_question_bank_type,
      })
    },

    randomTest: function() {
      console.log('random test')
      wx.showToast({
        title: '暂不支持',
        icon: 'success',
        duration: 2000
      });
    },

    ranking: function() {
      wx.navigateTo({
        url: '/pages/rank/rank',
      })
    },

    clearExam: function() {
      wx.showModal({
        title: '',
        content: '请确认是否清空当前题库所有刷题记录',
        complete: (res) => {
          if (res.cancel) {
            
          }
      
          if (res.confirm) {
            wx.request({
              url: 'https://www.skyseaee.cn/routine/auth_api/clear_exam_by_firstID',
              method: "POST",
              header:{
                "content-type": "application/x-www-form-urlencoded",
                'personal': 'skyseaee',
              },
              data: {
                userid: app.globalData.uid,
                first_id: this.data.current_question_bank_type,
              },
              success: function(res) {
                wx.showToast({
                  title: '已清空',
                  icon: "success"
                })
              }
            })
          }
        }
      })
    }
})