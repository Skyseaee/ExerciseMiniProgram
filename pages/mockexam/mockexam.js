// pages/mockexam/mockexam.js
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
      category_info: null,
      mock_exam: [],
      nodata: true,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      let info = JSON.parse(decodeURIComponent(options.firstCategory))
      this.setData({
        category_info: info
      })
      let that = this
      wx.request({
        url: 'https://www.skyseaee.cn/routine/auth_api/get_mock_exam',
        method: 'POST',
        header:{
          "content-type": "application/x-www-form-urlencoded",
          'personal': 'skyseaee',
        },
        data: {
          first_id: info.id,
        },
        success: function(res) {
          let data = res.data.data
          let count = res.data.count
          if(count == 0) {
            return
          }

          that.setData({
            mock_exam: data,
            nodata: false,
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

    gotoExam: function(e) {
      const index = e.currentTarget.dataset.index;
      let exam = this.data.mock_exam[index]
      wx.navigateTo({
        url: '/pages/exammode/exammode?class=mock&question=' + exam.exercise_list + "&category=" + exam.category_id + "&id=" + exam.id,
      })
    },

    clearRecord: function(e) {
      const index = e.currentTarget.dataset.index;
      let exam = this.data.mock_exam[index]
      
      wx.showModal({
        title: '是否重置',
        content: '重置后新的答题成绩不会记录在排行榜单，请确认是否重置记录',
        complete: (res) => {
          if (res.cancel) {
            return
          }
      
          if (res.confirm) {
            wx.request({
              url: 'https://www.skyseaee.cn/routine/auth_api/clear_exam_record',
              header: {
                "content-type": "application/x-www-form-urlencoded",
              },
              data: {
                "uid": app.globalData.uid,
                'exam_id': exam.id,
              },
              success: function(res) {
                wx.showToast({
                  title: '已重置记录',
                })
              },
              fail: function(res) {
                wx.showToast({
                  title: '暂无记录',
                })
              }
            })
          }
        }
      })
    },

    showRank: function(e) {
      const index = e.currentTarget.dataset.index;
      let exam = this.data.mock_exam[index]

      wx.navigateTo({
        url: '/pages/mockRank/mockRank?exam_id=' + exam.id,
      })
    }
})