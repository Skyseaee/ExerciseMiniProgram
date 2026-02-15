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
        categorys: [],
        total_count: 0,
        total_exams: [],
        display: 1, // 0 - 本页为难度分级 1 - 本页为学科分级
        info_images: [
            { src: '/images/tests.png', id: 0, description: '随机抽题', func: 'genRandomTest'},
            { src: '/images/wrong_answers.png', id: 1, description: '错题集', func: 'wrongAnswer' },
            { src: '/images/favor.png', id: 2, description: '我的收藏', func: 'myFavor' },
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
                      wx.Apis.login.login(res.code, (code, data) => {
                          // console.log(data);
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
      // 查看用户数是否已经选择了题库
      let mainActiveIndex = wx.getStorageSync('mainActiveIndex')
        
      // 如果选择了则加载题库对应的二级题库
      if(mainActiveIndex != 0) {
          let that = this
          wx.request({
            url: 'https://www.skyseaee.cn/routine/auth_api/get_specfic_first_category',
            method: "POST",
            header:{
              "content-type": "application/x-www-form-urlencoded",
              'personal': 'skyseaee',
            },
            data: {
              first_id: mainActiveIndex,
            },
            success: function(res) {
              let data = res.data.data

              that.setData({
                current_question_bank: data,
              })
            }
          })

          this.setData({
              current_question_bank_type: mainActiveIndex,
          })

          this.updateTotalExam()
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
          let that = this
          wx.request({
            url: 'https://www.skyseaee.cn/routine/auth_api/get_specfic_first_category',
            method: "POST",
            header:{
              "content-type": "application/x-www-form-urlencoded",
              'personal': 'skyseaee',
            },
            data: {
              first_id: mainActiveIndex,
            },
            success: function(res) {
              let data = res.data.data
              that.setData({
                current_question_bank: data,
              })
            }
          })

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
      let that = this
      wx.request({
        url: 'https://www.skyseaee.cn/routine/auth_api/get_first_category_by_first_categoryID',
        method: "POST",
        header:{
          "content-type": "application/x-www-form-urlencoded",
          'personal': 'skyseaee',
        },
        data: {
          first_id: that.data.current_question_bank_type,
        },
        success: function(res) {
          console.log(res.data.data)
          let categorys = res.data.data
          let total = categorys.reduce((sum, item) => sum + (item.exercise_num || 0), 0)

          for(let i=0; i<categorys.length; i++) {
            categorys[i]['up'] = false;
            categorys[i]['chapters'] = [];
          }

          that.setData({
            categorys: categorys,
            total_count: total,  // 可以用于页面展示总题数
            display: 1,
          })
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
    },

    wrongAnswer: function() {
      this.checkAuth()
      wx.navigateTo({
        url: '/pages/wrongQuestion/wrongQuestion?firstID=' + this.data.current_question_bank_type + '&stage=' + '',
      })
    },

    myFavor: function() {
      this.checkAuth()
      wx.navigateTo({
        url: '/pages/favorExam/favorExam?firstID=' + this.data.current_question_bank_type + '&stage=' + '',
      })
    },

    randomTest: function() {
      wx.showToast({
        title: '暂不支持',
        icon: 'success',
        duration: 2000
      });
    },

    genRandomTest: function() {
      this.checkAuth()
      let that = this
      wx.showModal({
        title: '请输入题目数量',
        editable: true, // 关键属性：允许输入
        placeholderText: '输入 1 ～ 40 的整数',
        success(res) {
          if (res.confirm) {
            const count = parseInt(res.content);
            if (isNaN(count) || count <= 0 || count > 40) {
              wx.showToast({
                title: '请输入有效数字，请勿超过40题',
                icon: 'none'
              });
              return;
            }

            wx.navigateTo({
              url: '/pages/randexam/randexam?count=' + count + '&first_id=' + that.data.current_question_bank_type,
            })

            // 发起请求
            // wx.request({
            //   url: 'https://www.skyseaee.cn/routine/auth_api/gen_random_test', // 后端接口地址
            //   method: 'POST',
            //   data: {
            //     count: count,
            //     uid: app.globalData.uid,
            //     first_id: that.data.current_question_bank_type,
            //     stage: this.data.stage,
            //   },
            //   success(resp) {
            //     if (resp.data && resp.data.questions) {
            //       // 假设你用 questionList 渲染题目
            //       that.setData({
            //         questionList: resp.data.questions
            //       });
            //     } else {
            //       wx.showToast({
            //         title: '题目获取失败',
            //         icon: 'none'
            //       });
            //     }
            //   },
            //   fail() {
            //     wx.showToast({
            //       title: '网络请求失败',
            //       icon: 'none'
            //     });
            //   }
            // });
          }
        }
      });
    },

    ranking: function() {
      wx.navigateTo({
        url: '/pages/rank/rank',
      })
    },

    checkAuth: function() {
      var openid = wx.getStorageSync('openid')
      if (openid == '' || openid == undefined) {
        wx.login({
          success(res) {
                if (res.code) {
                    wx.Apis.login.login(res.code, (code, data) => {
                        // console.log(data);
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

    goToCategory: function(t) {
      // wx.setStorageSync('mainActiveIndex', t.currentTarget.dataset.id)
      this.checkAuth()
      if(this.data.current_question_bank_type == 16) {
        wx.navigateTo({
          url: '/pages/exercise/exercise?stage=' + 'basic'+'&firstID='+t.currentTarget.dataset.id,
        })
      } else if(this.data.current_question_bank_type == 17) {
        wx.navigateTo({
          url: '/pages/exercise/exercise?stage=' + 'improve'+'&firstID='+t.currentTarget.dataset.id,
        })
      } else if(this.data.current_question_bank_type == 18) {
        wx.navigateTo({
          url: '/pages/exercise/exercise?stage=' + 'final'+'&firstID='+t.currentTarget.dataset.id,
        })
      } else if(this.data.current_question_bank_type == 19) {
        wx.navigateTo({
          url: '/pages/exercise/exercise?stage=' + 'simulate'+'&firstID='+t.currentTarget.dataset.id,
        })
      } else if(this.data.current_question_bank_type == 20) {
        wx.navigateTo({
          url: '/pages/exercise/exercise?stage=' + 'vip'+'&firstID='+t.currentTarget.dataset.id,
        })
      }
    },

    showChapter: function(t) {
      let id = t.target.dataset.id
      let that = this
      let categorys = this.data.categorys
      if(categorys[id]['up'] == false && categorys[id]['chapters'].length == 0) {
        wx.request({
          url: 'https://www.skyseaee.cn/routine/auth_api/get_second_category_by_first_category',
          method: 'POST',
          data: {
            'first_id': categorys[id]['id'],
          },
          success: function(res) {
            let cates = res.data.data
            categorys[id]['chapters'] = cates
            categorys[id]['up'] = true
            that.setData({
              categorys: categorys,
            })
          },
          fail: function(res) {
            wx.showToast({
              title: '列表获取失败，请稍后再试',
            })
          }
        })
      } else if(categorys[id]['up'] == false){
        categorys[id]['up'] = true
        that.setData({
          categorys: categorys,
        })
      } else {
        categorys[id]['up'] = false
        that.setData({
          categorys: categorys,
        })
      }
    },

    swicthChapter: function(t) {
      let id = t.target.dataset.id
      this.checkAuth()
      if(this.data.current_question_bank_type == 16) {
        wx.navigateTo({
          url: '/pages/exercise/exercise?stage=basic'+'&secondID='+id,
        })
      } else if(this.data.current_question_bank_type == 17) {
        wx.navigateTo({
          url: '/pages/exercise/exercise?stage=improve'+'&secondID='+id,
        })
      } else if(this.data.current_question_bank_type == 18) {
        wx.navigateTo({
          url: '/pages/exercise/exercise?stage=final'+'&secondID='+id,
        })
      } else if(this.data.current_question_bank_type == 19) {
        wx.navigateTo({
          url: '/pages/exercise/exercise?stage=simulate'+'&secondID='+id,
        })
      } else if(this.data.current_question_bank_type == 20) {
        wx.navigateTo({
          url: '/pages/exercise/exercise?stage=vip'+'&secondID='+id,
        })
      }
    },

    resetAnswer: function() {
      let that = this

      wx.showModal({
        title: '',
        content: '请确认是否清空当前题库所有刷题记录以及错题记录',
        complete: (res) => {
          if (res.cancel) {
            
          }
      
          if (res.confirm) {
            let stage = 'basic'
            let id = this.data.current_question_bank_type
            if (id == 17) {
              stage = 'improve'
            } else if (id == 18) {
              stage = 'final'
            } else if (id == 19) {
              stage = 'simulate'
            } else if (id == 20){
              stage = 'vip'
            }

            wx.request({
              url: 'https://www.skyseaee.cn/routine/auth_api/clear_exam_by_firstID',
              method: "POST",
              header:{
                "content-type": "application/x-www-form-urlencoded",
                'personal': 'skyseaee',
              },
              data: {
                userid: app.globalData.uid,
                first_id: id,
                stage: stage,
              },
              success: function(res) {
                wx.showToast({
                  title: '已清空',
                  icon: "success"
                })

                that.onShow()
              }
            })
          }
        }
      })
    },
})