const app = getApp()
const util = require('../../utils/util')

Page({
  data: {
    bannerList: [],
    firstCategory1: [],
    firstCategory2: [],
    notice: '',
    days: Number,
    persistDays: 0,
    correctRate: 100,
  },
  onLoad() {
    var that = this;

    let value = app.globalData.uid
    if(!value) {
      value = wx.getStorageSync('uid')
      app.globalData.uid = value
    }

    if(!value || value == 0) {
      let userInfo = wx.getStorageSync('userInfo')
      if(userInfo != undefined) {
        app.globalData.uid = userInfo['uid']
        value = userInfo['uid']
      }
    }


    if(value) {
      wx.request({
        url: 'https://www.skyseaee.cn/routine/auth_api/get_user_and_insert_if_notexist',
        header: {
          "content-type": "application/x-www-form-urlencoded",
        },
        data: {
          "id": value,
        },
        success: function(res) {
          let data = res.data.data

          let persistDays = ''
          if(data.is_day_sign) {
            persistDays = '已打卡'
          } else {
            persistDays = '未打卡'
          }

          that.setData({
            persistDays: persistDays,
            correctRate: that.formateRate(data.correct_rate),
          })
        }
      })
    }

    //请求轮播图数据
    wx.Apis.api.bannerList((code, data) => {
      that.setData({
        bannerList: data,
        notice: wx.getStorageSync('notice')
      })
    });
    //一级分类
    wx.Apis.api.firstShowCategory((code, data) => {
      let firstCategory1 = [];
    //   let firstCategory2 = [];
      for(let i=0; i<data.length; i++) {
          firstCategory1.push(data[i]);
      }
      console.log(firstCategory1)
      that.setData({
        firstCategory1: firstCategory1,
      })
    });

    this.getFirstCategory2()

    // 计算考研天数
    const targetDate = Date.UTC(2026, 11, 20);
    const today = Date.UTC(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate()
    );
    const days = (targetDate - today) / (1000 * 60 * 60 * 24);
    that.setData({ days });

  },
  onShow() {
    var userInfo = wx.getStorageSync('userInfo');
    if(userInfo){
        this.setData({
            myCategory: wx.getStorageSync('myCategory')
        })
    }
  },
  goCategry(t){
    if (app.globalData.uid == 0) {
      wx.showToast({
        title: '尚未登录, 请前往个人中心登录',
        icon: 'none'
      })
      return
    }

    var id = t.currentTarget.dataset.id;
    app.globalData.mainActiveIndex = id;
    if(id == 21) {
      wx.setStorageSync('mainActiveIndex', 20)
    } else {
      wx.setStorageSync('mainActiveIndex', id)
    }
    
    if(id == 20 || id == 21) {
      // validate auth
      let uid = app.globalData.uid
      let that = this
      wx.request({
        url: 'https://www.skyseaee.cn/routine/auth_api/has_auth_firstID',
        header: {
          "content-type": "application/x-www-form-urlencoded",
        },
        data: {
          "userid": uid,
          "first_id": id,
        },
        success: function(res) {
          if(res.data.data == 1) {
            if (id == 20) {
              wx.switchTab({
                url: '/pages/examinfo/examinfo',
              })
            } else {
              wx.navigateTo({
                url: '/pages/mockexam/mockexam?firstCategory=' + encodeURIComponent(JSON.stringify(that.data.firstCategory2[5])),
              })
            }
          } else {
            wx.showModal({
              title: '请入群联系小助手获得激活码',
              content: '',
              editable: true,
              complete: (res) => {
                if (res.cancel) {
                  return
                }
            
                if (res.confirm) {
                  wx.request({
                    url: 'https://www.skyseaee.cn/routine/auth_api/use_code',
                    header: {
                      "content-type": "application/x-www-form-urlencoded",
                    },
                    data: {
                      "code": res.content,
                      "userid": app.globalData.uid,
                    },
                    success: function(res) {
                      let data = res.data
                      console.log(data)
                      if(data.code == 400){
                        wx.showToast({
                          title: '当前激活码无效，如有疑问请入群联系小助手',
                          icon: 'none'
                        })
                      } else if(data.code == 200) {
                        if(data.msg == 'existed') {
                          wx.showToast({
                            title: '您已激活激活码对应题库，请勿重复激活',
                            icon: 'none',
                            duration: 2000,
                          })
                        } else {
                          wx.showToast({
                            title: '激活成功',
                            icon: 'success'
                          })
                        }
                      } else {
                        wx.showToast({
                          title: '激活失败，如有疑问请联系小助手',
                          icon: 'none'
                        })
                      }
                    }
                  })
                }
              }
            })
          }
        }
      })
    } else {
      wx.switchTab({
        url: '/pages/examinfo/examinfo',
      })
    }
  },
  goDetail(t) {
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + t.currentTarget.dataset.id + '&name=' + t.currentTarget.dataset.name + '&time=' + t.currentTarget.dataset.time
    })
  },

  onShareAppMessage: function () {
    return {
      title: "Top帮研题集，考试助手 ！",
      path: "pages/index/index",
      imageUrl: "/images/share.png"
    };
  },

  formateRate: function(rate) {
    if(!rate) return 100
    let r = rate.toFixed(3) * 100
    return r.toString().substring(0, 4)
  },

  bonus: function() {
    if (app.globalData.uid == 0) {
      wx.showToast({
        title: '尚未登录, 请前往个人中心登录',
        icon: 'none'
      })
      return
    }
    wx.navigateTo({
        url: '/pages/point/point',
    })
  },

  infos: function() {
    if (app.globalData.uid == 0) {
      wx.showToast({
        title: '尚未登录, 请前往个人中心登录',
        icon: 'none'
      })
      return
    }
    wx.navigateTo({
        url: '/pages/exerciseCharts/exerciseCharts',
    })
  },

  getFirstCategory2: function() {
    let that = this
    wx.request({
      url: 'https://www.skyseaee.cn/routine/auth_api/get_first_category2',
      method: "GET",
      success: function(res) {
        that.setData({
          firstCategory2: res.data.data,
        })
      }
    })
  },
})