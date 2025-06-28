var Apis = require('../../utils/apis.js');

Page({
  data: {
    check_template_id:'',
  },
  onLoad: function (options) {
    var that = this;
    //请求通知模板id
    wx.Apis.api.getConfigValue('check_template_id',(code, data) => {
      that.setData({
        check_template_id:data.value
      })
      wx.hideLoading({})
    });
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
  saveUserInfo() {
      if(this.data.realname == '' || this.data.phone == ''){
        wx.showToast({
          'icon': 'loading',
          title: '请完善信息',
        })
        return false;
      }
      if (!(/^1(3|4|5|6|7|8|9)\d{9}$/.test(this.data.phone))) {
        wx.showToast({
          'icon': 'loading',
          title: '手机号码有误',
        })
        return false;
      } 

    var userInfo = {
      'openid': wx.getStorageSync('openid'),
    };
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
          wx.Apis.api.saveAgainUserInfo(userInfo,(code,data) => {
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
  },
  onShareAppMessage: function () {
    return {
      title: "研题帮，考试助手 ！",
      path: "pages/index/index",
      imageUrl: "/images/share.png"
    };
}
})