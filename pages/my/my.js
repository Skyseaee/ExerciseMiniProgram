// pages/my/my.js
import Toast from '../../dist/toast/toast';

const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isLogin: false,
        canIUseGetUserProfile: false,
        show: false,
        encode: '',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let encode = 'encode'
        // console.log(options)
        if(options &&　encode in options) {
          this.setData({
            encode: options.encode
          })
        }

        var that = this;
        var openid = wx.getStorageSync('openid')
        if (openid == '' || openid == undefined) {
            wx.login({
                success(res) {
                    if (res.code) {
                        wx.Apis.login.login(res.code, (code, data) => {
                            console.log(data);
                            wx.Apis.setUid(data.openid); //openid
                            wx.Apis.set('openid', data.openid);
                            wx.setStorageSync('userInfo', data);
                            wx.setStorageSync('uid', data.uid)
                            app.globalData.uid = data.uid
                            that.setData({
                              userInfo: data
                            })

                            let encode = that.data.encode
                            if(encode == '') {
                              that.onLoad()
                              return
                            }
                            let en = encode.split('_')
                            if(en[1] == data.uid + '') {
                              wx.showToast({
                                title: '无法给自己助力',
                                icon:'error'
                              })
                              return
                            }
                            wx.request({
                              url: 'https://www.skyseaee.cn/routine/auth_api/setLockRecord',
                              header: {
                                "content-type": "application/x-www-form-urlencoded"
                              },
                              data: {
                                friend_id: data.uid,
                                uid: en[1],
                                first_id: en[0],
                              },
                              success: function(res) {
                                if(res.data.data) {
                                  wx.showToast({
                                    title: '助力成功',
                                    icon: 'success'
                                  })
                                } else {
                                  wx.showToast({
                                    title: '已助力，无法重复助力',
                                  })
                                }
                              }
                            })
                            that.onLoad()
                        });
                    }
                }
            });
        } else {
          app.globalData.uid = wx.getStorageSync('uid')
          let encode = that.data.encode
          if(encode == '') return
          let en = encode.split('_')
          if(en[1] == app.globalData.uid + '') {
            wx.showToast({
              title: '无法给自己助力',
              icon:'error'
            })
            return
          }
          wx.request({
            url: 'https://www.skyseaee.cn/routine/auth_api/setLockRecord',
            header: {
              "content-type": "application/x-www-form-urlencoded"
            },
            data: {
              friend_id: app.globalData.uid,
              uid: en[1],
              first_id: en[0],
            },
            success: function(res) {
              if(res.data.data) {
                wx.showToast({
                  title: '助力成功',
                  icon: 'success'
                })
              } else {
                wx.showToast({
                  title: '已助力，无法重复助力',
                  icon: 'none',
                })
              }
            }
          })
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.setData({
            userInfo: wx.getStorageSync('userInfo'),
        })
    },

    login() {
        this.setData({
            isLogin: !this.data.isLogin
        })
    },

    onMyEvent: function (t) {
        this.login();
    },

    goRecord() {
        if (this.data.userInfo.nickName == undefined || this.data.userInfo.nickName == '') {
            this.login()
            return false;
        }
        wx.navigateTo({
            url: '/pages/record/record',
        })
    },

    goPoint() {
        if (this.data.userInfo.nickName == undefined || this.data.userInfo.nickName == '') {
            this.login()
            return false;
        }
        wx.navigateTo({
            url: '/pages/point/point',
        })
    },

    goCode() {
        if (this.data.userInfo.nickName == undefined || this.data.userInfo.nickName == '') {
            this.login()
            return false;
        }
        wx.navigateTo({
            url: '/pages/code/code',
        })
    },

    goSetting() {
        if (this.data.userInfo.nickName == undefined || this.data.userInfo.nickName == '') {
            this.login()
            return false;
        }
        wx.navigateTo({
            url: '/pages/setting/setting',
        })
    },

    goSign() {
        if (this.data.userInfo.nickName == undefined || this.data.userInfo.nickName == '') {
            this.login()
            return false;
        }
        wx.navigateTo({
            url: '/pages/sign/sign',
        })
    },

    goFeedback() {
        if (this.data.userInfo.nickName == undefined || this.data.userInfo.nickName == '') {
            this.login()
            return false;
        }
        wx.navigateTo({
            url: '/pages/feedback/feedback',
        })
    },
    goAbout() {
      wx.navigateTo({
        url: '/pages/intro/intro',
      })
    },
    
    onClose() {
        this.setData({ show: false });
    },
    onSelect(event) {
        console.log(event.detail)
        var that = this
        if (event.detail.name === "复制开发者QQ号") {
            wx.setClipboardData({
                data: '903363777',
                success: function (res) {

                }
            })
        } else {
            wx.setClipboardData({
                data: 'kossfirst',
                success: function (res) {

                }
            })
        }
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
          title: "Top帮研题集，考试助手 ！",
          path: "pages/index/index",
          imageUrl: "/images/share.png"
        };
    },

    goCategory: function() {
      if (this.data.userInfo.nickName == undefined || this.data.userInfo.nickName == '') {
        this.login()
        return false;
      }

      wx.navigateTo({
        url: '/pages/categories/categories',
      })
    },

    goBank: function() {
      if (this.data.userInfo.nickName == undefined || this.data.userInfo.nickName == '') {
        this.login()
        return false;
      }

      const userInfo = wx.getStorageSync('userInfo') || {};
      let uid = app.globalData.uid || userInfo.uid;
      if(!uid) {
        wx.showToast({
          title: '请您先登录',
          icon: 'error'
        })
        return
      }
      app.globalData.uid = uid

      wx.showModal({
        title: '请输入激活码',
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
                    title: '当前激活码无效，如有疑问请联系客服',
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
                    title: '激活失败，如有疑问请联系客服',
                    icon: 'none'
                  })
                }
              }
            })
          }
        }
      })
    },

    goUnlock: function() {
      if (this.data.userInfo.nickName == undefined || this.data.userInfo.nickName == '') {
        this.login()
        return false;
      }

      if(!app.globalData.uid) {
        wx.showToast({
          title: '请您先登录',
          icon: 'error'
        })
        return
      }

      wx.navigateTo({
        url: '/pages/unlockBank/unlockBank',
      })
    },

    onShareAppMessage: function () {
      return {
        title: "Top帮研题集，考试助手 ！",
        path: "pages/index/index",
        imageUrl: "/images/share.png"
      };
    },

    goMove: function() {
      if (this.data.userInfo.nickName == undefined || this.data.userInfo.nickName == '') {
        this.login()
        return false;
      }
      const userInfo = wx.getStorageSync('userInfo') || {};
      let uid = app.globalData.uid || userInfo.uid;
      if(!uid) {
        wx.showToast({
          title: '请您先登录',
          icon: 'error'
        })
        return
      }
      app.globalData.uid = uid
      wx.request({
        url: 'https://www.skyseaee.cn/routine/auth_api/has_auth_firstID',
        header: {
          "content-type": "application/x-www-form-urlencoded",
        },
        data: {
          "userid": uid,
          "first_id": 20,
        },
        success: function(res) {
          if(res.data.data == 1) {
            wx.showToast({
              title: '您已解锁该权限',
              icon: 'success',
            })
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
                            title: '您已激活对应题库，请勿重复激活',
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

      // wx.showModal({
      //   title: '请输入迁移码「 积分和打卡记录无法迁移 」)',
      //   content: '',
      //   editable: true,
      //   complete: (res) => {
      //     if (res.cancel) {
      //       return
      //     }
      
      //     if (res.confirm) {
      //       wx.request({
      //         url: 'https://www.skyseaee.cn/routine/auth_api/move_by_code',
      //         header: {
      //           "content-type": "application/x-www-form-urlencoded",
      //         },
      //         data: {
      //           "code": res.content,
      //           "uid": app.globalData.uid,
      //         },
      //         success: function(res) {
      //           console.log(res)
      //           if(res.data.code == 200) {
      //             wx.showToast({
      //               title: '迁移已完成',
      //               icon: 'success'
      //             })
      //           } else if(res.data.code == 400) {
      //             wx.showToast({
      //               title: '迁移码错误',
      //               icon: 'error'
      //             })
      //           }
      //         },
      //         fail: function(res) {
      //           wx.showToast({
      //             title: '迁移失败，请联系客服',
      //             icon: 'none'
      //           })
      //         }
      //       })
      //     }
      //   }
      // })
    },
})