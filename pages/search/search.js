// pages/search/search.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        page: 1,
        limit: 15,
        nodata: false,
        moreData: true,
        keyword: '',
        questionList: [],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (t) {
        this.setData({
            id: t.id
        })
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

    onChange(e) {
        this.setData({
            keyword: e.detail,
        });
    },

    onSearch() {
        if (this.data.keyword != '') {
            this.setData({
                questionList:[]
            })
            this.getQuestion(1, this.data.limit);
        }
    },

    question(t) {
        wx.navigateTo({
          url: '/pages/question/question?id='+t.currentTarget.dataset.id+'&category='+this.data.id,
        })
    },

    getQuestion(page, limit) {
        var that = this;
        wx.showLoading({
            title: '加载中',
            mask: true,
            icon: 'loading'
        })
        wx.Apis.api.getSearchQuestion(that.data.id, that.data.keyword, page, limit, (code, data) => {
            var questionList = that.data.questionList;
            var page = that.data.page;
            if (data.length) {
                data.forEach(v => {
                    switch (v.type) {
                        case 1:
                            v.typeName = '单选题';
                            break;
                        case 2:
                            v.typeName = '多选题';
                            break;
                        case 3:
                            v.typeName = '判断题';
                            break;
                        case 4:
                            v.typeName = '单项填空题';
                            break;
                        case 5:
                            v.typeName = '多项填空题';
                            break;
                        default:
                            v.typeName = '简答题';
                            break;
                    }
                    questionList.push(v);
                    that.setData({
                        questionList: questionList,
                        page: page + 1,
                        nodata: false
                    })
                })
            } else {
                that.setData({
                    questionList: questionList,
                    moreData: false,
                    nodata: this.data.page == 1 ? true : false
                })
            }
            setTimeout(function () {
                wx.hideLoading({
                    success: (res) => {},
                })
            }, 1500);
        });
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.moreData) {
            this.getQuestion(this.data.page, this.data.limit);
        }
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