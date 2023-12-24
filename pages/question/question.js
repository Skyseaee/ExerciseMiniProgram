// pages/question/question.js
var question_js = require('../../utils/question.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(t) {
        console.log(t)
        question_js.initAllQuestionFromStorage(t.category);
        var questionArr = question_js.getQuestionsByIds(t.id)
        questionArr[0].answerArr = questionArr[0].answer.split("")
        this.setData({
            questions: questionArr,
            model:3,
            indexInd:0,
            length:1,
            current: 0,
            autoplay: !1,
            xiejie: !0,
            interval: 300,
            videoctrl: !0,
            iconIndtwo: !1,
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
    onShareAppMessage: function () {
        return {
          title: "智慧考题宝，考试助手 ！",
          path: "pages/index/index",
          imageUrl: "/images/share.png"
        };
    }
})