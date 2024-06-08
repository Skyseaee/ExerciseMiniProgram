// pages/mockRank/mockRank.js
const utils = require('../../utils/util')
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
      rankList: [],
      myscore: 0,
      myRank: '暂无',
      useTime: '暂无记录',
      exam_id: 0,
      avatar: '',
      nickName: '',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      let exam_id = options.exam_id
      let that = this
      this.setData({
        exam_id
      })

      wx.request({
        url: 'https://www.skyseaee.cn/routine/auth_api/get_rank_list_by_examID',
        header: {
          "content-type": "application/x-www-form-urlencoded"
        },
        data: {
          uid: app.globalData.uid,
          exam_id: exam_id,
        },
        success: function(res) {
          let data = res.data.data
          if(data == 0) {
            return
          } else {
            let rankList = data.rankList
            while(rankList.length < 3) {
              rankList.push({'score': 0, 'use_time': 0, 'avatarUrl': 'http://www.skyseaee.cn/uploads/exercise_img/20240609/6664b5ea2e245.png', 'nickName': '暂无'})
            }
            for(let i=0; i<rankList.length; i++) {
              rankList[i]['real_time'] = that.secondsToHMS(rankList[i].use_time)
            }
            that.setData({
              rankList,
              avatar: data.avatar,
              nickName: data.nickName,
            })
            if(data.score != -1) {
              that.setData({
                myscore: data.score,
                useTime: that.secondsToHMS(data.updateTime),
                myRank: data.rank,
              })
            }
          }
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

    secondsToHMS: function(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = Math.ceil(seconds % 60);
      
      if(minutes == 0 && hours == 0) return `${remainingSeconds}s`;
      else if(hours == 0) return `${minutes}min${remainingSeconds}s`;
      else return `${hours}h${minutes}min${remainingSeconds}s`;
    },

    goBack(){
      wx.navigateBack({
  
      })
    },
})