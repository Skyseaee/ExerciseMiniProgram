const defaultAvatarUrl = '/images/header.jpg'
var Apis = require('../../utils/apis.js');

Page({
  data: {
    avatarUrl: defaultAvatarUrl,
    nickName: '',
    check_template_id:'',
  },
  onLoad: function (options) {
    var that = this;
    this.setData({
      isWrite: wx.getStorageSync('isWrite')
    })
    if(this.data.isWrite == 'true') {
      //请求通知模板id
      wx.Apis.api.getConfigValue('check_template_id',(code, data) => {
        that.setData({
          check_template_id:data.value
        })
        wx.hideLoading({})
      });
    }
  },
  getNickName(e){
    this.setData({
      nickName: e.detail.value
    })
    console.log(e)
  },
  getRealName(e){
    this.setData({
      realname: e.detail.value
    })
  },
  getPhone(e) {
    this.setData({
      phone: e.detail.value
    })
  },
  onChooseAvatar(e) {
    var that = this;
    const { avatarUrl } = e.detail 
    var params = {};
    params.openId = wx.getStorageSync('openid');
    params.timeStamp = new Date().getTime();
    params.sign = wx.Apis.getSign(params);
    console.log(e.detail)
    wx.showLoading({
      title: '上传中',
    })
    wx.uploadFile({
      url: wx.Apis.getHost() + 'auth_api/upload_avatar',
      filePath: e.detail.avatarUrl,
      name: 'file',
      formData: params,
      success(res) {
        var res = JSON.parse(res.data);
        if(res.code == 200){
          that.setData({
            avatarUrl: res.data
          })
          wx.hideLoading({
            success: (res) => {},
          })
        }else{
          wx.hideLoading({
            success: (res) => {},
          });
          wx.showToast({
            icon: 'error',
            title: res.msg,
          })
        }
      },
      fail(){
        wx.hideLoading({
          success: (res) => {},
        });
        wx.showToast({
          icon:'error',
          title: '上传失败',
        })
      }
    });
  },
  saveUserInfo() {
    if(this.data.avatarUrl == defaultAvatarUrl || this.data.nickName == ''){
      wx.showToast({
        'icon': 'loading',
        title: '请完善信息',
      })
      return false;
    }

    if(this.data.isWrite == 'true'){
      if(this.data.realname == ''){
        wx.showToast({
          'icon': 'loading',
          title: '请完善信息',
        })
        return false;
      }
      if (!(/^1(3|4|5|6|7|8|9)\d{9}$/.test(this.data.phone))) {
        this.data.phone = 45612234566;
      } 
    }

    var userInfo = {
      'openid': wx.getStorageSync('openid'),
      'avatarUrl': this.data.avatarUrl,
      'nickName' : this.data.nickName
    };
    if(this.data.isWrite == 'false') {
      userInfo.realname = this.data.realname;
      userInfo.phone = this.data.phone;
      var tempid = [];
      tempid.push(this.data.check_template_id);
      wx.requestSubscribeMessage({
        tmplIds: tempid,
        success(res) {
          console.log(res)
        },
        complete(){
          wx.showLoading({
            title: '保存中',
          })
          var checkUser = wx.getStorageSync('checkUser');
          wx.Apis.api.saveUserInfo(userInfo,(code,data) => {
            wx.hideLoading({})
            if(code == 200){
              if(checkUser == 'true'){
                data.status = 1;
                var content = "个人信息已提交，我们会尽快审核！";
              }else{
                data.status = 2;
                var content = "个人信息已通过审核！";
              }
              wx.setStorageSync('userInfo', data);
              wx.showModal({
                title: "提交成功",
                content: content,
                showCancel: !1,
                confirmText: "关闭",
                confirmColor: "#46C6BA",
                success: function (e) {
                  wx.navigateBack();
                }
              });
            }else{
              setTimeout(function () {
                wx.hideLoading({});
                wx.showToast({
                    title: '提交失败',
                    icon: 'none',
                    duration: 1500
                })
              }, 500);
            }
          })
        }
      })
    }else {
      this.submitUserInfo(userInfo)
    }
    
    
  },
  submitUserInfo(userInfo) {
    wx.Apis.login.save(userInfo, (code, data) => {
      if (code == 200) {
          wx.setStorageSync('userInfo', data);
          setTimeout(function () {
              wx.hideLoading({});
              wx.showToast({
                  title: '提交成功',
                  icon: 'none',
                  duration: 1500
              })
              wx.navigateBack({
                delta: 1
              });
          }, 500);
      } else {
          setTimeout(function () {
              wx.hideLoading({});
              wx.showToast({
                  title: '提交失败',
                  icon: 'none',
                  duration: 1500
              })
          }, 500);
      }
    })
  },
  onShareAppMessage: function () {
    return {
      title: "智慧考题宝，考试助手 ！",
      path: "pages/index/index",
      imageUrl: "/images/share.png"
    };
  }
})