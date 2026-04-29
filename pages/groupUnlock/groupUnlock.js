const app = getApp()

Page({
  data: {
    productInfo: {
      id: 0,
      name: '',
      pic_url: '',
      original_price: 99,
      group_price: 9.9
    },
    groupId: '',
    groupMembers: [],
    hasGroup: false,
    joinedCount: 0,
    countdown: '',
    inviteGroupId: '',
    isGroupOwner: false,
    groupStatus: '', // 'pending', 'success', 'expired'
    activationCode: '',
    showCodeModal: false
  },

  countdownTimer: null,

  onLoad(options) {
    const { id, group_id } = options

    // 检查登录状态
    const uid = app.globalData.uid || wx.getStorageSync('uid')
    if (!uid) {
      wx.showModal({
        title: '提示',
        content: '此功能需要登录，是否前往登录？',
        success: (res) => {
          if (res.confirm) {
            const currentPath = `/pages/groupUnlock/groupUnlock${id ? '?id=' + id : ''}${group_id ? (id ? '&' : '?') + 'group_id=' + group_id : ''}`
            wx.redirectTo({
              url: `/pages/login/login?redirect=${encodeURIComponent(currentPath)}`
            })
          } else {
            wx.navigateBack()
          }
        }
      })
      return
    }

    if (id) {
      this.setData({
        'productInfo.id': id
      })
      this.getProductInfo(id)
    }

    if (group_id) {
      this.setData({
        inviteGroupId: group_id
      })
    }
  },

  onShow() {
    if (this.data.productInfo.id) {
      this.getGroupList(() => {
        if (this.data.inviteGroupId && this.data.hasGroup === false) {
          this.autoJoinGroup(this.data.inviteGroupId)
        }
      })
    }
  },

  autoJoinGroup(groupId) {
    const uid = app.globalData.uid
    if (!uid) return

    wx.showLoading({ title: '正在加入拼团...' })

    wx.request({
      url: 'https://www.skyseaee.cn/routine/auth_api/join_group',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        group_id: groupId,
        uid: uid,
        class_id: this.data.productInfo.id
      },
      success: (res) => {
        wx.hideLoading()
        if (res.data && res.data.code === 200) {
          this.setData({ inviteGroupId: '' })
          const data = res.data.data || {}
          const members = data.list || []
          const updateTimestamp = data.update_timestamp || 0

          const filledMembers = [...members]
          while (filledMembers.length < 2) {
            filledMembers.push({ isEmpty: true })
          }

          this.setData({
            groupMembers: filledMembers,
            joinedCount: members.length,
            hasGroup: true,
            groupId: groupId,
            groupStatus: members.length >= 2 ? 'success' : 'pending'
          })

          if (updateTimestamp > 0) {
            this.startCountdown(updateTimestamp)
          }

          wx.showToast({ title: '加入拼团成功', icon: 'success' })
        } else {
          this.setData({ inviteGroupId: '' })
          const errorMsg = res.data.msg || '加入拼团失败'
          wx.showModal({
            title: '提示',
            content: errorMsg,
            showCancel: false,
            success: () => {
              if (errorMsg.includes('已满') || errorMsg.includes('已成功开团')) {
                wx.showModal({
                  title: '该团已满',
                  content: '您可点击"我要开团"发起新团',
                  showCancel: false,
                  confirmText: '我要开团',
                  success: () => {
                    this.createGroupAndPay()
                  }
                })
              }
            }
          })
        }
      },
      fail: () => {
        wx.hideLoading()
        this.setData({ inviteGroupId: '' })
        wx.showToast({ title: '网络错误', icon: 'none' })
      }
    })
  },

  getProductInfo(id) {
    wx.showLoading({ title: '加载中', mask: true })

    wx.request({
      url: 'https://www.skyseaee.cn/routine/auth_api/get_group_product_info_by_id',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: { id: id },
      success: (res) => {
        wx.hideLoading()
        
        if (res.data && res.data.code === 200) {
          const data = res.data.data || {}
          // 后端返回 class_price(原价) 和 discount_price(拼团价)
          this.setData({
            productInfo: {
              ...this.data.productInfo,
              ...data,
              original_price: data.class_price || this.data.productInfo.original_price,
              group_price: data.discount_price || this.data.productInfo.group_price
            }
          })
          this.getGroupList()
        } else {
          wx.showToast({ title: res.data.msg || '获取课程信息失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '网络错误', icon: 'none' })
      }
    })
  },

  getGroupList(callback) {
    const uid = app.globalData.uid
    if (!uid) return

    wx.request({
      url: 'https://www.skyseaee.cn/routine/auth_api/get_group_buyers_list',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        class_id: this.data.productInfo.id,
        uid: uid
      },
      success: (res) => {
        if (res.data && res.data.code === 200) {
          const data = res.data.data || {}
          const members = data.list || []
          const groupId = data.group_id || ''
          const hasGroup = data.has_group || false

          const filledMembers = [...members]
          while (filledMembers.length < 2) {
            filledMembers.push({ isEmpty: true })
          }

          const joinedCount = members.length
          const isOwner = members.length > 0 && members[0].uid === uid
          const groupStatus = joinedCount >= 2 ? 'success' : (hasGroup ? 'pending' : '')

          const updateTimestamp = data.update_timestamp || 0
          if (updateTimestamp > 0 && groupStatus !== 'success') {
            this.startCountdown(updateTimestamp)
          }

          this.setData({
            groupId: groupId,
            hasGroup: hasGroup,
            groupMembers: filledMembers,
            joinedCount: joinedCount,
            isGroupOwner: isOwner,
            groupStatus: groupStatus,
            activationCode: data.activation_code || ''
          }, () => {
            if (typeof callback === 'function') {
              callback()
            }
          })
        }
      }
    })
  },

  startCountdown(updateTimestamp) {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
    }

    const updateTime = updateTimestamp * 1000
    const endTime = updateTime + 24 * 60 * 60 * 1000

    const updateCountdown = () => {
      const now = Date.now()
      const remaining = endTime - now

      if (remaining <= 0) {
        this.setData({ countdown: '已过期', groupStatus: 'expired' })
        clearInterval(this.countdownTimer)
        return
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60))
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000)

      const format = (n) => n < 10 ? '0' + n : n
      const countdownStr = `${format(hours)}:${format(minutes)}:${format(seconds)}`

      this.setData({ countdown: countdownStr })
    }

    updateCountdown()
    this.countdownTimer = setInterval(updateCountdown, 1000)
  },

  onUnload() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
    }
  },

  onHide() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
    }
  },

  createGroupAndPay() {
    const uid = app.globalData.uid
    if (!uid) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }

    // 先支付，支付成功后再创建拼团
    this.processPaymentForGroup()
  },

  processPaymentForGroup() {
    const openid = wx.getStorageSync('openid')
    if (!openid || openid.length < 10) {
      wx.showToast({ title: '请清除缓存后重试', icon: 'none' })
      return
    }

    wx.showLoading({ title: '生成订单', mask: true })

    let timeStamp = Date.now().toString()

    wx.request({
      url: 'https://www.skyseaee.cn/routine/auth_api/pay_post',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        openid: openid,
        price: this.data.productInfo.group_price * 100,
        title: this.data.productInfo.class_name,
        timeStamp: timeStamp,
        cover: this.data.productInfo.class_img,
      },
      success: (res) => {
        wx.hideLoading()
        if (res.data && res.data.code === 200) {
          this.wxPayForGroup(res.data.data, timeStamp)
        } else {
          wx.showToast({ title: res.data.msg || '订单生成失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '网络错误', icon: 'none' })
      }
    })
  },

  wxPayForGroup(payData, timeStamp) {
    wx.requestPayment({
      nonceStr: payData.nonceStr,
      package: 'prepay_id=' + payData.pay_id,
      paySign: payData.pay_sign,
      timeStamp: timeStamp + '',
      signType: 'RSA',
      success: (res) => {
        if (res.errMsg === 'requestPayment:ok') {
          // 支付成功后创建拼团
          this.createGroupAfterPay()
        }
      },
      fail: (res) => {
        if (res.errMsg === 'requestPayment:fail cancel') {
          wx.showToast({ title: '支付已取消', icon: 'none' })
        } else {
          wx.showToast({ title: res.errMsg, icon: 'none' })
        }
      }
    })
  },

  createGroupAfterPay() {
    const uid = app.globalData.uid

    wx.showLoading({ title: '创建拼单中', mask: true })

    wx.request({
      url: 'https://www.skyseaee.cn/routine/auth_api/create_group',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        class_id: this.data.productInfo.id,
        uid: uid
      },
      success: (res) => {
        wx.hideLoading()
        if (res.data && res.data.code === 200) {
          const data = res.data.data || {}
          const groupId = data.group_id
          const members = data.list || []
          const updateTimestamp = data.update_timestamp || 0

          const filledMembers = [...members]
          while (filledMembers.length < 2) {
            filledMembers.push({ isEmpty: true })
          }

          this.setData({
            groupId: groupId,
            hasGroup: true,
            groupMembers: filledMembers,
            joinedCount: members.length,
            isGroupOwner: true,
            groupStatus: 'pending'
          })

          if (updateTimestamp > 0) {
            this.startCountdown(updateTimestamp)
          }

          wx.showToast({ title: '开团成功', icon: 'success' })
        } else {
          wx.showToast({ title: res.data.msg || '创建拼单失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '网络错误', icon: 'none' })
      }
    })
  },

  cancelGroup() {
    wx.showModal({
      title: '确认取消',
      content: '取消后拼单将解散，是否确认？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '取消中...' })
          wx.request({
            url: 'https://www.skyseaee.cn/routine/auth_api/cancel_group',
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
              group_id: this.data.groupId,
              uid: app.globalData.uid
            },
            success: (res) => {
              wx.hideLoading()
              if (res.data && res.data.code === 200) {
                wx.showToast({ title: '已取消拼单', icon: 'success' })
                this.setData({
                  hasGroup: false,
                  groupId: '',
                  groupMembers: [],
                  joinedCount: 0,
                  groupStatus: '',
                  countdown: ''
                })
              } else {
                wx.showToast({ title: res.data.msg || '取消失败', icon: 'none' })
              }
            },
            fail: () => {
              wx.hideLoading()
              wx.showToast({ title: '网络错误', icon: 'none' })
            }
          })
        }
      }
    })
  },

  joinGroupAndPay() {
    const groupId = this.data.groupId
    const uid = app.globalData.uid

    if (!uid) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }

    if (this.data.joinedCount >= 2) {
      wx.showModal({
        title: '该团已满',
        content: '您可点击"我要开团"发起新团',
        showCancel: false,
        confirmText: '我要开团',
        success: () => {
          this.createGroupAndPay()
        }
      })
      return
    }

    wx.showLoading({ title: '正在加入拼团', mask: true })

    wx.request({
      url: 'https://www.skyseaee.cn/routine/auth_api/join_group',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        group_id: groupId,
        uid: uid,
        class_id: this.data.productInfo.id
      },
      success: (res) => {
        wx.hideLoading()
        if (res.data && res.data.code === 200) {
          this.processPayment(groupId, this.data.productInfo.group_price)
        } else {
          const errorMsg = res.data.msg || '加入拼团失败'
          wx.showModal({
            title: '提示',
            content: errorMsg,
            showCancel: false,
            success: () => {
              if (errorMsg.includes('已满') || errorMsg.includes('已成功开团')) {
                wx.showModal({
                  title: '该团已满',
                  content: '您可点击"我要开团"发起新团',
                  showCancel: false,
                  confirmText: '我要开团',
                  success: () => {
                    this.createGroupAndPay()
                  }
                })
              }
            }
          })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '网络错误', icon: 'none' })
      }
    })
  },

  buyNow() {
    const uid = app.globalData.uid
    if (!uid) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }

    // 如果已经开团，直接购买需要补差价：原价 - 已支付的拼团价
    let price = this.data.productInfo.class_price
    if (this.data.hasGroup && this.data.groupStatus === 'pending') {
      price = this.data.productInfo.original_price - this.data.productInfo.group_price
      if (price < 0) price = 0
    }

    this.processPayment(0, price)
  },

  processPayment(groupId, price) {
    const openid = wx.getStorageSync('openid')
    if (!openid || openid.length < 10) {
      wx.showToast({ title: '请清除缓存后重试', icon: 'none' })
      return
    }

    wx.showLoading({ title: '生成订单', mask: true })

    let timeStamp = Date.now().toString()

    wx.request({
      url: 'https://www.skyseaee.cn/routine/auth_api/pay_post',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        openid: openid,
        price: price * 100,
        title: this.data.productInfo.class_name,
        timeStamp: timeStamp,
        cover: this.data.productInfo.class_img,
      },
      success: (res) => {
        wx.hideLoading()
        if (res.data && res.data.code === 200) {
          this.wxPay(res.data.data, timeStamp)
        } else {
          wx.showToast({ title: res.data.msg || '订单生成失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '网络错误', icon: 'none' })
      }
    })
  },

  wxPay(payData, timeStamp) {
    wx.requestPayment({
      nonceStr: payData.nonceStr,
      package: 'prepay_id=' + payData.pay_id,
      paySign: payData.pay_sign,
      timeStamp: timeStamp + '',
      signType: 'RSA',
      success: (res) => {
        if (res.errMsg === 'requestPayment:ok') {
          this.handlePaySuccess()
        }
      },
      fail: (res) => {
        if (res.errMsg === 'requestPayment:fail cancel') {
          wx.showToast({ title: '支付已取消', icon: 'none' })
        } else {
          wx.showToast({ title: res.errMsg, icon: 'none' })
        }
      }
    })
  },

  handlePaySuccess() {
    wx.request({
      url: 'https://www.skyseaee.cn/routine/auth_api/lock_store',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        first_id: this.data.productInfo.id,
        uid: app.globalData.uid
      },
      success: (res) => {
        wx.showToast({ title: '解锁成功', icon: 'success' })
        this.getGroupList()
      }
    })
  },

  shareToFriend(groupId) {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage']
    })
    this.setData({ shareGroupId: groupId })
  },

  onShareAppMessage() {
    const uid = app.globalData.uid || wx.getStorageSync('uid')
    if (!uid) {
      wx.showModal({
        title: '提示',
        content: '分享功能需要登录，是否前往登录？',
        success: (res) => {
          if (res.confirm) {
            const currentPath = `/pages/groupUnlock/groupUnlock?id=${this.data.productInfo.id}`
            wx.navigateTo({
              url: `/pages/login/login?redirect=${encodeURIComponent(currentPath)}`
            })
          }
        }
      })
      return {}
    }

    const groupId = this.data.groupId || ''
    const remainingSlots = 2 - (this.data.joinedCount || 0)
    const title = remainingSlots > 0
      ? `还差${remainingSlots}人拼团成功，快来一起解锁答疑班！`
      : '拼团成功！一起解锁答疑班'
    return {
      title: title,
      path: `/pages/groupUnlock/groupUnlock?id=${this.data.productInfo.id}&group_id=${groupId}&from_uid=${uid}`,
      imageUrl: this.data.productInfo.class_img
    }
  },

  showActivationCode() {
    this.setData({ showCodeModal: true })
  },

  closeCodeModal() {
    this.setData({ showCodeModal: false })
  },

  copyCode() {
    wx.setClipboardData({
      data: this.data.activationCode,
      success: () => {
        wx.showToast({ title: '复制成功', icon: 'success' })
      }
    })
  },

  onPullDownRefresh() {
    this.getGroupList()
    wx.stopPullDownRefresh()
  }
})
