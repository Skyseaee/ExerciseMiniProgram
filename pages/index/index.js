const app = getApp()

Page({
  data: {
    bannerList: [],
    firstCategory1: [],
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

    // 计算考研天数
    const targetDate = new Date('2025-12-21');
    let today = new Date();
    let timeDifference = targetDate.getTime() - today.getTime();
    that.setData({days: Math.ceil(timeDifference / (1000 * 60 * 60 * 24))});
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
    wx.setStorageSync('mainActiveIndex', id)
    wx.switchTab({
      url: '/pages/examinfo/examinfo',
    })
  },
  goDetail(t) {
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + t.currentTarget.dataset.id + '&name=' + t.currentTarget.dataset.name + '&time=' + t.currentTarget.dataset.time
    })
  },
  onShareAppMessage: function () {
    return {
      title: "研题帮，考试助手 ！",
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
  }
})