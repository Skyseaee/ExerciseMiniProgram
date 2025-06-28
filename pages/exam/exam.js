// pages/exam/exam.js
import Toast from '../../dist/toast/toast';
import Dialog from '../../dist/dialog/dialog';
import { indexOf } from '../../utils/underscore-min';
import { getNowDate } from '../../utils/util';
var question_js = require('../../utils/question.js');
var mode = "random"; //n
var rParam = "exam"; //r
var category_id = 1; //s
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        timer: '',
        notice: false,
        StorageAll: {},
        indexInd: 0,
        redNum: 0,
        greenNum: 0,
        allNum: 0,
        intensify_qis: [],
        intensify_eids: [],
        intensify_okids: [],
        orderPX: {},
        idarr: [],
        textTab: "答题模式",
        selectInd: !0,
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
        iconInd: !1,
        iconcircle: [],
        recmend: !1,
        iconIndtwo: !1,
        youind: 0,
        outside: !0,
        current: 0,
        questions: [],
        xiejie: !0,
        timeshow: !0,
        times: "",
        ytimes: "",
        danxuan: 0,
        duoxuan: 0,
        panduan: 0,
        tiankong: 0,
        allfen: 0,
        passf: 0,
        interval: 300,
        training_qids: "",
        training_jl: "",
        videoctrl: !0,
        videoMedia: "",
        startTime: 0,
        startTimeind: !1,
        nums: 0,
        testMode: !1,
        timeback: !1,
        statusOptions: {
            statusType: 0,
            statusColor: "#ff4f42",
            statusBg: "#ffe3e1",
            statusPlan: 1.5,
            statusError: 11,
            statusAnswer: 39,
            statusScore: 50
        },
        fontSize: '32rpx',
        finishAutoNext: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(params) {
        console.log(params)
        var that = this;
        this.setData({
            category_id: params.id,
            model: 1,
            timeback: params.timeback,
            q_update_time: params.q_update_time
        })
        if (params.timeback) {
            that.setData({
                timeshow: !1,
                startTimeind: !1
            })
            wx.setNavigationBarTitle({
                title: "错题回顾"
            }), setTimeout(function () {
                wx.hideLoading();
            }, 1e3);
            wx.getStorage({
                key: rParam + "list" + that.data.category_id,
                success: function (t) {
                    that.setData({
                        orderPX: t.data,
                        allNum: t.data.all
                    });
                    var a = 0,
                        n = 0;
                    for (var r in that.data.orderPX) "red" == that.data.orderPX[r] ? (a++, that.setData({
                        redNum: a
                    })) : "green" == that.data.orderPX[r] && (n++, that.setData({
                        greenNum: n
                    }));
                }
            })
            that.getMsg(params)
        } else {
            wx.Apis.api.getQuestionId(params.id, (code, data) => {
                console.log(data)
                that.setData({
                    categoryDetail: data,
                    time: data.time,
                    nums: data.number,
                    pass: data.pass,
                    question_ids: data.question_id.split(",")
                }), wx.getStorage({
                    key: rParam + "list" + that.data.category_id,
                    success: function (t) {
                        that.setData({
                            orderPX: t.data,
                            allNum: t.data.all
                        });
                        var a = 0,
                            n = 0;
                        for (var r in that.data.orderPX) "red" == that.data.orderPX[r] ? (a++, that.setData({
                            redNum: a
                        })) : "green" == that.data.orderPX[r] && (n++, that.setData({
                            greenNum: n
                        }));
                    }
                })
                that.getMsg(params)
            })
        }

        this.initBgm();
    },

    changeTab: function () {
        var that = this,
            a = that.data.questions;
        that.setData({
            questions: a,
            textTab: "背题模式",
            selectInd: !1
        })
    },

    getMsg(params) {
        var that = this;
        wx.showLoading({
            title: '加载中',
        }), wx.getStorage({
            key: rParam + '' + that.data.category_id,
            success: function (t) {
                console.log(t.data)
                that.setData({
                    StorageAll: t.data
                })
            }
        })
        wx.getStorage({
            key: rParam + "all" + that.data.category_id,
            success: function (t) {
                if (that.data.timeshow || that.changeTab(), that.data.orderPX) {
                    for (var s = [], i = 0; i < t.data.length; i++) s.push(t.data[i]);
                    mode = s
                } else mode = t.data;
                that.setData({
                    questions: mode.slice(0, 3)
                }), wx.getStorage({
                    key: rParam + "ids" + that.data.category_id,
                    success: function (t) {
                        var a = [];
                        if (that.data.orderPX) {
                            for (var r = [], s = 0; s < t.data.length; s++) r.push(t.data[s]);
                            a = r;
                        } else a = t.data;
                        that.setData({
                            idarr: a
                        });
                    }
                });
                console.log(that.data.questions)
            },
            fail: function () {
                if (params.continued || "") {
                    var n = wx.getStorageSync("exam_allfen" + that.data.category_id);
                    n && that.setData({
                        allfen: 1 * n
                    });
                    var s = wx.getStorageSync(rParam + "ids" + that.data.category_id);
                    console.log(s)
                    that.ind_to_data(s), setTimeout(function () {
                        wx.hideLoading();
                    }, 1e3);
                } else {
                    wx.getStorage({
                        key: mode + "" + that.data.category_id,
                        success: function (t) {
                            that.setData({
                                StorageAll: t.data
                            })
                        },
                        complete: function () {
                            if (params.timeback) {
                                var ids = wx.getStorageSync(rParam + "ids" + that.data.category_id)
                                that.ind_to_data(ids);
                            } else {
                                that.ind_to_data(that.data.question_ids);
                            }

                            setTimeout(function () {
                                wx.hideLoading();
                            }, 1e3);
                        }
                    })
                }
            }
        })
    },

    ind_to_data(t) {
        var that = this;
        for (var questions = question_js.getQuestionsByIds(t), i = 0; i < questions.length; i++)
            if (questions[i].answerArr = questions[i].answer.split(""), that.data.StorageAll[questions[i].id]) {
                var question_d = that.data.StorageAll[questions[i].id];
                console.log(question_d)
                "1" == question_d.subup || "0" == question_d.after ? questions[i].order = question_d : "2" == questions[i].type && (questions[i].order = {},
                    questions.order.subup = 0, questions[i].order.down = {
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
            } else "2" == questions[i].type && (questions[i].order = {}, questions[i].order.subup = 0, questions[i].order.down = {
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
        mode = questions, that.setData({
            idarr: t,
            questions: questions.slice(0, 3)
        }), console.log(that.data.questions), wx.setStorage({
            key: rParam + "ids" + that.data.category_id,
            data: t
        }), that.getthree();
    },

    getthree() {
        var that = this;
        wx.getStorage({
            key: rParam + "ind" + that.data.category_id,
            success: function (e) {
                var a = {
                    currentTarget: {
                        dataset: {
                            index: e.data
                        }
                    }
                };
                that.jumpToQuestion(a)
            },
            fail: function () {
                var e = {
                    currentTarget: {
                        dataset: {
                            index: 0
                        }
                    }
                };
                that.jumpToQuestion(e)
            }
        }), wx.getStorage({
            key: rParam + "" + that.data.category_id,
            success: function (e) {
                if (e.data) {
                    var orderPX = that.data.orderPX;
                    orderPX[that.data.idarr[e.data]] = "blue", that.setData({
                        orderPX: orderPX,
                        recmend: !0
                    }), that.questionStatus(), setTimeout(function () {
                        that.setData({
                            recmend: !1
                        });
                    }, 2e3)
                }
            }
        })
    },

    jumpToQuestion(t) {
        var that = this,
            orderPX = that.data.orderPX;
        for (var r in orderPX) "blue" == orderPX[r] && (orderPX[r] = "");
        that.setData({
            orderPX: orderPX,
            iconInd: !1,
            iconIndtwo: !1,
            videoctrl: !0
        })
        var color = t.currentTarget.dataset.color;
        if ("red" != color && "green" != color) {
            var i = that.data.orderPX;
            i[t.currentTarget.dataset.id] = "blue", that.setData({
                orderPX: i
            })
        }

        var d_index = t.currentTarget.dataset.index;
        that.data.indexInd = d_index;
        var o = [];
        1 == this.data.current ? (that.data.indexInd <= 0 ? o.push(mode[mode.length - 1]) : o.push(mode[that.data.indexInd - 1]),
            o.push(mode[that.data.indexInd]), that.data.indexInd >= mode.length - 1 ? o.push(mode[0]) : o.push(mode[mode.length - 1])) : 0 == that.data.current ? (o.push(mode[that.data.indexInd]),
                that.data.indexInd == mode.length - 1 ? (o.push(mode[0]), o.push(mode[1])) : that.data.indexInd == mode.length - 2 ? (o.push(mode[that.data.indexInd + 1]),
                    o.push(mode[0])) : (o.push(mode[that.data.indexInd + 1]), o.push(mode[that.data.indexInd + 2]))) : (0 == that.data.indexInd ? (o.push(mode[mode.length - 2]),
                        o.push(mode[mode.length - 1])) : 1 == that.data.indexInd ? (o.push(mode[mode.length - 1]), o.push(mode[0])) : (o.push(mode[that.data.indexInd - 2]),
                            o.push(mode[that.data.indexInd - 1])), o.push(mode[that.data.indexInd])), this.setData({
                                questions: o,
                                indexInd: d_index
                            })
        console.log(o)
    },

    //关闭提示
    closeNotice() {
        this.setData({
            notice: !this.data.notice
        })
        this.timeServal(this.data.time, 0);
    },
    //倒计时
    timeServal(t = 0, a = 0) {
        console.log(1)
        var that = this
        if (!this.data.timeback) {
            if (0 != t || 0 != a) {
                var e = t;
                var that = this;
                var timer = setInterval(function () {
                    a < 10 ? that.setData({
                        times: e + ":0" + a,
                        ytimes: t - e + ":" + (59 - a)
                    }) : that.setData({
                        times: e + ":" + a,
                        ytimes: t - e + ":" + (59 - a)
                    }), --a < 0 && (e > 0 ? (a = 59, e--) : (a = 0, e = 0, that.setData({
                        startTimeind: !0
                    }), clearInterval(timer)));
                }, 1e3)
                that.setData({
                    timer: timer
                })
            } else {
                this.setData({
                    times: 0,
                    startTimeind: !0
                });
            }
        }

    },

    selectAnswer(t) {
        function e_question() {
            if (i = that.data.idarr[s_indexInd], s_indexInd < that.data.idarr.length - 1) {
                if ("green" != that.data.orderPX[i] && "red" != that.data.orderPX[i]) {
                    wx.setStorage({
                        key: rParam + "ind" + that.data.category_id,
                        data: s_indexInd
                    })
                    var orderPX = that.data.orderPX;
                    for (var n in orderPX) "blue" == orderPX[n] && (orderPX[n] = "");
                    return orderPX[i] = "blue", void that.setData({
                        orderPX: orderPX
                    });
                }
                s_indexInd++, e_question();
            } else wx.setStorage({
                key: rParam + "ind" + that.data.category_id,
                data: that.data.idarr.length - 1
            })
        }
        var that = this,
            s_indexInd = that.data.indexInd + 1,
            i = that.data.idarr[s_indexInd];
        if (e_question(), (1 == that.data.model && !that.data.timeback)) {
            var question_d = mode,
                questions = that.data.questions;
            question_d[that.data.indexInd].order = {
                after: 0,
                downAnswer: t.currentTarget.dataset.ind,
                answer: t.currentTarget.dataset.answer,
                type: t.currentTarget.dataset.type
            },
                question_d[that.data.current].order = {
                    after: 0,
                    downAnswer: t.currentTarget.dataset.ind,
                    answer: t.currentTarget.dataset.answer,
                    type: t.currentTarget.dataset.type
                }, mode = question_d, that.setData({
                    questions: questions
                });
            var u = that.data.StorageAll;
            u[t.currentTarget.dataset.id] = {
                after: 0,
                downAnswer: t.currentTarget.dataset.ind,
                answer: t.currentTarget.dataset.answer,
                type: t.currentTarget.dataset.type
            }, wx.setStorage({
                key: rParam + "" + that.data.category_id,
                data: u
            }), that.setData({
                StorageAll: u
            });
            var allNum = that.data.allNum;
            if (allNum++, t.currentTarget.dataset.ind == t.currentTarget.dataset.answer) {
                var l = that.data.orderPX;
                l[t.currentTarget.dataset.id] = "green", l.all = allNum
                // wx.setStorage({
                //     key: rParam + "list" + that.data.category_id,
                //     data: l
                // });
                wx.setStorageSync(rParam + "list" + that.data.category_id, l)
                var green = that.data.greenNum;
                green++, that.setData({
                    greenNum: green,
                    allNum: allNum
                });
            } else if (t.currentTarget.dataset.ind != t.currentTarget.dataset.answer) {
                //getApp().setIdsStroage("errorids", that.data.category_id, "1", questions[that.data.current].id.toString());
                var orderPX = that.data.orderPX;
                orderPX[t.currentTarget.dataset.id] = "green", orderPX.all = allNum;
                // wx.setStorage({
                //     key: rParam + "list" + that.data.category_id,
                //     data: orderPX
                // });
                wx.setStorageSync(rParam + "list" + that.data.category_id, orderPX)
                var red = that.data.redNum;
                red++, that.setData({
                    redNum: red,
                    allNum: allNum
                });
            }
            that.questionStatus(), that.data.indexInd < mode.length - 1 ? that.autoPlay() : setTimeout(function () {
                that.data.indexInd != mode.length - 1 || 1 * that.data.greenNum + 1 * that.data.redNum != mode.length ? (that.data.indexInd == mode.length - 1 && that.handexam()) : '';
            }, 600)
        }
    },
    selectAnswerMore: function (t) {
        var e = this;
        //if ("1" != e.data.questions[e.data.current].order.subup) {
        if (this.data.model == 1 && !this.data.timeback) {
            var a = e.data.StorageAll,
                n = e.data.moreArr;
            n[t.currentTarget.dataset.ind] ? n[t.currentTarget.dataset.ind] = !1 : n[t.currentTarget.dataset.ind] = !0,
                a[t.currentTarget.dataset.id] = {
                    subup: 0,
                    down: n
                }, e.setData({
                    moreArr: n
                }), wx.setStorage({
                    key: rParam + "" + e.data.category_id,
                    data: a
                }), wx.getStorage({
                    key: rParam + "" + e.data.category_id,
                    success: function (t) {
                        e.setData({
                            StorageAll: t.data
                        });
                    }
                });
            var s = e.data.questions;
            s[e.data.current].order = a[t.currentTarget.dataset.id],
                e.setData({
                    questions: s
                });
        }

        //}
    },

    moreSelectSub: function (t) {
        function e_question() {
            if (i = that.data.idarr[s_indexInd], s_indexInd < that.data.idarr.length - 1) {
                console.log("true");
                if ("green" != that.data.orderPX[i] && "red" != that.data.orderPX[i]) {
                    wx.setStorage({
                        key: rParam + "ind" + that.data.category_id,
                        data: s_indexInd
                    });
                    var orderPX = that.data.orderPX;
                    for (var n in orderPX) "blue" == orderPX[n] && (orderPX[n] = "");
                    return orderPX[i] = "blue", that.setData({
                        orderPX: orderPX
                    })
                }
                s_indexInd++, e_question();
            } else console.log("false"), wx.setStorage({
                key: rParam + "ind" + that.data.category_id,
                data: that.data.idarr.length - 1
            });
        }
        var that = this,
            s_indexInd = that.data.indexInd + 1,
            i = that.data.idarr[s_indexInd];
        //that.storageTraining_qids(mode[that.data.indexInd].id), e_question();
        e_question();
        var all = that.data.StorageAll,
            moreArr = that.data.moreArr;
        var g = 0;
        var downAnswer = "";
        for (var v in that.data.moreArr) {
            if (that.data.moreArr[v]) {
                g++;
                downAnswer += v
            }
        }
        if (g == 0) {
            Toast.fail('请选择答案');
            return false;
        }
        all[t.currentTarget.dataset.id] = {
            subup: 1,
            down: moreArr,
            type: t.currentTarget.dataset.type,
            answer: t.currentTarget.dataset.answer,
            downAnswer: downAnswer
        }, that.setData({
            StorageAll: all
        }), wx.setStorage({
            key: rParam + "" + that.data.category_id,
            data: all
        });
        var questions = that.data.questions,
            c = mode;
        c[that.data.indexInd].order = {
            subup: 1,
            down: moreArr,
            type: t.currentTarget.dataset.type,
            answer: t.currentTarget.dataset.answer,
            downAnswer: downAnswer
        }, questions[that.data.current].order = {
            subup: 1,
            down: moreArr,
            type: t.currentTarget.dataset.type,
            answer: t.currentTarget.dataset.answer,
            downAnswer: downAnswer
        }, mode = c, that.setData({
            questions: questions
        })
        var allNum = that.data.allNum;
        if (allNum++, g == t.currentTarget.dataset.answer.length && downAnswer == t.currentTarget.dataset.answer) {
            var f = that.data.orderPX;
            f[t.currentTarget.dataset.id] = "green", f.all = allNum;
            // wx.setStorage({
            //     key: rParam + "list" + that.data.category_id,
            //     data: f
            // });
            wx.setStorageSync(rParam + "list" + that.data.category_id, f)
            var green = that.data.greenNum;
            green++, that.setData({
                greenNum: green,
                allNum: allNum
            }), that.questionStatus();
        } else {
            //getApp().setIdsStroage("errorids", that.data.category_id,"1",questions[that.data.current].id.toString());
            var f = that.data.orderPX;
            f[t.currentTarget.dataset.id] = "green", f.all = allNum;
            // wx.setStorage({
            //     key: rParam + "list" + that.data.category_id,
            //     data: f
            // })
            wx.setStorageSync(rParam + "list" + that.data.category_id, f)
            var redNum = that.data.redNum;
            redNum++, that.setData({
                redNum: redNum,
                allNum: allNum
            }), that.questionStatus();
        }
        that.data.indexInd < mode.length - 1 ? that.autoPlay() : setTimeout(function () {
            that.data.indexInd != mode.length - 1 || 1 * that.data.greenNum + 1 * that.data.redNum != mode.length ? (that.data.indexInd == mode.length - 1 && that.handexam()) : '';
        }, 600), that.setData({
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
        }), setTimeout(function () {
            that.data.indexInd != mode.length - 1 || 1 * that.data.greenNum + 1 * that.data.redNum != mode.length ? that.data.indexInd == mode.length && that.handexam() : '';
        }, 600);
    },
    fillSub: function (params) {
        if (params.detail.value.subAnswer == '') {
            Toast.fail('请输入答案');
            return false;
        }

        function acet() {
            console.log(rParam)
            if (opar = that.data.idarr[index_ind], index_ind < that.data.idarr.length - 1) {
                if ("green" != that.data.orderPX[opar] && "red" != that.data.orderPX[opar]) {
                    wx.setStorage({
                        key: rParam + "ind" + that.data.category_id,
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
                key: rParam + "ind" + that.data.category_id,
                data: that.data.idarr.length - 1
            })
        }

        var that = this
        var index_ind = that.data.indexInd + 1;
        var opar = that.data.idarr[index_ind];
        if (acet(), (1 == that.data.model && !that.data.timeback)) {
            var u = mode
            var l = that.data.questions;
            // if(that.data.StorageAll[that.data.idarr[that.data.indexInd]]) l[that.data.current].order = that.data.StorageAll[that.data.idarr[that.data.indexInd]],
            //   that.setData({
            //     questions:l
            //   });
            // else{
            u[that.data.indexInd].order = {
                type: 4,
                downAnswer: params.detail.value.subAnswer,
                answer: params.detail.value.answer,
                subup: 1
            }, l[that.data.current].order = {
                type: 4,
                downAnswer: params.detail.value.subAnswer,
                answer: params.detail.value.answer,
                subup: 1
            }, mode = u, that.setData({
                questions: l
            });
            var storage_c = that.data.StorageAll
            storage_c[params.detail.value.id] = {
                type: 4,
                downAnswer: params.detail.value.subAnswer,
                answer: params.detail.value.answer,
                subup: 1
            }, wx.setStorage({
                key: rParam + "" + that.data.category_id,
                data: storage_c
            }), that.setData({
                StorageAll: storage_c
            });
            var all = that.data.allNum
            if (all++, params.detail.value.subAnswer == params.detail.value.answer) {
                var orderPX_v = that.data.orderPX
                orderPX_v[params.detail.value.id] = "green", orderPX_v.all = all;
                // wx.setStorage({
                //     key: rParam + 'list' + that.data.category_id,
                //     data: orderPX_v
                // });
                wx.setStorageSync(rParam + 'list' + that.data.category_id, orderPX_v)
                var greenNum_h = that.data.greenNum;
                if (greenNum_h++, that.setData({
                    greenNum: greenNum_h
                }), that.data.indexInd < mode.length - 1) {
                    that.autoPlay();
                    var x = that.data.everyDay_all;
                    x++, that.setData({
                        everyDay_all: x,
                        allNum: all
                    })
                }
            } else if (params.detail.value.subAnswer != params.detail.value.answer) {
                console.log(l)
                //getApp().setIdsStroage("errorids", that.data.category_id, "1", l[that.data.current].id.toString())
                var orderPX_v = that.data.orderPX
                orderPX_v[params.detail.value.id] = "green", orderPX_v.all = all;
                // wx.setStorage({
                //     key: rParam + "list" + that.data.category_id,
                //     data: orderPX_v
                // });
                wx.setStorageSync(rParam + "list" + that.data.category_id, orderPX_v)
                var redNum_f = that.data.redNum;
                redNum_f++, that.setData({
                    redNum: redNum_f,
                    allNum: all
                })
                var p = that.data.everyDay_error;
                var x = that.data.everyDay_all;
                p++, x++, that.setData({
                    everyDay_error: p,
                    everyDay_all: x
                });
                that.autoPlay();
            }
            that.questionStatus();
            // }
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
        if (acet(), (1 == that.data.model && !that.data.timeback)) {
            var u = mode
            var l = that.data.questions;
            var arrAnswer = params.detail.value.answer.split(';');
            var arrFillAnswer = [];
            for (var i = 0; i < arrAnswer.length; i++) {
                arrFillAnswer.push(params.detail.value['subAnswer' + i]);
            }
            u[that.data.indexInd].order = {
                type: 5,
                downAnswer: arrFillAnswer.join(';'),
                answer: params.detail.value.answer,
                subup: 1,
                down: arrFillAnswer
            }, l[that.data.current].order = {
                type: 5,
                downAnswer: arrFillAnswer.join(';'),
                answer: params.detail.value.answer,
                subup: 1,
                down: arrFillAnswer
            }, mode = u, that.setData({
                questions: l
            });
            var storage_c = that.data.StorageAll
            storage_c[params.detail.value.id] = {
                type: 5,
                downAnswer: arrFillAnswer.join(';'),
                answer: params.detail.value.answer,
                subup: 1,
                down: arrFillAnswer
            }, wx.setStorage({
                key: rParam + "" + that.data.category_id,
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
            console.log('答案' + right_i)
            console.log('正确答案' + arrAnswer.length)
            if (all++, right_i == arrAnswer.length) {
                var orderPX_v = that.data.orderPX
                orderPX_v[params.detail.value.id] = "green", orderPX_v.all = all;
                // wx.setStorage({
                //     key: rParam + 'list' + that.data.category_id,
                //     data: orderPX_v
                // });
                wx.setStorageSync(rParam + 'list' + that.data.category_id, orderPX_v)
                var greenNum_h = that.data.greenNum;
                if (greenNum_h++, that.setData({
                    greenNum: greenNum_h
                }), that.data.indexInd < mode.length - 1) {
                    that.autoPlay();
                    var x = that.data.everyDay_all;
                    x++, that.setData({
                        everyDay_all: x,
                        allNum: all
                    })
                }
            } else if (right_i != arrAnswer.length) {
                var orderPX_v = that.data.orderPX
                orderPX_v[params.detail.value.id] = "green", orderPX_v.all = all;
                // wx.setStorage({
                //     key: rParam + "list" + that.data.category_id,
                //     data: orderPX_v
                // });
                wx.setStorageSync(rParam + "list" + that.data.category_id, orderPX_v)
                var redNum_f = that.data.redNum;
                redNum_f++, that.setData({
                    redNum: redNum_f,
                    allNum: all
                })
                var p = that.data.everyDay_error;
                var x = that.data.everyDay_all;
                p++, x++, that.setData({
                    everyDay_error: p,
                    everyDay_all: x
                });
                that.autoPlay();
            }
            that.questionStatus();
        }
    },
    storageTraining_qids(t) {
        var e = this.data.training_qids;
        e = e + "" + t + "," + wx.setStorage({
            key: "training_qids" + this.data.category_id,
            data: e,
        }), this.setData({
            training_qids: e
        });
        var a = this.data.intensify_qis;
        a.push(t), this.setData({
            intensify_qis: a
        }), wx.setStorage({
            key: "intensify_qis" + this.data.category_id,
            data: a,
        });
    },

    storageokids(t) {
        var e = this.data.intensify_okids;
        if (e.indexOf(t) == -1) {
            e.push(t), this.setData({
                intensify_okids: e
            }), wx.setStorage({
                key: "intensify_okids" + this.data.category_id,
                data: e
            })
        }
    },

    storagenoids(t) {
        var e = this.data.intensify_eids;
        if (e.indexOf(t) == -1) {
            e.push(t), this.setData({
                intensify_eids: e
            }), wx.setStorage({
                key: "intensify_noids" + this.data.category_id,
                data: e
            })
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
    handexam() { },
    autoPlay() {
        if (this.data.finishAutoNext) {
            this.setData({
                autoplay: !0
            });
        }
    },
    pageChange(t) {
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
        var a_current = that.data.current,
            r_current = t.detail.current,
            s_indexInd = that.data.indexInd,
            i = 1 * r_current - 1 * a_current;
        if (-2 == i ? i = 1 : 2 == i && (i = -1), (s_indexInd += i) >= mode.length) return s_indexInd = 0, wx.showToast({
            title: "已经是最后一题"
        }), void that.setData({
            xiejie: !1,
            current: 2
        });
        if (s_indexInd < 0) return wx.showToast({
            title: '已经是第一题'
        }), that.setData({
            xiejie: !1,
            current: 0
        }), void (s_indexInd = mode.length - 1);
        var d_question = [];
        0 == r_current ? (d_question.push(mode[s_indexInd]), d_question.push(mode[s_indexInd + 1]), d_question.push(mode[s_indexInd - 1]), d_question[1] || (d_question[1] = mode[0]),
            d_question[2] || (d_question[2] = mode[mode.length - 1])) : 1 == r_current ? (d_question.push(mode[s_indexInd - 1]), d_question.push(mode[s_indexInd]), d_question.push(mode[s_indexInd + 1]),
                d_question[2] || (d_question[2] = mode[0]), d_question[0] || (d_question[0] = mode[mode.length - 1])) : 2 == r_current && (d_question.push(mode[s_indexInd + 1]),
                    d_question.push(mode[s_indexInd - 1]), d_question.push(mode[s_indexInd]), d_question[0] || (d_question[0] = mode[0]), d_question[1] || (d_question[1] = mode[mode.length - 1]));
        var that = this;
        that.setData({
            questions: d_question,
            indexInd: s_indexInd,
            current: r_current
        })
    },
    submit() {
        var that = this;
        clearInterval(this.data.timer);
        var length = this.data.idarr.length;
        var submit = wx.getStorageSync(rParam + that.data.category_id);
        var submitCount = 0;
        if (submit) {
            var arr = Object.keys(submit);
            submitCount = arr.length
        }
        console.log(submitCount)
        wx.showModal({
            title: "温馨提示",
            content: length - submitCount > 0 ? "你还有" + (length - submitCount) + "道题未做，确定要交卷吗？" : "你已经答完所有的题了，赶快交卷吧",
            success: function (e) {
                if (e.confirm) {
                    that.newUp_exam();
                } else {
                    var time = that.data.times.split(":")
                    that.timeServal(time[0], time[1]);
                }
            }
        });
        // Dialog.confirm({
        //         title: '确定交卷吗？'
        //     })
        //     .then(() => {
        //         that.newUp_exam();
        //     })
        //     .catch(() => {
        //         var time = that.data.times.split(":")
        //         that.timeServal(time[0], time[1]);
        //     });
    },
    newUp_exam() {
        console.log('new')
        var that = this
        this.setData({
            startTimeind: !1
        })
        var ids = wx.getStorageSync(rParam + 'ids' + that.data.category_id).join(',');
        var record = {};
        wx.getStorage({
            key: rParam + "" + that.data.category_id,
            success: function (e) {
                var greenNum = 0,
                    redNum = 0,
                    allfen = 0;
                for (var i in e.data) {
                    var v = e.data[i];
                    if (e.data[i].downAnswer) {
                        record[i] = { 'answer': e.data[i].answer, 'downAnswer': e.data[i].downAnswer, 'type': e.data[i].type };
                    } else {
                        record[i] = { 'answer': e.data[i].answer, 'downAnswer': '', 'type': e.data[i].type };
                    }
                    switch (v.type) {
                        case 1: //单选
                            if (v.downAnswer == v.answer) {
                                greenNum++;
                                allfen += that.data.categoryDetail.r_score
                            } else {
                                redNum++;
                            }
                            break;
                        case 2: //多选
                            var downAnswer = "";//选择的答案
                            var arrRightAnswer = v.answer.split('');//正确答案数组
                            var downRightAnswerLength = 0;//选择的正确答案个数
                            var rightAnswerLength = arrRightAnswer.length; //正确答案个数
                            var isWrong = false;
                            for (var a in v.down) {
                                if (v.down[a]) {
                                    downAnswer += a
                                    if (arrRightAnswer.indexOf(a) > -1) {
                                        downRightAnswerLength++;
                                    } else {
                                        isWrong = true;
                                    }
                                }
                            }
                            var downAnswerLength = downAnswer.length;//选择的答案个数
                            if (that.data.categoryDetail.multiple_score_mode === 1) {
                                //得分模式：全部选对才得分
                                if (downAnswer == v.answer) {
                                    greenNum++;
                                    allfen += that.data.categoryDetail.m_score
                                } else {
                                    redNum++;
                                }
                            } else {
                                //得分模式：漏选得分
                                if (downAnswerLength == rightAnswerLength && downRightAnswerLength == rightAnswerLength) {
                                    //正确
                                    greenNum++;
                                    allfen += that.data.categoryDetail.m_score
                                } else if (isWrong) {
                                    //错误
                                    redNum++;
                                } else {
                                    //漏选
                                    allfen += that.data.categoryDetail.multiple_miss;
                                    redNum++;
                                }
                            }
                            break;
                        case 3: //判断
                            if (v.downAnswer == v.answer) {
                                greenNum++;
                                allfen += that.data.categoryDetail.j_score
                            } else {
                                redNum++;
                            }
                            break;
                        case 4: //单项填空
                            if (v.answer == v.downAnswer) {
                                greenNum++;
                                allfen += that.data.categoryDetail.f_score
                            } else {
                                redNum++;
                            }
                            break;
                        case 5: //多项填空
                            var arrRightAnswer = v.answer.split(';');
                            var arrFillAnswer = v.downAnswer.split(';');
                            var rightLength = 0;
                            for (var k = 0; k < arrRightAnswer.length; k++) {
                                if (arrRightAnswer[k] == arrFillAnswer[k]) {
                                    rightLength++;
                                }
                            }
                            if (that.data.categoryDetail.fill_score_mode === 1) {
                                //得分模式：全部填写正确
                                if (rightLength === arrRightAnswer.length) {
                                    greenNum++;
                                    allfen += that.data.categoryDetail.more_score;
                                } else {
                                    redNum++;
                                }
                            } else if (that.data.categoryDetail.fill_score_mode === 2) {
                                //得分模式：按空格平均分
                                if (rightLength === arrRightAnswer.length) {
                                    greenNum++;
                                    allfen += that.data.categoryDetail.more_score;
                                } else if (rightLength === 0) {
                                    redNum++;
                                } else {
                                    redNum++;
                                    allfen += parseFloat((that.data.categoryDetail.more_score / arrRightAnswer.length).toFixed(1))
                                }
                            } else {
                                //得分模式：答对部分得分
                                if (rightLength === arrRightAnswer.length) {
                                    greenNum++;
                                    allfen += that.data.categoryDetail.more_score;
                                } else if (rightLength === 0) {
                                    redNum++;
                                } else {
                                    redNum++;
                                    allfen += that.data.categoryDetail.fill_miss;
                                }
                            }
                            break;
                        default:
                            break;
                    }
                }
                // var t = 2 * (parseInt(that.data.allNum / that.data.nums * 100) / 100) + 1.5;
                // t < 1.6 && 0 != that.data.allNum && (t = 1.6), console.log(that.data.allNum);
                // console.log(that.data.nums);
                // console.log(allfen);
                // var e = {
                //     statusType: 1,
                //     statusColor: allfen > that.data.pass ? '#46C6BA' : "#ff4f42",
                //     statusBg: "#ffe3e1",
                //     statusPlan: t,
                //     statusError: redNum,
                //     statusRight: greenNum,
                //     statusAnswer: that.data.nums - redNum - greenNum,
                //     statusScore: allfen,
                //     statusPassf: allfen > that.data.pass ? 1 : 0
                // };
                // that.setData({
                //     showStatus: !0,
                //     statusOptions: e
                // });
                var times = that.data.times.split(":");
                var min = (parseInt(that.data.time) - (parseInt(times[0]) + 1));
                var sec = (60 - parseInt(times[1]))
                var use_time = min * 60 + sec
                var userInfo = wx.getStorageSync('userInfo');
                var params = { 'uid': userInfo.uid, 'score': allfen, 'category_id': that.data.category_id, 'use_time': use_time, 'record': record, 'question_id': ids };
                wx.Apis.api.saveExamRecord(params, (code, data) => {
                    if (code == 200) {
                        that.clear_storage();
                        var use_time = (min > 9 ? min.toString() : '0' + min.toString()) + ":" + (sec > 9 ? sec.toString() : '0' + sec.toString())
                        var rightP = (greenNum / that.data.nums * 100).toFixed(2)
                        wx.redirectTo({
                            url: '/pages/result/result?id=' + that.data.category_id + '&record=' + data.id + '&title=' + that.data.categoryDetail.name + '&score=' + allfen + '&time=' + use_time + '&green=' + greenNum + '&right=' + rightP
                        })
                    } else {
                        Toast.fail('提交失败');
                        return false;
                    }
                });
            }
        })
    },
    status_choose_btn: function (t) {
        var that = this;
        if (t.detail.msg == "again") {
            //重新考试
            this.clear_storage();
            wx.redirectTo({
                url: '/pages/exam/exam?id=' + this.data.category_id,
            })
        } else {
            //查看考试结果
            wx.setStorage({
                key: rParam + "all" + that.data.category_id,
                data: mode
            })
            wx.redirectTo({
                url: '/pages/exam/exam?id=' + this.data.category_id + '&timeback=1',
            })
        }
    },
    clear_storage() {
        wx.removeStorage({
            key: rParam + this.data.category_id
        })
        wx.removeStorage({
            key: rParam + 'list' + this.data.category_id
        })
        wx.removeStorage({
            key: rParam + 'ind' + this.data.category_id
        })
        wx.removeStorage({
            key: rParam + 'ids' + this.data.category_id
        })
        wx.removeStorage({
            key: rParam + 'all' + this.data.category_id
        })
        wx.removeStorage({
            key: rParam + 'all' + this.data.category_id
        })
        wx.removeStorage({
            key: rParam + 'times' + this.data.category_id
        })
    },
    questionStatus() {
        var that = this;
        wx.getStorage({
            key: rParam + "list" + that.data.category_id,
            success: function (e) {
                that.setData({
                    orderPX: e.data,
                    allNum: e.data.all
                })
            }
        });
    },
    _updown: function () {
        this.setData({
            iconInd: !this.data.iconInd,
            iconIndtwo: !this.data.iconIndtwo,
        })
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
        if (fontSize) {
            this.setData({
                fontSize: fontSize
            })
        }
        var finishAutoNext = wx.getStorageSync('finishAutoNext')
        if (finishAutoNext !== '') {
            this.setData({
                finishAutoNext: finishAutoNext
            })
        }
    },

    initBgm() {
        if (wx.getStorageSync('music')) {
            this.bgm = wx.createInnerAudioContext()
            this.bgm.loop = true
            this.bgm.autoplay = false
            this.bgm.src = app.globalData.bgmUrl
            this.bgm.play()
        }
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {
        if (wx.getStorageSync('music')) {
            this.bgm.pause()
        }

        var myCategory = wx.getStorageSync('myCategory');
        var data = {
            'id': this.data.category_id,
            'name': this.data.categoryDetail.name,
            'date': getNowDate(),
            'q_update_time': this.data.q_update_time
        };
        if (myCategory) {
            for (var i = 0; i < myCategory.length; i++) {
                if (myCategory[i]['id'] == this.data.category_id) {
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
            title: "研题帮，考试助手 ！",
            path: "pages/index/index",
            imageUrl: "/images/share.png"
        };
    }
})