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
        check_days: 0,
        info_images: [
            { src: '/images/tests.png', id: 0, description: '模拟考试', func: 'genTest'},
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

            // this.updateTotalExam()
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
          for(let i=0; i<total_exams.length; i++) {
            temp_total_questions += total_exams[i]["total_question_num"]
          }
          
          that.setData({
            auth: res.data.data.auth,
            total_exams: total_exams,
            total_questions_num: temp_total_questions,
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

      wx.navigateTo({
        url: '/pages/mockexam/mockexam?firstCategory=' + encodeURIComponent(JSON.stringify(this.data.current_question_bank)),
      })
      // let question = util.getRandomItems(5, this.data.total_questions_num - 1).join()
      // let cate = this.data.current_question_bank_type
      // console.log(this.data.current_question_bank_type)
      // wx.navigateTo({
      //   url: '/pages/exammode/exammode?class=mock&question=' + question + "&category=" + cate,
      // })
    },

    wrongAnswer: function() {
      wx.navigateTo({
        url: '/pages/wrongQuestion/wrongQuestion?firstID=' + this.data.current_question_bank_type
      })
    },

    myFavor: function() {
      wx.navigateTo({
        url: '/pages/favorExam/favorExam?firstID=' + this.data.current_question_bank_type,
      })
    },

    randomTest: function() {
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
    
    goToBasic: function() {
      wx.navigateTo({
        url: '/pages/examclass/examclass?stage=' + 'basic',
      })
    },

    goToImprove: function() {
      wx.navigateTo({
        url: '/pages/examclass/examclass?stage=' + 'improve',
      })
    },

    goToFinal: function() {
      wx.navigateTo({
        url: '/pages/examclass/examclass?stage=' + 'final',
      })
    },

    goToSimulate: function() {
      wx.navigateTo({
        url: '/pages/examclass/examclass?stage=' + 'simulate',
      })
    },
})