// exer_pages/record/record.js
var question_js = require('../../utils/question.js');
const util = require('../../utils/util');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    exer_page:0,
    exam_page: 0,
    nodata:true,
    exerList:[],
    examList: [],
    indexList: null,
    dataList: {},
    exer_moreData: true,//更多数据
    exam_moreData: true,
    selectedTab: '答题记录',
    isExam: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var userInfo = wx.getStorageSync('userInfo')
    let indexList = new Set() 
    this.setData({
      userInfo: userInfo,
      indexList: indexList,
    })
    this.getRecords(false, true)
    this.getRecords(true, true)
  },

  getRecords: function(isExam, is_first) {
    var that = this
    if(!isExam) {
      wx.request({
        url: 'https://www.skyseaee.cn/routine/auth_api/get_records_by_userID',
        header: {
          "content-type": "application/x-www-form-urlencoded"
        },
        data: {
          userid: app.globalData.uid,
          index: that.data.exer_page,
        },
        success: function(res) {
          let records = that.data.exerList
          
          if(res.data.count < 20) {
            that.setData({
              exer_moreData: false,
            })
          }
          
          

          if(Object.keys(res.data.data).length != 0 || that.data.exer_page != 0) {
            for(let key in res.data.data) {
              if(that.data.indexList.has(res.data.data[key].exercise_id)) {
                continue
              }
              that.data.indexList.add(res.data.data[key].exercise_id)
              
              res.data.data[key]['brief'] = res.data.data[key].question.substring(0, 16)
              if(res.data.data[key].question.length > 16) {
                res.data.data[key]['brief'] += "..."
              } else if(res.data.data[key].question.length == 0) {
                res.data.data[key]['brief'] = res.data.data[key]['first_name'] + '-' + res.data.data[key]['second_name'] + '题'
              }
              res.data.data[key]['correct_rate'] = that.formateRate(res.data.data[key]['correct_rate'])
              // console.log(res.data.data[key]['answer'])
              res.data.data[key]['answers'] = util.convertToLetters(res.data.data[key]['answer'].toString())
              res.data.data[key]['correct_answer'] = util.convertToLetters(res.data.data[key]['correct_answer'].toString())
              records.push(res.data.data[key])
            }
            console.log(records)
            that.setData({
              nodata: false,
              exerList: records,
              dataList: that.gengerateMap(records, that.data.exer_page, that.data.exer_moreData)
            })
            if(Object.keys(res.data.data).length === 0) {
              wx.showToast({
                title: '暂无更多记录',
                icon: 'success',
                duration: 2000
              })
              that.setData({
                exer_moreData: false,
              })
              return
            }
          }
        }
      })
    } else {
      wx.request({
        url: 'https://www.skyseaee.cn/routine/auth_api/get_exam_records',
        header: {
          "content-type": "application/x-www-form-urlencoded"
        },
        data: {
          userid: app.globalData.uid,
          index: that.data.exam_page,
        },
        success: function(res) {
          let list = res.data.data
          let count = res.data.count
          if(count < 20) {
            if(that.data.examList.length != 0) {
              wx.showToast({
                title: '暂无更多记录',
                icon: 'success',
                duration: 2000
              })
            }
            that.setData({
              exam_moreData: false,
            })
          }
          let records = that.data.examList
          for(let i=0; i<count; i++) {
            list[i]['brief'] = list[i].first_name + '模拟测试' + i
            list[i]['answer_time'] = list[i].add_time
            list[i]['spend'] = that.secondsToHMS(list[i].use_time)
            list[i]['num'] = list[i].question_id.split(',').length
            records.push(list[i])
          }
          that.setData({
            examList: records,
          })
          if(!is_first) {
            that.setData({
              dataList: that.gengerateMap(records, that.data.exam_page, that.data.exam_moreData)
            })
          }
        }
      })
    }
  },

  getRecordDetail: function(t) {
    let index = t.currentTarget.dataset.index;
    let recordInfo = this.data.dataList.data[index]
    if(!this.data.isExam) {
      wx.navigateTo({
        url: '/pages/recordInfo/recordInfo?info=' + encodeURIComponent(JSON.stringify(recordInfo)),
      })
    } else {
      wx.navigateTo({
        url: '/pages/exammode/exammode?class=record&question=' + recordInfo.question_id + "&category=" + recordInfo.first_id + "&records=" + encodeURIComponent(JSON.stringify(recordInfo)),
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  onReachBottom: function () {

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

  formateRate: function(rate) {
    let r = rate.toFixed(3) * 100
    return r.toString().substring(0, 4)
  },

  findMoreRecord: function() {
    if(this.data.isExam) {
      let exam_page = this.data.exam_page
      if(this.data.exam_moreData) {
        this.setData({
          exam_page: exam_page + 1,
        })
      }
      this.getRecords(true, false)
    } else {
      let exer_page = this.data.exer_page
      if(this.data.exer_moreData) {
        this.setData({
          exer_page: exer_page + 1,
        })
      }
      this.getRecords(false, false)
    }
  },

  switchTabLeft: function () {
    let switchs = this.data.selectedTab
    if(switchs !== "答题记录") {
      let dataList = this.gengerateMap(this.data.exerList, this.data.exer_page, this.data.exer_moreData)
      this.setData({
        selectedTab: "答题记录",
        isExam: false,
        dataList: dataList,
      })
    }
  },

  switchTabRight: function() {
    let switchs = this.data.selectedTab
    if(switchs !== "测试记录") {
      let dataList = this.gengerateMap(this.data.examList, this.data.exam_page, this.data.exam_moreData)
      this.setData({
        selectedTab: "测试记录",
        isExam: true,
        dataList: dataList,
      })
    }
  },

  gengerateMap: function(data, page, moreData) {
    return {'data': data, 'page': page, 'moreData': moreData, 'hasData': data.length !== 0}
  },

  secondsToHMS: function(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.ceil(seconds % 60);
    
    if(minutes == 0 && hours == 0) return `${remainingSeconds}s`;
    else if(hours == 0) return `${minutes}min ${remainingSeconds}s`;
    else return `${hours}h ${minutes}min ${remainingSeconds}s`;
  },
})