// pages/rank/rank.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    totalList: [],
    rankList: [],
    weekList: [],
    nodata:true,
    selectedTab: '总排行'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    this.getRankList();
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

  },

  goBack(){
    wx.navigateBack({

    })
  },

  //排行榜
  getRankList(){
    var that = this;
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    wx.request({
      url: 'https://www.skyseaee.cn/routine/auth_api/get_rank_eachday',
      success: function(res) {
        // console.log(res.data.data)
        res.data.data.total = that.addFakeData(res.data.data.total)
        for(let i=0; i<res.data.data.total.length; i++) {
          res.data.data.total[i]['correct_rate'] = that.formateRate(res.data.data.total[i]['correct_rate'])
        }

        res.data.data.week = that.addFakeData(res.data.data.week)
        for(let i=0; i<res.data.data.week.length; i++) {
          res.data.data.week[i]['correct_rate'] = that.formateRate(res.data.data.week[i]['correct_rate'])
          res.data.data.week[i]['total_answer'] = res.data.data.week[i]['answer_count']
        }
        console.log(res.data.data.total)
        res.data.data.total = res.data.data.total.filter(map => map['total_answer'] !== 0 && map['correct_rate'] != 0 && map['nickName'] != null && map['nickName'].length != 0)
        res.data.data.week = res.data.data.week.filter(map => map['total_answer'] !== 0 && map['correct_rate'] != 0 && map['nickName'] != null && map['nickName'].length != 0)
        let total_list = res.data.data.total.sort((a, b) => {
          if(a.total_answer != b.total_answer) return b.total_answer - a.total_answer
          else return b.correct_rate - a.correct_rate
        })

        that.setData({
          totalList: total_list,
          weekList: res.data.data.week.sort((a, b) => {
            if(a.total_answer != b.total_answer) return b.total_answer - a.total_answer
            else return b.correct_rate - a.correct_rate
          }),
          rankList: total_list,
        })
      }
    })
      
    setTimeout(function(){
      wx.hideLoading({
        success: (res) => {},
      })
    },1000);
  },

  onReachBottom: function () {

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

  switchTabMonth: function () {
    const selectedTab = this.data.selectedTab;

    if (selectedTab != '周排行') {
      this.setData({
        selectedTab: '周排行',
        rankList: this.data.weekList,
      });
    }
  },

  switchTabTotal: function () {
    const selectedTab = this.data.selectedTab;

    if (selectedTab != '总排行') {
      this.setData({
        selectedTab: '总排行',
        rankList: this.data.totalList,
      });
    }
  },

  formateRate: function(rate) {
    let r = rate.toFixed(3) * 100
    return r.toString().substring(0, 4)
  },

  addFakeData: function(datalist) {
    if(datalist.length <3) {
      datalist.push({
        avatarUrl: '/images/fake1.png',
        correct_rate: 0.5,
        nickName: '不上岸不改名',
        total_answer: 2,
        answer_count: 2,
      })

      datalist.push({
        avatarUrl: '/images/fake2.png',
        correct_rate: 0.75,
        nickName: '专业版机器',
        total_answer: 4,
        answer_count: 4,
      })

      datalist.push({
        avatarUrl: '/images/fake3.png',
        correct_rate: 0.5,
        nickName: 'viv',
        total_answer: 2,
        answer_count: 2,
      })
    }

    return datalist
  }
})