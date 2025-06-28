// pages/examhome/examhome.js
var question_js = require('../../utils/question.js');
var rParam = "exam";
Page({

    /**
     * 页面的初始数据
     */
    data: {
        detail: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(e) {
        var that = this;
        that.setData({
            id: e.id,
            action: e.action,
            q_update_time: e.q_update_time
        })
        rParam = e.action == 'activity' ? "activity" : "exam";
        wx.showLoading({
            title: '加载中',
            mask: true,
        })
        wx.Apis.api.getCategoryDetail(e.id, (code, data) => {
            that.setData({
                detail: data
            })
            setTimeout(function () {
                wx.hideLoading({
                    success: (res) => {},
                })
            }, 1000);
        });
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

    examGo(params) {
        var that = this;
        var url = '/pages/exam/exam?id=' + that.data.id + '&q_update_time=' + that.data.q_update_time;
        var n = rParam + "ind" + (that.data.action == 'activity' ? that.data.activity : that.data.id),
            i = wx.getStorageSync(n) ? wx.getStorageSync(n) + 1 : "",
            a = "exam_up" + that.data.id,
            o = wx.getStorageSync(a) || "";
        !o && i ? (wx.hideLoading({}), wx.showModal({
            title: "",
            cancelText: "重新考试",
            confirmText: "继续答题",
            content: "上次考试您已经做到第" + i + "题,重新考试答题记录会丢失~",
            success: function (n) {
                if (n.confirm) {
                    url += '&continued=1';
                    setTimeout(function () {
                        wx.redirectTo({
                            url: url
                        })
                    }, 1000)
                } else {
                    that.clear_storage(url)
                }
            }
        })) : that.clear_storage(url)
    },

    clear_storage(url) {
        var that = this;
        console.log(rParam + 'list' + (that.data.action == 'activity' ? that.data.activity : that.data.id))
        wx.removeStorage({
            key: rParam + (that.data.action == 'activity' ? that.data.activity : that.data.id)
        })
        wx.removeStorage({
            key: rParam + 'list' + (that.data.action == 'activity' ? that.data.activity : that.data.id)
        })
        wx.removeStorage({
            key: rParam + 'ind' + (that.data.action == 'activity' ? that.data.activity : that.data.id)
        })
        wx.removeStorage({
            key: rParam + 'ids' + (that.data.action == 'activity' ? that.data.activity : that.data.id)
        })
        wx.removeStorage({
            key: rParam + 'all' + (that.data.action == 'activity' ? that.data.activity : that.data.id)
        })
        wx.removeStorage({
            key: rParam + 'times' + (that.data.action == 'activity' ? that.data.activity : that.data.id)
        })
        setTimeout(function () {
            wx.hideLoading({
                success: (res) => {},
            })
            wx.redirectTo({
                url: url
            })
        }, 1000)
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
    onShareAppMessage: function () {
        return {
          title: "研题帮，考试助手 ！",
          path: "pages/index/index",
          imageUrl: "/images/share.png"
        };
    }
})