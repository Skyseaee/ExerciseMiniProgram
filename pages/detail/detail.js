// pages/detail/detail.js
import Toast from '../../dist/toast/toast';
var question_js = require('../../utils/question.js');
var Apis = require('../../utils/apis.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isLogin: false,
        canIUseGetUserProfile: false,
        show: false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        var that = this;
        var index = wx.getStorageSync('orderind'+options.id)
        this.setData({
            id: options.id,
            name: options.name,
            count: options.count,
            q_update_time: options.time,
            index: index ? index : 0
        })

        console.log(options)

        // if (wx.getUserProfile) {
        //     this.setData({
        //         canIUseGetUserProfile: true
        //     })
        // }
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

        this.checkQuestion();
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
        this.setData({
            userInfo: wx.getStorageSync('userInfo'),
        })
    },


    checkQuestion() {
        wx.showLoading({
          title: '加载中',
        })
        var that = this;
        var question = wx.getStorageSync('question_'+ that.data.id);
        if(!question){
            that.uploadQuestion();
        }else{
            var question_update_time = wx.getStorageSync('question_update_time_' + that.data.id)
            console.log(question_update_time)
            console.log(that.data.q_update_time)
            if(question_update_time < parseInt(that.data.q_update_time)){
                console.log(11)
                that.uploadQuestion();
            }else{
                question_js.initAllQuestionFromStorage(that.data.id);
                setTimeout(function() {
                    wx.hideLoading({})
                },1000);
            }
        }
    },

    uploadQuestion() {
        var that = this;
        wx.Apis.api.getQuestionList(that.data.id,(code, data) => {
            wx.setStorageSync('question_id_'+that.data.id, data.question_id)
            wx.setStorageSync('question_'+that.data.id, data.question_list)
            wx.setStorageSync('question_update_time_'+that.data.id, data.q_update_time)
            question_js.initAllQuestionFromStorage(that.data.id);
            setTimeout(function () {
                wx.hideLoading({})
            },1000);
        })
    },

    goAction(t) {
        var that = this;
        console.log(t.currentTarget.dataset.action)
        if(this.data.userInfo.nickName == undefined || this.data.userInfo.nickName == ''){
            this.login()
            return false;
        }
        var checkUser = wx.getStorageSync('checkUser');
        if(checkUser == 'true' && this.data.userInfo.status == 1) {
            wx.showToast({
              icon: 'none',
              title: '您的信息正在审核中',
            });
            return false;
        }
        if(checkUser == 'true' && this.data.userInfo.status == 0){
            wx.navigateTo({
              url: '/pages/userInfo/userInfo',
            })
            return false;
        }
        if(this.data.userInfo.is_del) {
            wx.showToast({
                icon: 'none',
                title: '账号已被禁用',
            });
            return false;
        }
        var userInfo = wx.getStorageSync('userInfo');
        wx.Apis.api.isUseCode(this.data.id, userInfo.uid,(code, data) => {
            if(data.is_use_code){
                if(data.have_code){
                    that.goDetail(t.currentTarget.dataset.action)
                }else{
                    wx.showModal({
                        title: '提示',
                        editable:true,
                        placeholderText:'请输入激活码',
                        success: res => {
                          if (res.confirm) { 
                            var code = res.content;
                            wx.Apis.api.activate(that.data.id, userInfo.uid, code,(code, data) => {
                                console.log(code)
                                if(code == 200) {
                                    wx.showToast({
                                      title: '激活成功',
                                    })
                                }else{
                                    wx.showToast({
                                      icon: 'error',
                                      title: '激活失败',
                                    })
                                }
                            })
                          } else {
                            console.log('用户点击了取消')
                          }
                        }
                      })
                }
            }else{
                that.goDetail(t.currentTarget.dataset.action)
            }
        });
        
    },
    goDetail(action){
        var url = '';
        switch(action){
            //练习模式
            case 'learn':
                url = '/pages/learn/learn?id=' + this.data.id + '&mode=2&type=1&name=' + this.data.name + '&q_update_time=' + this.data.q_update_time;
                break;
            //考试模式
            case 'exam':
                url = '/pages/examhome/examhome?id=' + this.data.id + '&action=exam' + '&q_update_time=' + this.data.q_update_time;
                break;
            //高频错题
            case 'high':
                url = '/pages/learn/learn?id=' + this.data.id + '&mode=2&type=5&name=' + this.data.name + '&q_update_time=' + this.data.q_update_time;
                break;
            //随机模式
            case 'random':
                url = '/pages/learn/learn?id=' + this.data.id + '&mode=2&type=2&name=' + this.data.name + '&q_update_time=' + this.data.q_update_time;
                break;
            //题型练习
            case 'type':
                url = '/pages/list/list?id='+ this.data.id +'&type=4&name=' + this.data.name + '&q_update_time=' + this.data.q_update_time;
                break;
            //专项练习
            case 'earmark':
                url = '/pages/list/list?id='+ this.data.id +'&type=3&name=' + this.data.name + '&q_update_time=' + this.data.q_update_time;
                break;
            //错题
            case 'error':
                var error = wx.getStorageSync('errorids' + this.data.id);
                if(error && error.length > 0){
                    url = '/pages/errorstar/errorstar?id='+ this.data.id +'&mode=5';
                }else{
                    Toast.fail('暂无错题记录');
                    return false;
                }
                break;
            //收藏
            case 'star':
                var star = wx.getStorageSync('starids'+ this.data.id);
                if(star && star.length > 0){
                    url = '/pages/errorstar/errorstar?id='+ this.data.id +'&mode=4';
                }else{
                    Toast.fail('暂无收藏记录');
                    return false;
                }
                break;
            //背题模式
            case 'show':
                url = '/pages/learn/learn?id=' + this.data.id + '&mode=3&type=1&name=' + this.data.name + '&q_update_time=' + this.data.q_update_time;
                break;
            case 'rank':
                url = '/pages/rank/rank?id=' + this.data.id;
                break;   
            //搜索
            default:
                url = '/pages/search/search?id=' + this.data.id+'&name=' + this.data.name + '&q_update_time=' + this.data.q_update_time;
                break;
        }
        wx.navigateTo({
          url: url,
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

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})