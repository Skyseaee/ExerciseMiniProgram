// pages/unlockBank/unlockBank.js
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
      categories: [],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      let that = this

      wx.request({
        url: 'https://www.skyseaee.cn/routine/auth_api/get_first_category_lockinfo',
        header: {
          "content-type": "application/x-www-form-urlencoded"
        },
        data: {
          uid: app.globalData.uid,
        },
        success: function(res) {
          let cate = res.data.data
          let count = 0
          for(let i=0; i<cate.length; i++) {
            if((cate[i].category_id != 1 && cate[i].category_id != 2) && !cate[i].exist) {
              count++
            }
          }
          
          if(count == 0) {
            for(let i=0; i<cate.length; i++) {
              if(cate[i].category_id == 1 || cate[i].category_id == 2) {
                cate[i].exist = true;
              }
            }
          }

          that.setData({
            categories: cate,
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

    },

    goToLock(e) {
      let index = e.currentTarget.dataset.index
      let cate = this.data.categories[index]

      if(this.data.categories[index].exist) return

      if(cate.category_id == 2) {
        this.payoff(cate.price, cate.name, cate.pic_url, 2)
        return
      }

      wx.navigateTo({
        url: '/pages/shareAndLock/shareAndLock?id=' + cate.category_id + '&pic_url=' + cate.pic_url + '&name=' + cate.name + '&price=' + cate.price,
      })
    },

    refreshInfo: function() {
      this.onLoad()
    },

    payoff: function(price, name, pic_url, first_id) {
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
          "price": price * 100,
          'title': name,
          'timeStamp': timeStamp,
          'cover': pic_url,
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
                          'first_id': first_id,
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
})