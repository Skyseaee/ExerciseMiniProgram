// pages/setting/setting.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        rightAutoNext: true,
        finishAutoNext: true,
        rightRemove: false,
        music:false,
        fontSize: '32rpx'
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        var rightAutoNext = wx.getStorageSync('rightAutoNext')
        if(rightAutoNext !==''){
            this.setData({
                rightAutoNext: rightAutoNext
            })
        }
        var finishAutoNext = wx.getStorageSync('finishAutoNext')
        if(finishAutoNext !== ''){
            this.setData({
                finishAutoNext: finishAutoNext
            })
        }
        var rightRemove = wx.getStorageSync('rightRemove')
        if(rightRemove !== ''){
            this.setData({
                rightRemove: rightRemove
            })
        }
        var music = wx.getStorageSync('music')
        if(music !== ''){
            this.setData({
                music: music
            })
        }
        var fontSize = wx.getStorageSync('fontSize')
        if(fontSize){
            this.setData({
                fontSize: fontSize
            })
        }
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
    rightAutoNextChange() {
        var rightAutoNext = wx.getStorageSync('rightAutoNext');
        if(rightAutoNext || rightAutoNext === ''){
            wx.setStorageSync('rightAutoNext', false)
            this.setData({
                rightAutoNext: false
            })
        }else{
            wx.setStorageSync('rightAutoNext', true)
            this.setData({
                rightAutoNext: true
            })
        }
    },
    finishAutoNextChange() {
        var finishAutoNext = wx.getStorageSync('finishAutoNext');
        if(finishAutoNext || finishAutoNext === ''){
            wx.setStorageSync('finishAutoNext', false)
            this.setData({
                finishAutoNext: false
            })
        }else{
            wx.setStorageSync('finishAutoNext', true)
            this.setData({
                finishAutoNext: true
            })
        }
    },
    rightRemoveChange() {
        var rightRemove = wx.getStorageSync('rightRemove');
        if(rightRemove){
            wx.setStorageSync('rightRemove', false)
            this.setData({
                rightRemove: false
            })
        }else{
            wx.setStorageSync('rightRemove', true)
            this.setData({
                rightRemove: true
            })
        }
    },
    musicChange() {
        var music = wx.getStorageSync('music');
        if(music){
            wx.setStorageSync('music', false)
            this.setData({
                music: false
            })
        }else{
            wx.setStorageSync('music', true)
            this.setData({
                music: true
            })
        }
    },

    fontSizeChange(t){
        var size = t.currentTarget.dataset.size;
        wx.setStorageSync('fontSize', size)
        this.setData({
            fontSize: size
        })
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