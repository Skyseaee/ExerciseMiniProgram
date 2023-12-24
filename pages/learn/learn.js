// pages/learn/learn.js
var question_js = require('../../utils/question.js');
var underScore = require('../../utils/underscore-min.js');
import {playAudio} from '../../utils/util';
import Toast from '../../dist/toast/toast';
import {getNowDate} from '../../utils/util';
var rParam = "";
var mode = "";
var category_id = 1;
var question_d = [];
var q_ids = [];
var app = getApp();
var CORRECT_AUDIO = 'audios/correct.mp3'
var WRONG_AUDIO = 'audios/wrong.mp3'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        StorageAll: {},
        orderPX: {},
        redNum: 0,
        greenNum: 0,
        allNum: 0,
        iconInd: !1,
        iconIndtwo: !1,
        current: 0,
        textTab: "顺序练习",
        selectInd: !0,
        xiejie: !0,
        interval: 300,
        options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
        moreArr: {
            A: !1,
            B: !1,
            C: !1,
            D: !1,
            E: !1,
            F: !1,
            G: !1,
            H: !1,
            I: !1,
            J: !1
        },
        everyDay_error: 0,
        everyDay_all: 0,
        mode: "", //模式 1：考试 2：练习 3：背题
        type: "", //练习模式 1：顺序练习 2：随机练习 3：专项练习 4：题型练习 5：高频错题
        idarr: [],
        questions: [],
        recmend: !1,
        starshow: !1,
        fontSize: '32rpx',
        rightAutoNext: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(t) {
        this.setData({
            category_id: t.id,
            type: t.type,
            name: t.name,
            q_update_time: t.q_update_time
        })
        rParam = "";
        var that = this;
        if (t.type == 3 || t.type == 4) {
            wx.Apis.api.getEarmarkQuestionId(t.lid, t.type, t.id, (code, data) => {
                if(data.question_id == ''){
                    wx.showToast({
                      title: '暂无题目',
                    })

                    setTimeout(function(){
                        wx.navigateBack({
                            delta: 1
                        })
                    },1000)

                    return false;
                }
                q_ids = data.question_id.split(',')
                that.init_play(t);
            })
        } else if(t.type == 5){
            wx.Apis.api.oftenWrongQuestionId(t.id, (code, data) => {
                if(data.question_id == ''){
                    wx.showToast({
                      title: '暂无题目',
                    })

                    setTimeout(function(){
                        wx.navigateBack({
                            delta: 1
                        })
                    },1000)

                    return false;
                }
                q_ids = data.question_id.split(',')
                that.init_play(t);
            })
        } else {
            this.init_play(t);
        }

        this.initBgm();
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
        var fontSize = wx.getStorageSync('fontSize')
        if(fontSize){
            this.setData({
                fontSize: fontSize
            })
        }
        var rightAutoNext = wx.getStorageSync('rightAutoNext')
        if(rightAutoNext || rightAutoNext !== ''){
            this.setData({
                rightAutoNext: rightAutoNext
            })
        }
    },
    /**
     * mode 1:考试 2：练习 3：背题
     */
    init_play(a) {
        var that = this,
            model = a.mode;
        category_id = a.id
        that.setData({
            model: model,
            category_id: a.id,
            type: a.type,
            name: a.name,
            q_update_time: a.q_update_time
        })
        if (model == '3') {
            //背题模式
            var title = '背题模式';
        } else if (a.mode == "2") {
            if (a.type == 1) {
                mode = "order"; //顺序练习
                var title = "顺序练习";
            } else if (a.type == 2) {
                mode = "randow"; //随机练习
                var title = "随机练习";
            } else if (a.type == 3) {
                mode = a.lid + "earmark"; //专项练习
                var title = "专项练习";
            } else if (a.type == 4) {
                mode = a.lid + "type"; //题型练习
                var title = "题型练习";
            } else if(a.type == 5) {
                mode = "often"; //高频错题
                var title = "高频错题";
            }
        }
        wx.setNavigationBarTitle({
            title: title,
        })
        that.getMsg(model);
        wx.getStorage({
            key: mode + "list" + category_id,
            success: function (t) {
              that.setData({
                orderPX: t.data,
                allNum: t.data.all
              })
              var redNum = 0,greenNum = 0;
              for (var d in that.data.orderPX){
                if(that.data.orderPX[d] == "red"){
                  redNum++;
                  that.setData({redNum: redNum})
                }else if(that.data.orderPX[d] == "green"){
                  greenNum++;
                  that.setData({greenNum: greenNum})
                }
              }
            }
          })
    },

    getMsg(e) {
        var that = this;
        wx.showLoading({
            title: '加载中',
        })
        wx.getStorage({
            key: mode + "" + category_id,
            success: function (t) {
                that.setData({
                    StorageAll: t.data
                })
            },
            complete: function () {
                var q = [];
                var iconcircle = that.data.iconcircle;
                wx.getStorage({
                    key: 'question_id_' + category_id,
                    success: function (qid) {
                        var ids = qid.data;
                        ("2" == that.data.model && 2 == that.data.type) && (iconcircle = [{
                            title: '',
                            question_ids: ids = underScore.shuffle(ids) //随机
                        }]);
                        ("2" == that.data.model && (3 == that.data.type || 4 == that.data.type || 5 == that.data.type)) && (iconcircle = [{
                            title: '',
                            question_ids: ids = q_ids
                        }]);
                        if (("2" == that.data.model || "3" == that.data.model) && (1 == that.data.type || 2 == that.data.type)) {
                            for (var questionArr = [], o = 0; o < ids.length; o++) questionArr[o] = underScore.clone(question_js.questions["question"][ids[o]]);
                        } else if ("2" == that.data.model && (3 == that.data.type || 4 == that.data.type || 5 == that.data.type)) {
                            question_js.initAllQuestionFromStorage(that.data.category_id);
                            var questionArr = question_js.getQuestionsByIds(q_ids)
                            console.log(questionArr)
                        }
                        console.log(questionArr)
                        for (var o = 0; o < ids.length; o++)
                            if (questionArr[o].answerArr = questionArr[o].answer.split(""), that.data.StorageAll[questionArr[o].id]) {
                                var u = that.data.StorageAll[questionArr[o].id];
                                "1" == u.subup || "0" == u.after ? questionArr[o].order = u : (console.log(), "2" == questionArr[o].type && (questionArr[o].order = {},
                                    questionArr[o].order.subup = 0, questionArr[o].order.down = {
                                        A: !1,
                                        B: !1,
                                        C: !1,
                                        D: !1,
                                        E: !1,
                                        F: !1,
                                        G: !1,
                                        H: !1,
                                        I: !1,
                                        J: !1
                                    }));
                            } else "2" == questionArr[o].type && (questionArr[o].order = {}, questionArr[o].order.subup = 0, questionArr[o].order.down = {
                                A: !1,
                                B: !1,
                                C: !1,
                                D: !1,
                                E: !1,
                                F: !1,
                                G: !1,
                                H: !1,
                                I: !1,
                                J: !1
                            });
                        console.log(questionArr)
                        console.log(questionArr)
                        var iconcircle = [{
                            'title': '试题',
                            'len': 0,
                            'question_count': ids.length,
                            'question_ids': ids
                        }]
                        question_d = questionArr
                        that.setData({
                            idarr: ids,
                            iconcircle: iconcircle
                        })
                        setTimeout(function () {
                            wx.hideLoading();
                        }, 1e3)
                        that.getthree();
                    }
                })
            }
        })
    },

    getthree() {
        var that = this;
        wx.getStorage({
            key: mode + "ind" + category_id,
            success: function (a) {
                var e = {
                    currentTarget: {
                        dataset: {
                            index: a.data
                        }
                    }
                }
                that.jumpToQuestion(e);
            },
            fail: function () {
                var a = {
                    currentTarget: {
                        dataset: {
                            index: 0
                        }
                    }
                };
                that.jumpToQuestion(a);
            }
        })
        wx.getStorage({
            key: mode + "" + category_id,
            success: function (a) {
                if (a.data) {
                    var e = that.data.orderPX;
                    e[that.data.idarr[a.data]] = 'blue', that.setData({
                        orderPX: e,
                        recmend: !0
                    }), that.questionStatus(), setTimeout(function () {
                        that.setData({
                            recmend: !1
                        });
                    }, 2e3);
                }
            }
        })
    },

    jumpToQuestion(t) {
        var that = this,
            order_px = that.data.orderPX;
        for (var r in order_px) "blue" == order_px[r] && (order_px[r] = "");
        this.setData({
            orderPX: order_px,
            iconInd: !1,
            iconIndtwo: !1,
            videoctrl: !0
        });
        var color = t.currentTarget.dataset.color;
        if ("red" != color && "green" != color) {
            order_px[t.currentTarget.dataset.id] = "blue", that.setData({
                orderPX: order_px
            })
        }
        var index = t.currentTarget.dataset.index;
        that.data.indexInd = index;
        var u = [];
        1 == this.data.current ? (that.data.indexInd <= 0 ? u.push(question_d[question_d.length - 1]) : u.push(question_d[that.data.indexInd - 1]),
            u.push(question_d[that.data.indexInd]), that.data.indexInd >= question_d.length - 1 ? u.push(question_d[0]) : u.push(question_d[question_d.length - 1])) : 0 == this.data.current ? (u.push(question_d[that.data.indexInd]),
            that.data.indexInd == question_d.length - 1 ? (u.push(question_d[0]), u.push(question_d[1])) : that.data.indexInd == question_d.length - 2 ? (u.push(question_d[that.data.indexInd + 1]),
                u.push(question_d[0])) : (u.push(question_d[that.data.indexInd + 1]), u.push(question_d[that.data.indexInd + 2]))) : (0 == that.data.indexInd ? (u.push(question_d[question_d.length - 2]),
            u.push(question_d[question_d.length - 1])) : 1 == that.data.indexInd ? (u.push(question_d[question_d.length - 1]), u.push(question_d[0])) : (u.push(question_d[that.data.indexInd - 2]),
            u.push(question_d[that.data.indexInd - 1])), u.push(question_d[that.data.indexInd])), this.setData({
            questions: u,
            indexInd: index
        })
        console.log(index)
        getApp().saveInfo("starids", category_id, question_d[index].id.toString()), setTimeout(function () {
            that.setData({
                starshow: getApp().info
            })
        }, 500)
        console.log(u)
    },
    questionStatus() {
        var that = this;
        wx.getStorage({
            key: mode + "list" + category_id,
            success: function (a) {
                that.setData({
                    orderPX: a.data,
                    allNum: a.data.all
                });
            }
        });
    },
    _updown() {
        this.setData({
            iconInd: !this.data.iconInd,
        })
    },
    starcollect() {
        this.setData({
            starshow: !this.data.starshow
        })
        this.data.starshow ? getApp().setIdsStroage("starids", category_id, category_id, this.data.questions[this.data.current].id.toString()) :
            getApp().removeids("starids", category_id, this.data.questions[this.data.current].id.toString());
    },

    del_data() {
        var t = this;
        wx.showModal({
            content: '确定要清空吗？',
            success: function (a) {
                if (a.confirm) {
                    var e = mode + "ind" + category_id,
                        r = mode + "list" + category_id,
                        i = mode + "" + category_id;
                    wx.removeStorageSync(i), wx.removeStorageSync(r), wx.removeStorageSync(e);
                    var o = {
                        id: t.data.category_id,
                        mode: t.data.model,
                        type: t.data.type
                    };
                    question_d = [], t.setData({
                        iconInd: !1,
                        StorageAll: {},
                        everyDay_error: 0,
                        greenNum: 0,
                        redNum: 0,
                        orderPX: {}
                    }), t.init_play(o);
                }
            }
        })
    },
    pageChange: function (t) {
        "autoplay" == t.detail.source && this.setData({
            autoplay: !1
        });
        var that = this;
        if (this.data.questions[t.detail.current].type == 2) {
            that.setData({
                moreArr: this.data.questions[t.detail.current].order.down,
                xiejie: !0
            })
        } else {
            that.setData({
                moreArr: {
                    A: !1,
                    B: !1,
                    C: !1,
                    D: !1,
                    E: !1,
                    F: !1,
                    G: !1,
                    H: !1,
                    I: !1,
                    J: !1
                },
                xiejie: !0
            })
        }
        var current_e = that.data.current,
            current_r = t.detail.current,
            indexInd_n = that.data.indexInd,
            i = 1 * current_r - 1 * current_e;
        if (-2 == i ? i = 1 : 2 == i && (i = -1), (indexInd_n += i) >= question_d.length)
            return indexInd_n = 0, that.result(0),
                void that.setData({
                    xiejie: !1,
                    current: 2
                });
        if (indexInd_n < 0) return wx.showToast({
            icon: 'loading',
            title: "已经是第一题"
        }), that.setData({
            xiejie: !1,
            current: 0
        }), void(indexInd_n = question_d.length - 1);
        var question_o = [];
        0 == current_r ? (question_o.push(question_d[indexInd_n]), question_o.push(question_d[indexInd_n + 1]), question_o.push(question_d[indexInd_n - 1]), question_o[1] || (question_o[1] = question_d[0]),
                question_o[2] || (question_o[2] = question_d[question_d.length - 1])) : 1 == current_r ? (question_o.push(question_d[indexInd_n - 1]), question_o.push(question_d[indexInd_n]), question_o.push(question_d[indexInd_n + 1]),
                question_o[2] || (question_o[2] = question_d[0]), question_o[0] || (question_o[0] = question_d[question_d.length - 1])) : 2 == current_r && (question_o.push(question_d[indexInd_n + 1]),
                question_o.push(question_d[indexInd_n - 1]), question_o.push(question_d[indexInd_n]), question_o[0] || (question_o[0] = question_d[0]), question_o[1] || (question_o[1] = question_d[question_d.length - 1])),
            console.log(question_o)
        this.setData({
            questions: question_o,
            indexInd: indexInd_n,
            current: current_r
        }), getApp().saveInfo("starids", category_id, question_d[indexInd_n].id.toString()), setTimeout(function () {
            that.setData({
                starshow: getApp().info
            });
        }, 300)
    },
    autoPlay() {
        console.log('auto')
        if(this.data.rightAutoNext){
            this.setData({
                autoplay: !0
            });
        }
    },
    selectAnswer(t) {
        function acet() {
            if (opar = that.data.idarr[index_ind], index_ind < that.data.idarr.length - 1) {
                if ("green" != that.data.orderPX[opar] && "red" != that.data.orderPX[opar]) {
                    wx.setStorage({
                        key: mode + "ind" + category_id,
                        data: index_ind
                    })
                    var tar = that.data.orderPX;
                    for (var r in tar) "blue" == tar[r] && (tar[r] = "");
                    return tar[opar] = "blue", that.setData({
                        orderPX: tar
                    }), void console.log(that.data.orderPX);
                }
                index_ind++, acet();
            } else wx.setStorage({
                key: mode + "ind" + category_id,
                data: that.data.idarr.length - 1
            })
        }

        var that = this
        var index_ind = that.data.indexInd + 1;
        var opar = that.data.idarr[index_ind];
        if (acet(), 2 == that.data.model) {
            var u = question_d
            var l = that.data.questions;
            if (that.data.StorageAll[that.data.idarr[that.data.indexInd]]) l[that.data.current].order = that.data.StorageAll[that.data.idarr[that.data.indexInd]],
                that.setData({
                    questions: l
                });
            else {
                u[that.data.indexInd].order = {
                    after: 0,
                    downAnswer: t.currentTarget.dataset.ind,
                    answer: t.currentTarget.dataset.answer
                }, l[that.data.current].order = {
                    after: 0,
                    downAnswer: t.currentTarget.dataset.ind,
                    answer: t.currentTarget.dataset.answer
                }, question_d = u, that.setData({
                    questions: l
                });
                var storage_c = that.data.StorageAll
                storage_c[t.currentTarget.dataset.id] = {
                    after: 0,
                    downAnswer: t.currentTarget.dataset.ind,
                    answer: t.currentTarget.dataset.answer
                }, wx.setStorage({
                    key: mode + "" + category_id,
                    data: storage_c
                }), that.setData({
                    StorageAll: storage_c
                });
                var all = that.data.allNum
                if (all++, t.currentTarget.dataset.ind == t.currentTarget.dataset.answer) {
                    playAudio(CORRECT_AUDIO);
                    var orderPX_v = that.data.orderPX
                    orderPX_v[t.currentTarget.dataset.id] = "green", orderPX_v.all = all;
                    // wx.setStorage({
                    //     key: mode + 'list' + category_id,
                    //     data: orderPX_v
                    // });
                    wx.setStorageSync(mode + 'list' + category_id, orderPX_v)
                    var greenNum_h = that.data.greenNum;
                    if (greenNum_h++, that.setData({
                            greenNum: greenNum_h
                        }), that.data.indexInd < question_d.length - 1) {
                        that.autoPlay();
                        var x = that.data.everyDay_all;
                        x++, that.setData({
                            everyDay_all: x
                        })
                    }
                } else if (t.currentTarget.dataset.ind != t.currentTarget.dataset.answer) {
                    playAudio(WRONG_AUDIO);
                    getApp().setIdsStroage("errorids", category_id, category_id, l[that.data.current].id.toString())
                    var orderPX_v = that.data.orderPX
                    orderPX_v[t.currentTarget.dataset.id] = "red", orderPX_v.all = all;
                    // wx.setStorage({
                    //     key: mode + "list" + category_id,
                    //     data: orderPX_v
                    // });
                    wx.setStorageSync(mode + "list" + category_id, orderPX_v)
                    var redNum_f = that.data.redNum;
                    redNum_f++, that.setData({
                        redNum: redNum_f
                    })
                }
                that.questionStatus();
            }
        }
    },
    selectAnswerMore(t) {
        var that = this;
        if ("1" != that.data.questions[that.data.current].order.subup) {
            var storageAll_e = that.data.StorageAll,
                moreArr_r = that.data.moreArr;
            moreArr_r[t.currentTarget.dataset.ind] ? moreArr_r[t.currentTarget.dataset.ind] = !1 : moreArr_r[t.currentTarget.dataset.ind] = !0,
                storageAll_e[t.currentTarget.dataset.id] = {
                    subup: 0,
                    down: moreArr_r
                }, that.setData({
                    moreArr: moreArr_r
                }), wx.setStorage({
                    key: mode + "" + category_id,
                    data: storageAll_e
                }), wx.getStorage({
                    key: mode + "" + category_id,
                    success: function (t) {
                        that.setData({
                            StorageAll: t.data
                        })
                    },
                });
            var question_d = that.data.questions;
            question_d[that.data.current].order = storageAll_e[t.currentTarget.dataset.id],
                that.setData({
                    questions: question_d
                })
        }
    },
    moreSelectSub(t) {
        function acet() {
            if (opar = that.data.idarr[index_ind], index_ind < that.data.idarr.length - 1) {
                if ("green" != that.data.orderPX[opar] && "red" != that.data.orderPX[opar]) {
                    wx.setStorage({
                        key: mode + "ind" + category_id,
                        data: index_ind
                    })
                    var orderPX_t = that.data.orderPX;
                    for (var r in orderPX_t) "blue" == orderPX_t[r] && (orderPX_t[r] = "");
                    return orderPX_t[opar] = "blue", that.setData({
                        orderPX: orderPX_t
                    }), void console.log(that.data.orderPX);
                }
                index_ind++, acet();
            } else wx.setStorage({
                key: mode + "ind" + category_id,
                data: that.data.idarr.length - 1
            })
        }

        var that = this
        var index_ind = that.data.indexInd + 1;
        var opar = that.data.idarr[index_ind];
        acet();
        var u = that.data.StorageAll,
            l = that.data.moreArr;
        var h = 0;
        var downAnswer = ""
        for (var v in that.data.moreArr) {
            if (that.data.moreArr[v]) {
                h++;
                downAnswer += v
            }
        }
        if (h == 0) {
            Toast.fail('请选择答案');
            return false;
        }
        console.log(downAnswer)
        u[t.currentTarget.dataset.id] = {
            subup: 1,
            down: l,
            downAnswer: downAnswer
        }, that.setData({
            StorageAll: u
        }), wx.setStorage({
            key: mode + "" + category_id,
            data: u,
        });
        var c = that.data.questions,
            g = question_d;
        g[that.data.indexInd].order = {
            subup: 1,
            down: l,
            downAnswer: downAnswer
        }, c[that.data.current].order = {
            subup: 1,
            down: l,
            downAnswer: downAnswer
        }, question_d = g, that.setData({
            questions: c
        });
        var allNum_f = that.data.allNum;
        if (allNum_f++, h == t.currentTarget.dataset.answer.length && downAnswer == t.currentTarget.dataset.answer) {
            (x = that.data.orderPX)[t.currentTarget.dataset.id] = "green", x.all = allNum_f;
            // wx.setStorage({
            //     key: mode + "list" + category_id,
            //     data: x
            // });
            wx.setStorageSync(mode + "list" + category_id, x)
            playAudio(CORRECT_AUDIO);
            var p = that.data.greenNum;
            p++, that.setData({
                greenNum: p
            }), that.questionStatus(), that.autoPlay();
            w = that.data.everyDay_all;
            w++, that.setData({
                everyDay_all: w
            });
        } else {
            getApp().setIdsStroage("errorids", category_id, category_id, c[that.data.current].id.toString());
            var x = that.data.orderPX;
            x[t.currentTarget.dataset.id] = "red", x.all = allNum_f;
            // wx.setStorage({
            //     key: mode + "list" + category_id,
            //     data: x,
            // })
            wx.setStorageSync(mode + "list" + category_id, x)
            playAudio(WRONG_AUDIO);
            var y = that.data.redNum;
            y++, that.setData({
                redNum: y
            }), that.questionStatus();
            var D = that.data.everyDay_error,
                w = that.data.everyDay_all;
            rParam += "," + t.currentTarget.dataset.id, D++, w++, that.setData({
                everyDay_error: D,
                everyDay_all: w
            });
        }
        that.setData({
            moreArr: {
                A: !1,
                B: !1,
                C: !1,
                D: !1,
                E: !1,
                F: !1,
                G: !1,
                H: !1,
                I: !1,
                J: !1
            },
        });
    },
    fillSub(params) {
        if (params.detail.value.subAnswer == '') {
            Toast.fail('请输入答案');
            return false;
        }

        function acet() {
            if (opar = that.data.idarr[index_ind], index_ind < that.data.idarr.length - 1) {
                if ("green" != that.data.orderPX[opar] && "red" != that.data.orderPX[opar]) {
                    wx.setStorage({
                        key: mode + "ind" + category_id,
                        data: index_ind
                    });
                    var tar = that.data.orderPX;
                    for (var r in tar) "blue" == tar[r] && (tar[r] = "");
                    return tar[opar] = "blue", that.setData({
                        orderPX: tar
                    }), void console.log(that.data.orderPX);
                }
                index_ind++, acet();
            } else wx.setStorage({
                key: mode + "ind" + category_id,
                data: that.data.idarr.length - 1
            })
        }

        var that = this
        var index_ind = that.data.indexInd + 1;
        var opar = that.data.idarr[index_ind];
        if (acet(), 2 == that.data.model) {
            var u = question_d
            var l = that.data.questions;
            if (that.data.StorageAll[that.data.idarr[that.data.indexInd]]) l[that.data.current].order = that.data.StorageAll[that.data.idarr[that.data.indexInd]],
                that.setData({
                    questions: l
                });
            else {
                u[that.data.indexInd].order = {
                    after: 0,
                    downAnswer: params.detail.value.subAnswer,
                    answer: params.detail.value.answer,
                    subup: 1
                }, l[that.data.current].order = {
                    after: 0,
                    downAnswer: params.detail.value.subAnswer,
                    answer: params.detail.value.answer,
                    subup: 1
                }, question_d = u, that.setData({
                    questions: l
                });
                var storage_c = that.data.StorageAll
                storage_c[params.detail.value.id] = {
                    after: 0,
                    downAnswer: params.detail.value.subAnswer,
                    answer: params.detail.value.answer,
                    subup: 1
                }, wx.setStorage({
                    key: mode + "" + category_id,
                    data: storage_c
                }), that.setData({
                    StorageAll: storage_c
                });
                var all = that.data.allNum
                if (all++, params.detail.value.subAnswer == params.detail.value.answer) {
                    playAudio(CORRECT_AUDIO)
                    var orderPX_v = that.data.orderPX
                    orderPX_v[params.detail.value.id] = "green", orderPX_v.all = all;
                    // wx.setStorage({
                    //     key: mode + 'list' + category_id,
                    //     data: orderPX_v
                    // });
                    wx.setStorageSync( mode + 'list' + category_id, orderPX_v)
                    var greenNum_h = that.data.greenNum;
                    if (greenNum_h++, that.setData({
                            greenNum: greenNum_h
                        }), that.data.indexInd < question_d.length - 1) {
                        that.autoPlay();
                        var x = that.data.everyDay_all;
                        x++, that.setData({
                            everyDay_all: x
                        })
                    }
                } else if (params.detail.value.subAnswer != params.detail.value.answer) {
                    console.log(l)
                    playAudio(WRONG_AUDIO)
                    getApp().setIdsStroage("errorids", category_id, category_id, l[that.data.current].id.toString())
                    var orderPX_v = that.data.orderPX
                    orderPX_v[params.detail.value.id] = "red", orderPX_v.all = all;
                    // wx.setStorage({
                    //     key: mode + "list" + category_id,
                    //     data: orderPX_v
                    // });
                    wx.setStorageSync(mode + "list" + category_id, orderPX_v)
                    var redNum_f = that.data.redNum;
                    redNum_f++, that.setData({
                        redNum: redNum_f
                    })
                    var p = that.data.everyDay_error;
                    rParam += "," + params.detail.value.id;
                    var x = that.data.everyDay_all;
                    p++, x++, that.setData({
                        everyDay_error: p,
                        everyDay_all: x
                    });
                }
                that.questionStatus();
            }
        }
    },

    moreFillSub(params) {
        var arrAnswer = params.detail.value.answer.split(';');
        var null_i = 0;
        for (var i = 0; i < arrAnswer.length; i++) {
            if (params.detail.value['subAnswer' + i] == '') {
                null_i++;
            }
        }
        if (null_i == arrAnswer.length) {
            Toast.fail('请输入答案');
            return false;
        }

        function acet() {
            if (opar = that.data.idarr[index_ind], index_ind < that.data.idarr.length - 1) {
                if ("green" != that.data.orderPX[opar] && "red" != that.data.orderPX[opar]) {
                    wx.setStorage({
                        key: mode + "ind" + category_id,
                        data: index_ind
                    });
                    var tar = that.data.orderPX;
                    for (var r in tar) "blue" == tar[r] && (tar[r] = "");
                    return tar[opar] = "blue", that.setData({
                        orderPX: tar
                    }), void console.log(that.data.orderPX);
                }
                index_ind++, acet();
            } else wx.setStorage({
                key: mode + "ind" + category_id,
                data: that.data.idarr.length - 1
            })
        }

        var that = this
        var index_ind = that.data.indexInd + 1;
        var opar = that.data.idarr[index_ind];
        if (acet(), 2 == that.data.model) {
            var u = question_d
            var l = that.data.questions;
            if (that.data.StorageAll[that.data.idarr[that.data.indexInd]]) l[that.data.current].order = that.data.StorageAll[that.data.idarr[that.data.indexInd]],
                that.setData({
                    questions: l
                });
            else {
                console.log(params.detail.value)
                var arrFillAnswer = [];
                for (var i = 0; i < arrAnswer.length; i++) {
                    arrFillAnswer.push(params.detail.value['subAnswer' + i]);
                }
                u[that.data.indexInd].order = {
                    after: 0,
                    downAnswer: arrFillAnswer.join(';'),
                    answer: params.detail.value.answer,
                    subup: 1
                }, l[that.data.current].order = {
                    after: 0,
                    downAnswer: arrFillAnswer.join(';'),
                    answer: params.detail.value.answer,
                    subup: 1
                }, question_d = u, that.setData({
                    questions: l
                });
                var storage_c = that.data.StorageAll
                storage_c[params.detail.value.id] = {
                    after: 0,
                    downAnswer: arrFillAnswer.join(';'),
                    answer: params.detail.value.answer,
                    subup: 1
                }, wx.setStorage({
                    key: mode + "" + category_id,
                    data: storage_c
                }), that.setData({
                    StorageAll: storage_c
                });
                var all = that.data.allNum
                var right_i = 0;
                for (var i = 0; i < arrAnswer.length; i++) {
                    if (params.detail.value['subAnswer' + i] == arrAnswer[i]) {
                        right_i++;
                    }
                }
                if (all++, right_i == arrAnswer.length) {
                    var orderPX_v = that.data.orderPX
                    orderPX_v[params.detail.value.id] = "green", orderPX_v.all = all;
                    // wx.setStorage({
                    //     key: mode + 'list' + category_id,
                    //     data: orderPX_v
                    // });
                    wx.setStorageSync(mode + 'list' + category_id, orderPX_v)
                    playAudio(CORRECT_AUDIO);
                    var greenNum_h = that.data.greenNum;
                    if (greenNum_h++, that.setData({
                            greenNum: greenNum_h
                        }), that.data.indexInd < question_d.length - 1) {
                        that.autoPlay();
                        var x = that.data.everyDay_all;
                        x++, that.setData({
                            everyDay_all: x
                        })
                    }
                } else if (right_i != arrAnswer.length) {
                    console.log(l)
                    getApp().setIdsStroage("errorids", category_id, category_id, l[that.data.current].id.toString())
                    var orderPX_v = that.data.orderPX
                    orderPX_v[params.detail.value.id] = "red", orderPX_v.all = all;
                    // wx.setStorage({
                    //     key: mode + "list" + category_id,
                    //     data: orderPX_v
                    // });
                    wx.setStorageSync(mode + "list" + category_id, orderPX_v)
                    playAudio(WRONG_AUDIO)
                    var redNum_f = that.data.redNum;
                    redNum_f++, that.setData({
                        redNum: redNum_f
                    })
                    var p = that.data.everyDay_error;
                    rParam += "," + params.detail.value.id;
                    var x = that.data.everyDay_all;
                    p++, x++, that.setData({
                        everyDay_error: p,
                        everyDay_all: x
                    });
                }
                that.questionStatus();
            }
        }
    },

    showAnswer(params) {
        function acet() {
            if (opar = that.data.idarr[index_ind], index_ind < that.data.idarr.length - 1) {
                if ("green" != that.data.orderPX[opar] && "red" != that.data.orderPX[opar]) {
                    wx.setStorage({
                        key: mode + "ind" + category_id,
                        data: index_ind
                    });
                    var tar = that.data.orderPX;
                    for (var r in tar) "blue" == tar[r] && (tar[r] = "");
                    return tar[opar] = "blue", that.setData({
                        orderPX: tar
                    }), void console.log(that.data.orderPX);
                }
                index_ind++, acet();
            } else wx.setStorage({
                key: mode + "ind" + category_id,
                data: that.data.idarr.length - 1
            })
        }
        var that = this
        var index_ind = that.data.indexInd + 1;
        var opar = that.data.idarr[index_ind];
        if (acet(), 2 == that.data.model) {
            var u = question_d
            var l = that.data.questions;
            if (that.data.StorageAll[that.data.idarr[that.data.indexInd]]) l[that.data.current].order = that.data.StorageAll[that.data.idarr[that.data.indexInd]],
                that.setData({
                    questions: l
                });
            else {
                u[that.data.indexInd].order = {
                    subup: 1
                }, l[that.data.current].order = {
                    subup: 1
                }, question_d = u, that.setData({
                    questions: l
                });
                var storage_c = that.data.StorageAll
                storage_c[params.detail.value.id] = {
                    subup: 1
                }, wx.setStorage({
                    key: mode + "" + category_id,
                    data: storage_c
                }), that.setData({
                    StorageAll: storage_c
                });
                var orderPX_v = that.data.orderPX
                var all = that.data.allNum
                orderPX_v[params.detail.value.id] = "green", orderPX_v.all = all;
                // wx.setStorage({
                //     key: mode + 'list' + category_id,
                //     data: orderPX_v
                // });
                wx.setStorageSync(mode + 'list' + category_id, orderPX_v)
                that.questionStatus();
            }
        }
    },
    //预览图片，放大预览
    preview(event) {
        var currentUrl = event.currentTarget.dataset.src;
        var imgList = [];
        imgList.push(currentUrl)
        wx.previewImage({
            current: currentUrl, // 当前显示图片的http链接
            urls: imgList // 需要预览的图片http链接列表
        })
    },
    closeNotice: function () {
        this.setData({
            notice: !this.data.notice
        })
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {
        if(wx.getStorageSync('music')){
            this.bgm.pause()
        }
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {
        if(wx.getStorageSync('music')){
            this.bgm.pause()
        }
        
        var myCategory = wx.getStorageSync('myCategory');
        var data = {
            'id': category_id,
            'name': this.data.name,
            'date': getNowDate(),
            'q_update_time' : this.data.q_update_time
        };
        if (myCategory) {
            for (var i = 0; i < myCategory.length; i++ ){
                if(myCategory[i]['id'] == category_id){
                    myCategory.splice(i, 1);
                }
            }
            myCategory.unshift(data);
            wx.setStorageSync('myCategory', myCategory);
        } else {
            myCategory = [];
            myCategory.push(data)
            wx.setStorageSync('myCategory', myCategory);

        }
        
    },

    initBgm() {
        if(wx.getStorageSync('music')){
            this.bgm = wx.createInnerAudioContext()
            this.bgm.loop = true
            this.bgm.autoplay = false
            this.bgm.src = app.globalData.bgmUrl
            this.bgm.play()
        }  
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

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
    }
})