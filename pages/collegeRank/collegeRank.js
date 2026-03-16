const app = getApp()

Page({
  data: {
    rankList: [],
    provinceList: [
      '北京', '上海', '天津', '重庆',
      '河北', '山西', '辽宁', '吉林', '黑龙江',
      '江苏', '浙江', '安徽', '福建', '江西', '山东',
      '河南', '湖北', '湖南', '广东', '海南',
      '四川', '贵州', '云南', '陕西', '甘肃', '青海',
      '内蒙古', '广西', '西藏', '宁夏', '新疆'
    ],
    selectedProvince: '',
    provinceCollegeList: [],
    hasMore: true,
    currentPage: 1,
    isLoading: false
  },

  onLoad: function(options) {
    this.checkLoginAndLoadData()
  },

  checkLoginAndLoadData: function() {
    let value = app.globalData.uid
    if (!value) {
      value = wx.getStorageSync('uid')
      app.globalData.uid = value
    }

    if (!value || value == 0) {
      let userInfo = wx.getStorageSync('userInfo')
      if (userInfo != undefined) {
        app.globalData.uid = userInfo['uid']
        value = userInfo['uid']
      }
    }

    if (!value || value == 0) {
      wx.showToast({
        title: '尚未登录，请前往个人中心登录',
        icon: 'none',
        duration: 2000
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 2000)
      return
    }

    this.getCollegeRankList()
  },

  getCollegeRankList: function() {
    if (this.data.isLoading) return
    
    this.setData({ isLoading: true })
    
    wx.showLoading({
      title: '加载中',
      mask: true
    })

    const limit = 10
    const page = this.data.currentPage

    wx.request({
      url: 'https://www.skyseaee.cn/routine/auth_api/get_college_ranklists_by_paging',
      method: 'GET',
      data: {
        page: page,
        limit: limit
      },
      success: (res) => {
        wx.hideLoading()
        if (res.data && res.data.code === 200) {
          const newList = res.data.data || []
          this.setData({
            rankList: this.data.currentPage === 1 ? newList : this.data.rankList.concat(newList),
            hasMore: newList.length === limit,
            isLoading: false
          })
        } else {
          this.setData({ isLoading: false })
          wx.showToast({
            title: res.data.msg || '加载失败',
            icon: 'none'
          })
        }
      },
      fail: () => {
        wx.hideLoading()
        this.setData({ isLoading: false })
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    })
  },

  loadMoreRank: function() {
    if (!this.data.hasMore || this.data.isLoading) return
    
    this.setData({
      currentPage: this.data.currentPage + 1
    })
    this.getCollegeRankList()
  },

  selectProvince: function(e) {
    const province = e.currentTarget.dataset.province
    
    this.setData({
      selectedProvince: province,
      provinceCollegeList: []
    })

    this.getCollegeListByProvince(province)
  },

  getCollegeListByProvince: function(province) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })

    wx.request({
      url: 'https://www.skyseaee.cn/routine/auth_api/get_colleges_by_province_name',
      method: 'GET',
      data: {
        province: province
      },
      success: (res) => {
        wx.hideLoading()
        if (res.data && res.data.code === 200) {
          this.setData({
            provinceCollegeList: res.data.data || []
          })
        } else {
          wx.showToast({
            title: res.data.msg || '暂无数据',
            icon: 'none'
          })
        }
      },
      fail: () => {
        wx.hideLoading()
      }
    })
  },

  clearProvinceSearch: function() {
    this.setData({
      selectedProvince: '',
      provinceCollegeList: []
    })
  },

  voteForCollege: function(e) {
    let value = app.globalData.uid
    if (!value || value == 0) {
      wx.showToast({
        title: '尚未登录，请前往个人中心登录',
        icon: 'none'
      })
      return
    }

    const collegeId = e.currentTarget.dataset.id
    this.voteCollege(collegeId)
  },

  voteCollege: function(collegeId) {
    const userId = app.globalData.uid

    if (userId == undefined || userId == null || userId == 0) {
      wx.showToast({
        title: '尚未登录，请前往个人中心登录',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '助力中',
      mask: true
    })

    wx.request({
      url: 'https://www.skyseaee.cn/routine/auth_api/vote_college',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        college_id: collegeId,
        user_id: userId
      },
      success: (res) => {
        wx.hideLoading()
        if (res.data && res.data.code === 200) {
          const collegeIdNum = Number(collegeId)
          const updateList = (list) => {
            return list.map(item => {
              if (item.id === collegeIdNum) {
                return {
                  ...item,
                  like_num: (item.like_num || 0) + 1
                }
              }
              return item
            }).sort((a, b) => b.like_num - a.like_num)
          }

          if (this.data.provinceCollegeList.length > 0) {
            this.setData({
              provinceCollegeList: updateList(this.data.provinceCollegeList)
            })
          }

          this.setData({
            rankList: updateList(this.data.rankList)
          })

          wx.showToast({
            title: '助力成功',
            icon: 'success'
          })
        } else {
          const msg = res.data.msg || '助力失败'
          wx.showToast({
            title: msg.includes('已助力') ? '您今天已为该校助力过啦' : msg,
            icon: 'none'
          })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    })
  },

  goBack: function() {
    wx.navigateBack()
  },

  onShareAppMessage: function() {
    return {
      title: 'Top帮研题集，校园热度榜！',
      path: 'pages/index/index',
      imageUrl: '/images/share.png'
    }
  }
})
