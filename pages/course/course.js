// pages/course/course.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        thirdCategoryList: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        var that = this
        wx.showLoading({})
        this.setData({
            id: options.id,
            firstCategoryName: options.firstCategoryName,
            secondCategoryName: options.secondCategoryName
        })
        wx.Apis.api.thirdCategoryList(options.id, '', (code, data) => {
            console.log(data)
            that.setData({
                thirdCategoryList: data
            })
            wx.hideLoading({})
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

    onChange(e) {
        this.setData({
            value: e.detail,
        });
    },
    onSearch() {
        var that = this
        wx.showLoading({})
        wx.Apis.api.thirdCategoryList(that.data.id, that.data.value, (code, data) => {
            console.log(data)
            that.setData({
                thirdCategoryList: data
            })
            wx.hideLoading({})
        });
    },
    goBank(t) {
        wx.navigateTo({
          url: '/pages/bank/bank?id=' + t.currentTarget.dataset.id + '&name=' + t.currentTarget.dataset.name
        })
        // wx.navigateTo({
        //     url: '/pages/detail/detail?id=' + t.currentTarget.dataset.id + '&name=' + t.currentTarget.dataset.name
        // })
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