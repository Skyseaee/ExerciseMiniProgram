// pages/shareAndLock/shareAndLock.js
const app = getApp()
const util = require('../../utils/util');

Page({

    /**
     * 页面的初始数据
     */
    data: {
      first_id: 0, 
      pic_url: '',
      name: '',
      price: '',
      curr_discount: 1,
      records: [],
      curr_price: 0,
      encode: '',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      let that = this

      this.setData({
        first_id: options.id,
        pic_url: options.pic_url,
        name: options.name,
        price: options.price,
        encode: options.id + '_' + app.globalData.uid,
      })

      console.log(this.data.encode)

      wx.request({
        url: 'https://www.skyseaee.cn/routine/auth_api/getLockRecord',
        header: {
          "content-type": "application/x-www-form-urlencoded"
        },
        data: {
          uid: app.globalData.uid,
          first_id: options.id,
        },
        success: function(res) {
          if(typeof res.data.data == 'number') {
            wx.showToast({
              title: '该题库已解锁',
              icon: 'success'
            })
            wx.navigateBack()
          }

          let discord = 1
          if(res.data.data.length == 1) {
            discord = 0.8
          } else if(res.data.data.length == 2) {
            discord = 0.7
          } else if(res.data.data.length == 3) {
            discord = 0.5
          }

          that.setData({
            records: res.data.data,
            curr_discount: discord,
            curr_price: (options.price * discord).toFixed(2)
          })
        }
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
      return {
        title: "我的学习急需你的助力",
        path: `/pages/my/my?encode=` + this.data.encode,
        imageUrl: "/images/share.png"
      }
    },

    showInfo() {
      if(this.data.records.length >= 3) {
        wx.showToast({
          title: '当前助力已满',
        })
        return
      }

      wx.showModal({
        title: '助力规则',
        content: '每个题库最多可以邀请三名好友进行助力 \r\n一个好友助力享受8折 \r\n两个好友助力享受7折 \r\n三个及以上好友助力享受5折优惠',
        showCancel: false,
        complete: (res) => {
          if (res.confirm) {
            return
          }
        }
      })
    },

    payoff: function() {
      let that = this
      let timeStamp = Date.now().toString()
      let openid = wx.getStorageSync('openid')
      if(openid.length < 10) {
        wx.showToast({
          title: '请清除缓存后重试, 或联系客服',
        })
        return
      }
      wx.request({
        url: 'https://www.skyseaee.cn/routine/auth_api/pay_post',
        header: {
          "content-type": "application/x-www-form-urlencoded",
        },
        data: {
          "openid": openid,
          "price": this.data.curr_price * 100,
          'title': this.data.name,
          'timeStamp': timeStamp,
          'cover': this.data.pic_url,
        },
        success: function(res) {
          console.log(res.data)
          wx.requestPayment({
            nonceStr: res.data.data.nonceStr,
            package: 'prepay_id=' + res.data.data.pay_id,
            paySign: res.data.data.pay_sign,
            timeStamp: timeStamp+'',
            signType: "RSA",
            success: function(res) {
              if (res.errMsg === 'requestPayment:ok') {
                  wx.showModal({
                    title: '支付成功',
                    showCancel:false,
                    complete: (res) => {
                      wx.request({
                        url: 'https://www.skyseaee.cn/routine/auth_api/lock_store',
                        header: {
                          "content-type": "application/x-www-form-urlencoded",
                        },
                        data: {
                          'first_id': that.data.first_id,
                          'uid': app.globalData.uid,
                        },
                        success: function(res) {
                          wx.showToast({
                            title: '解锁成功',
                            icon: 'success'
                          })
                          wx.navigateBack()
                        }
                      })
                    }
                  })
              }else{
                  wx.showToast({
                      icon:"none",
                      title: '支付失败',
                  })
              }
            },
            fail: function(res) {
              console.log(res)
              if(res.errMsg == 'requestPayment:fail cancel'){
                wx.showToast({
                    icon:"none",
                    title: '支付已取消',
                })
              }else{
                  wx.showToast({
                      icon:"none",
                      title: res.errMsg
                  })
              }
            }
          })
        },
        fail: function(res) {
          wx.showToast({
            title: '订单生成失败，请稍后再试',
          })
        }
      })
    },

    generateLink: function() {
      let env = 'release'
      let query = this.data.encode
      
      wx.request({
        url: 'https://www.skyseaee.cn/routine/auth_api/generate_ticket',
        header: {
          "content-type": "application/x-www-form-urlencoded",
        },
        data: {
          'path': 'pages/my/my',
          'query': 'encode=' + query,
          'env_version': env,
        },
        success: function(res) {
          console.log(res)
          let link = res.data.data.url_link
          wx.showModal({
            title: '复制专属连接',
            content: link,
            showCancel: false,
            complete: (res) => {
              if (res.confirm) {
                wx.setClipboardData({
                  data: link,
                  success: function (res) {
                    wx.getClipboardData({
                      success: function (res) {
                        wx.showToast({
                          title: '复制成功'
                        })
                      }
                    })
                  }
                })
              }
            }
          })
        }
      })
    }
})