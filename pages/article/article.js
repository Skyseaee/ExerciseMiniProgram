// pages/article/article.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        arrCategory: [],
        arrSort: [{
                text: '默认排序',
                value: 'default'
            },
            {
                text: '时间排序',
                value: 'add_time'
            },
            {
                text: '阅读排序',
                value: 'read'
            },
        ],
        category: 0,
        sort: 'default',
        page: 1,
        limit: 10,
        nodata: true,
        articleList: [],
        moreData: true, //更多数据
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.Apis.api.getArticleCategory((code, data) => {
            data.unshift({
                text: '全部分类',
                value: 0
            });
            this.setData({
                arrCategory: data
            })
        });
        this.getArticle(this.data.category, this.data.sort, this.data.page, this.data.limit)
    },

    getArticle: function (category, sort, page, limit) {
        var that = this;
        wx.showLoading({
            title: '加载中',
            mask: true,
            icon: 'loading'
        })
        wx.Apis.api.getArticleList(category, sort, page, limit, (code, data) => {
            var articleList = that.data.articleList;
            var page = that.data.page;
            console.log(data)
            if (data.length) {
                data.forEach(v => {
                    articleList.push(v)
                });
                that.setData({
                    articleList: articleList,
                    page: page + 1,
                    nodata: false
                })
            } else {
                that.setData({
                    articleList: articleList,
                    moreData: false
                })
            }

            setTimeout(function () {
                wx.hideLoading({
                    success: (res) => {},
                })
            }, 1000);
        });
    },

    changeCategory: function (value){
        this.setData({
            category: value.detail,
            articleList: [],
            moreData:true,
            nodata: true,
            page: 1
        })
        this.getArticle(this.data.category, this.data.sort, this.data.page, this.data.limit)
    },

    changeSort: function (value) {
        this.setData({
            sort: value.detail,
            articleList: [],
            moreData: true,
            nodata: true,
            page: 1
        })
        this.getArticle(this.data.category, this.data.sort, this.data.page, this.data.limit)
    },

    detail: function(e) {
        var id = e.currentTarget.dataset.id
        wx.navigateTo({
          url: '/pages/articleDetail/articleDetail?id='+id,
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
        if(this.data.moreData){
            this.getArticle(this.data.category, this.data.sort, this.data.page, this.data.limit);
        }
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
    },
})