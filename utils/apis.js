import {
    utf8MD5
} from "/md5.js"

// 请求地址
var host = 'https://www.skyseaee.cn/routine/'; 

var cache = {};
var _cloudCaller;
var _userid;

var USERID_KEY = "openid";

function init(cloudFuncCaller) {
    if (isFunc(cloudFuncCaller)) {
        _cloudCaller = cloudFuncCaller;
        _userid = get(USERID_KEY, '');
        return;
    }
    throw 'Wrong type of init params';
}

function _req(cloudName, oper, params, callback) {
    if (!params) params = {};
    if (_userid && !params.openId) {
        params.openId = _userid;
    }
    if (!params.timeStamp) {
        params.timeStamp = new Date().getTime()
    }
    // console.log(params)
    params.sign = getSign(params);
    _cloudCaller(host + cloudName, oper, params, function (err, response) {
        if (isFunc(callback)) {
            if (err)
                callback(1101, err);
            else {
                callback(response.code, response.data || response.msg);
            }
        }
    });
}

function getSign(a) {
    var sum = [];
    Object.keys(a).sort().forEach(e => {
        if(typeof a[e] != "object"){
          sum.push(e + '=' + a[e]);
        }
    });
    sum.push("key=" + 'XVpNVlSrDxgwNsNbA0yD5ajpIz0LFsba')
    //   console.log('Sign of:', a, '>', sum.join('&'));
    // console.log(sum.join('&'))
    return utf8MD5(sum.join('&')).toUpperCase();
}

function isFunc(f) {
    return f && 'function' === typeof (f);
}

function set(key, value) {
    if (!key) return;
    if (value == undefined || value == null || value === '') {
        wx.removeStorageSync(key);
        delete(cache[key]);
    } else {
        wx.setStorageSync(key, value);
        cache[key] = value;
    }
}

function get(key, defValue) {
    if (!key) return defValue;
    var value = cache[key]
    if (value == undefined || value == null || value === '') {
        try {
            value = wx.getStorageSync(key);
        } catch (e) {}
        if (value == undefined || value == null || value === '')
            return defValue;
        cache[key] = value;
    }
    return value;
}

module.exports.login = {
    //登录
    login(code, callback) {
        _req('login/login', 'post', {
            code
        }, callback);
    },
    //保存用户信息
    save(userInfo, callback) {
        _req('login/save', 'post', {
            userInfo
        }, callback);
    },
    //获取用户信息
    index(callback) {
        _req('login/index', 'post', {}, callback);
    },
};

module.exports.api = {
    //获取轮播图
    bannerList(callback) {
        _req('auth_api/banner_list', 'post', {}, callback);
    },
    //获取配置
    getConfigValue(key, callback) {
        _req('auth_api/get_config_value', 'post', {
            key
        }, callback);
    },
    //获取活动列表数据
    getActivityList(page, limit, callback) {
        _req('auth_api/activity_list', 'post', {
            page,
            limit
        }, callback);
    },
    //首页显示一级分类
    firstShowCategory(callback) {
        _req('auth_api/first_show_category', 'post', {}, callback);
    },
    //获取一二级分类
    firstCategoryList(callback) {
        _req('auth_api/first_category_list', 'post', {}, callback);
    },
    //获取三级分类
    thirdCategoryList(second_category_id, keyword, callback) {
        _req('auth_api/third_category_list', 'post', {
            second_category_id,
            keyword
        }, callback);
    },
    //获取题库分类
    categoryList(third_category_id, callback) {
        _req('auth_api/category_list', 'post', {
            third_category_id
        }, callback);
    },
    //获取分类所有的题目
    getQuestionList(id, callback) {
        _req('auth_api/get_question_list', 'post', {
            id
        }, callback);
    },
    //获取考试题目id
    getQuestionId(id, callback) {
        _req('auth_api/get_question_id', 'post', {
            id
        }, callback);
    },
    //获取题库分类详情
    getCategoryDetail(id, callback) {
        _req('auth_api/category_detail', 'post', {
            id
        }, callback);
    },
    //获取分类专项列表
    getEarmarkList(cid, callback) {
        _req('auth_api/get_earmark_list', 'post', {
            cid
        }, callback);
    },

    //获取分类题型列表
    getTypeList(cid, callback) {
        _req('auth_api/get_type_list', 'post', {
            cid
        }, callback);
    },
    //获取分类专项题目id
    getEarmarkQuestionId(id, type, category, callback) {
        _req('auth_api/get_earmark_question_id', 'post', {
            id,
            type,
            category
        }, callback);
    },
    //搜索题目
    getSearchQuestion(id, keyword, page, limit, callback) {
        _req('auth_api/search_question', 'post', {
            id,
            keyword,
            page,
            limit
        }, callback);
    },
    //获取签到积分配置
    getSignConfig(callback) {
        _req('auth_api/get_sign_config', 'post', {}, callback);
    },
    //获取用户签到
    getUserSign(uid, callback) {
        _req('auth_api/get_user_sign', 'post', {
            uid
        }, callback);
    },
    //用户签到
    userSign(uid, callback) {
        _req('auth_api/user_sign', 'post', {
            uid
        }, callback);
    },

    //用户签到列表
    getSignList(params, callback) {
        _req('auth_api/get_sign_list', 'post', {
            params
        }, callback);
    },

    //按月获取用户签到列表
    getSignMonthList(params, callback) {
        _req('auth_api/get_sign_month_list', 'post', {
            params
        }, callback);
    },

    //保存考试活动记录
    saveExamRecord(params, callback) {
        _req('auth_api/save_exam_record', 'post', {
            params
        }, callback);
    },

    //答题记录详情
    getRecordDetail(id, callback) {
        _req('auth_api/get_record_detail', 'post', {
            id
        }, callback);
    },

    //获取用户答题记录
    getUserRecord(page, limit, uid, callback) {
        _req('auth_api/get_user_record', 'post', {
            page,
            limit,
            uid
        }, callback);
    },

    //获取文章分类
    getArticleCategory(callback) {
        _req('auth_api/get_article_category','get',{},callback);
    },

    //获取文章列表
    getArticleList(category, sort, page, limit, callback){
        _req('auth_api/get_article_list','get',{
            category,
            sort,
            page,
            limit
        },callback);
    },

    //获取文章详情
    getArticleDetail(id, callback){
        _req('auth_api/get_article_detail','get',{
            id
        },callback);
    },

    //增加文章阅读数
    addArticleRead(id, callback){
        _req('auth_api/add_article_read','get',{
            id
        },callback);
    },

    //用户积分
    getUserIntegral(page, limit, uid, callback) {
        _req('auth_api/get_user_integral_list', 'post', {
            page,
            limit,
            uid
        }, callback);
    },
    
    //高频错题题目id
    oftenWrongQuestionId(category, callback) {
        _req('auth_api/often_wrong_question_id', 'post', {
            category
        }, callback)
    },

    //保存意见反馈
    saveFeedback(params,callback) {
        _req('auth_api/save_feedback', 'post', {
            params
        }, callback);
    },

    //保存个人信息
    saveUserInfo(params,callback) {
        _req('auth_api/save_userinfo', 'post', {
            params
        }, callback);
    },

    //保存个人信息
    saveAgainUserInfo(params,callback) {
        _req('auth_api/save_again_userinfo', 'post', {
            params
        }, callback);
    },

    //排行榜
    getRankList(params,callback){
        _req('auth_api/get_rank_list', 'post', {
            params
        }, callback);
    },
    //判断是否需要激活码和是否激活过
    isUseCode(category, uid, callback){
        _req('auth_api/is_use_code', 'post', {
            category,
            uid
        }, callback);
    },
    //激活码激活题库
    activate(category, uid, code, callback){
        _req('auth_api/activate', 'post', {
            category,
            uid,
            code
        }, callback);
    },
    //增加激励视频积分
    addVideoPoints(uid, callback){
        _req('auth_api/add_video_points', 'post', {
            uid
        }, callback);
    },
    //积分兑换激活码
    exchangeCode(uid, callback){
        _req('auth_api/exchange_code', 'post', {
            uid
        }, callback);
    },
    //用户激活码列表
    userCodeList(uid, callback){
        _req('auth_api/user_code_list', 'post', {
            uid
        }, callback);
    }
}

module.exports.isLogin = function () {
    return (_userid ? _userid : false);
};
module.exports.setUid = function (uid) {
    if (uid)
        _userid = uid;
};
module.exports.getUserId = function () {
    return _userid;
};

module.exports.getHost = function () {
    return host;
}

module.exports.logins = function (code) {
  wx.login({
    success: function (res) {
      if (res.code) {
        // 发起网络请求
        wx.request({
          url: 'https://www.skyseaee.cn/routine/login/login', // 后端接口地址
          method: 'POST',
          data: {
            code: res.code // 将前端返回的code作为参数发送给后端
          },
          success: function (loginRes) {
            if (loginRes.statusCode === 200) {
              console.log(loginRes.data);
              // 假设后端返回的数据中包含openid和uid
              const { openid, uid } = loginRes.data;
              wx.setStorageSync('openid', openid); // 存储openid
              wx.setStorageSync('userInfo', loginRes.data); // 存储用户信息
              that.globalData.uid = uid; // 设置全局变量uid
              wx.hideLoading();
            } else {
              wx.showToast({
                title: '登录失败',
                icon: 'none'
              });
            }
          },
          fail: function (error) {
            console.error('请求登录接口失败', error);
            wx.showToast({
              title: '请求失败',
              icon: 'none'
            });
          }
        });
      } else {
        console.log('获取用户登录态失败！' + res.errMsg);
      }
    }
  });
}

module.exports.init = init;
module.exports.set = set;
module.exports.get = get;
module.exports.getSign = getSign;
