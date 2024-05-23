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
        actions: [
            {
                name: '复制开发者微信号',
            },
            {
                name: '复制开发者QQ号',
            },
        ]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // if (wx.getUserProfile) {
        //     this.setData({
        //         canIUseGetUserProfile: true
        //     })
        // }
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
          title: "智慧考题宝，考试助手 ！",
          path: "pages/index/index",
          imageUrl: "/images/share.png"
        };
    },

    goCategory: function() {
      wx.navigateTo({
        url: '/pages/categories/categories',
      })
    },

    goUnlock: function() {
      if(!app.globalData.uid) {
        wx.showToast({
          title: '请您先登录',
          icon: 'error'
        })
      }
      wx.showModal({
        title: '请输入激活码',
        content: '',
        editable: true,
        complete: (res) => {
          if (res.cancel) {
            return
          }
      
          if (res.confirm) {
            console.log(res.content)
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

    onShareAppMessage: function () {
      return {
        title: "刷题小助手，考试助手 ！",
        path: "pages/index/index",
        imageUrl: "/images/share.png"
      };
    },
})