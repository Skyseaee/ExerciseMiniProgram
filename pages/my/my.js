// pages/my/my.js
import Toast from '../../dist/toast/toast';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isLogin: false,
        canIUseGetUserProfile: false,
        show: false,
        actions: [
            {
                name: '复制开发者微信号',
            },
            {
                name: '复制开发者QQ号',
            },
        ]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // if (wx.getUserProfile) {
        //     this.setData({
        //         canIUseGetUserProfile: true
        //     })
        // }
        var that = this;
        var openid = wx.getStorageSync('openid')
        if (openid == '' || openid == undefined) {
            wx.login({
                success(res) {
                    if (res.code) {
                        console.log(res.code)
                        wx.Apis.login.login(res.code, (code, data) => {
                            console.log(data);
                            wx.Apis.setUid(data.openid); //openid
                            wx.Apis.set('openid', data.openid);
                            wx.setStorageSync('userInfo', data);
                            that.setData({
                                userInfo: data
                            })
                        });
                    }
                }
            });
        }
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
        this.setData({
            userInfo: wx.getStorageSync('userInfo'),
        })
    },

    login() {
        this.setData({
            isLogin: !this.data.isLogin
        })
    },

    onMyEvent: function (t) {
        this.login();
    },

    goRecord() {
        if (this.data.userInfo.nickName == undefined || this.data.userInfo.nickName == '') {
            this.login()
            return false;
        }
        wx.navigateTo({
            url: '/pages/record/record',
        })
    },

    goPoint() {
        if (this.data.userInfo.nickName == undefined || this.data.userInfo.nickName == '') {
            this.login()
            return false;
        }
        wx.navigateTo({
            url: '/pages/point/point',
        })
    },

    goCode() {
        if (this.data.userInfo.nickName == undefined || this.data.userInfo.nickName == '') {
            this.login()
            return false;
        }
        wx.navigateTo({
            url: '/pages/code/code',
        })
    },

    goSetting() {
        if (this.data.userInfo.nickName == undefined || this.data.userInfo.nickName == '') {
            this.login()
            return false;
        }
        wx.navigateTo({
            url: '/pages/setting/setting',
        })
    },

    goSign() {
        if (this.data.userInfo.nickName == undefined || this.data.userInfo.nickName == '') {
            this.login()
            return false;
        }
        wx.navigateTo({
            url: '/pages/sign/sign',
        })
    },

    goFeedback() {
        if (this.data.userInfo.nickName == undefined || this.data.userInfo.nickName == '') {
            this.login()
            return false;
        }
        wx.navigateTo({
            url: '/pages/feedback/feedback',
        })
    },
    goAbout() {
        this.setData({
            show: true
        });
    },
    clearStorage() {
        wx.showModal({
            content: '清空缓存会清空答题记录缓存，确定要清空吗？',
            success: function (a) {
                if (a.confirm) {
                    wx.clearStorageSync();
                    //请求公告
                    wx.Apis.api.getConfigValue('notice', (code, data) => {
                        wx.setStorageSync('notice', data.value)
                    });

                    var that = this;

                    var openid = wx.getStorageSync('openid')
                    if (openid == '' || openid == undefined) {
                        wx.showLoading({
                            title: '',
                        })
                        wx.login({
                            success(res) {
                                if (res.code) {
                                    console.log(res.code)
                                    wx.Apis.login.login(res.code, (code, data) => {
                                        console.log(data);
                                        wx.Apis.setUid(data.openid); //openid
                                        wx.Apis.set('openid', data.openid);
                                        wx.setStorageSync('userInfo', data);
                                        wx.hideLoading({
                                            success: (res) => { },
                                        })
                                    });
                                }
                            }, fail() {
                                wx.hideLoading({
                                    success: (res) => { },
                                })
                            }
                        });
                    }
                }
            }
        })
    },
    onClose() {
        this.setData({ show: false });
    },
    onSelect(event) {
        console.log(event.detail)
        var that = this
        if (event.detail.name === "复制开发者QQ号") {
            wx.setClipboardData({
                data: '903363777',
                success: function (res) {

                }
            })
        } else {
            wx.setClipboardData({
                data: 'kossfirst',
                success: function (res) {

                }
            })
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
    },
})