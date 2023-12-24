import Toast from '../../../dist/toast/toast';
Component({
    properties: {
        isLogin: {
            type: Boolean,
            value: false
        },
        canIUseGetUserProfile: {
            type: Boolean,
            value: false
        }
    },
    data: {},
    methods: {
        noLogin: function () {
            this.setData({
                isLogin: !this.data.isLogin
            })
            var e = {
                    code: 2
                },
                t = {};
            this.triggerEvent("myevent", e, t);
        },
        goLogin: function() {
            var e = {
                code: 1,
                result: true,
            },
            t = {};
            this.triggerEvent("myevent", e, t);
            wx.navigateTo({
              url: '/pages/login/login',
            })
        },
        getUserProfile(e) {
            this.noLogin()
            var openid = wx.getStorageSync('openid')
            if (openid == '' || openid == undefined) {
                wx.showToast({
                    title: '授权失败',
                    icon: 'none',
                    duration: 1500
                })
                return false;
            }
            var that = this;
            wx.getUserProfile({
                desc: '完善用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
                success: (res) => {
                    wx.showLoading({
                        title: '授权中',
                    })
                    var userInfo = res.userInfo;
                    userInfo.openid = openid;
                    wx.Apis.login.save(userInfo, (code, data) => {
                        if (code == 200) {
                            wx.setStorageSync('userInfo', data);
                            var e = {
                                    code: 1,
                                    result: true,
                                    userInfo: data
                                },
                                t = {};
                            that.triggerEvent("myevent", e, t);
                            setTimeout(function () {
                                wx.hideLoading({});
                                wx.showToast({
                                    title: '授权成功',
                                    icon: 'none',
                                    duration: 1500
                                })
                            }, 1500);
                        } else {
                            setTimeout(function () {
                                wx.hideLoading({});
                                wx.showToast({
                                    title: '授权失败',
                                    icon: 'none',
                                    duration: 1500
                                })
                            }, 1500);
                        }
                    })
                }
            })
        }
    }
});