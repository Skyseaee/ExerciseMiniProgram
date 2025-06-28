// app.js
var Apis = require('utils/apis.js');
App({
  onLaunch() {
    this.initAPI();
    wx.Apis = Apis;
    try{
        let main_active_index = wx.getStorageSync('mainActiveIndex');
        if(main_active_index) this.globalData.mainActiveIndex = main_active_index;
    } catch(e) {
        this.globalData.mainActiveIndex = 0;
    }
    
    //请求公告
    wx.Apis.api.getConfigValue('notice',(code, data) => {
      wx.setStorageSync('notice', data.value)
    });

    
    //请求配置
    wx.Apis.api.getConfigValue('isWrite',(code, data) => {
      wx.setStorageSync('isWrite', data.value)
    });

    wx.Apis.api.getConfigValue('checkUser',(code, data) => {
      wx.setStorageSync('checkUser', data.value)
    });

    wx.Apis.api.getConfigValue('useLearn',(code, data) => {
      wx.setStorageSync('useLearn', data.value)
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
                    // wx.Apis.logins(res.data)
                    // wx.hideLoading({
                    //   success: (res) => {},
                    // })
                    wx.Apis.logins(res.code, (code, data) => {
                        console.log(data);
                        wx.Apis.setUid(data.openid); //openid
                        wx.Apis.set('openid', data.openid);
                        wx.setStorageSync('userInfo', data);
                        that.globalData.uid = data.uid
                        wx.hideLoading({
                          success: (res) => {},
                        })
                    });
                }
            },fail(){
              wx.hideLoading({
                success: (res) => {},
              })
            }
        });
    }else {
      let that = this
      Apis.login.index((code, data) => {
        console.log(data);
        Apis.setUid(data.openid); //openid
        wx.setStorageSync('userInfo', data)
        wx.setStorageSync('uid', data.uid)
        that.globalData.uid = data.uid
      });
    }
  },
  globalData: {
    userInfo: null,
    mainActiveIndex:0,
    bgmUrl: 'https://mamba-blog-images.oss-cn-shanghai.aliyuncs.com/5c8a08dc4956424741.mp3',
    uid: 0,
  },
  // towxml: require('/towxml/index'),
  initAPI() {
    var cloudCaller = function (url,oper,params, callback) {
      var header = {
        'Content-Type': 'application/json'
      };
      wx.request({
        url,
        method: oper,
        data: params,
        header,
        success: function (res) {
          try {
            wx.stopPullDownRefresh();
          } catch (e) {}
          callback(res.statusCode == 200 ? null : res, res.data);
        },
        fail: function (err) {
          try {
            wx.stopPullDownRefresh();
          } catch (e) {}
          callback(err);
        }
      });
    };
    Apis.init(cloudCaller);
  },
  saveInfo: function(e,t,n){
    wx.getStorage({
      key: e + "" + t,
      success: function(e){
        var t = e.data;
        getApp().info = !1;
        for (var i = 0; i < t.length; i++) if (t[i][Object.keys(t[i]).toString()].indexOf(n) > -1) return console.log(t[i][Object.keys(t[i]).toString()].indexOf(n) > -1),
          void (getApp().info = !0);
      }
    });
  },
  setIdsStroage: function (e, t, n, i) {
    wx.getStorage({
      key: e + "" + t,
      success: function (o) {
        for (var s = o.data, r = [], c = 0; c < s.length; c++) r.push(Object.keys(s[c]).toString());
        console.log(r)
        if (r.indexOf(n.toString()) > -1)
          for (c = 0; c < s.length; c++) Object.keys(s[c]).indexOf(n) > -1 && -1 == s[c][n].indexOf(i) && s[c][n].push(i);
        else {
          var a = {};
          a[n] = [], a[n].push(i), s.push(a);
        }
        wx.setStorage({
          key: e + "" + t,
          data: s
        });
      }, fail: function () {
        var o = [], s = {};
        s[n] = [], s[n].push(i), o.push(s), wx.setStorage({
          key: e + "" + t,
          data: o
        });
      }
    })
  },
  removeids: function(e,c,n) {
    wx.getStorage({
      key: e + "" + c,
      success: function (t) {
        for (var i = t.data, o = 0; o < i.length; o++) if (i[o][Object.keys(i[o]).toString()].indexOf(n) > -1) {
          var s = i[o][Object.keys(i[o]).toString()].indexOf(n);
          i[o][Object.keys(i[o]).toString()].splice(s, 1), 0 == i[o][Object.keys(i[o]).toString()].length && i.splice(o, 1);
        }
        wx.setStorage({
          key: e + "" + c,
          data: i
        });
      }
    });
  },
})
