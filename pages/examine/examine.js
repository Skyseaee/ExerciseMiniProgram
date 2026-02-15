// pages/examine/examine.js
const app = getApp()


Page({

    /**
     * 页面的初始数据
     */
    data: {
      first_cate: [],
      options: ['基础难度', '中等难度', '混合难度'],
      selectedOption: '请选择',
      target: '',
      show: false,
      currentId: -1,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      let that = this
      wx.request({
        url: 'https://www.skyseaee.cn/routine/auth_api/first_show_category',
        header: {
          "content-type": "application/x-www-form-urlencoded",
        },
        data: {
          'uid': app.globalData.uid,
        },
        success: function(res) {
          let data = res.data.data
          console.log(data)
          that.setData({
            first_cate: data
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

    bindPickerChange() {

    },

    goExamInfoBasic: function(e) {
      const index = e.currentTarget.dataset.index;
      let id = this.data.first_cate[index].id

      app.globalData.mainActiveIndex = id;
      wx.setStorageSync('mainActiveIndex', id)
      let stage = ''
      wx.navigateTo({
        url: '/pages/examclass/examclass?stage=' + stage + '&examinetype=0',
      })
    },

    goExamInfoImprove: function(e) {
      const index = e.currentTarget.dataset.index;
      let id = this.data.first_cate[index].id

      app.globalData.mainActiveIndex = id;
      wx.setStorageSync('mainActiveIndex', id)
      let stage = ''
      wx.navigateTo({
        url: '/pages/examclass/examclass?stage=' + stage + '&examinetype=1',
      })
    },

    goExamInfoFinal: function(e) {
      const index = e.currentTarget.dataset.index;
      let id = this.data.first_cate[index].id

      app.globalData.mainActiveIndex = id;
      wx.setStorageSync('mainActiveIndex', id)
      let stage = ''
      wx.navigateTo({
        url: '/pages/examclass/examclass?stage=' + stage + '&examinetype=2',
      })
    },

    goExamInfoStimuate: function(e) {
      const index = e.currentTarget.dataset.index;
      let id = this.data.first_cate[index].id

      app.globalData.mainActiveIndex = id;
      wx.setStorageSync('mainActiveIndex', id)
      let stage = ''
      wx.navigateTo({
        url: '/pages/examclass/examclass?stage=' + stage + '&examinetype=3',
      })
    }
})