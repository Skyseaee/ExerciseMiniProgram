// pages/errorstar/errorstar.js
import Toast from '../../dist/toast/toast';
import Dialog from '../../dist/dialog/dialog';
var question_js = require('../../utils/question.js');
var e_param = []; //e
var a_param = ""; //a
var r_param = ""; //r
var s_param = ""; //s
var model = "";
var app = getApp();
import {playAudio} from '../../utils/util';
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
        indexInd: 0,
        current: 0,
        textTab: "答题模式",
        selectInd: !0,
        testMode: !1,
        everyDay_all: 0,
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
        mode: "1",
        idarr: [],
        questions: [],
        iconcircle: [],
        collectData: [],
        starshow: !0,
        del_chapter_id: 'all',
        delarr: [],
        fontSize: '32rpx',
        rightAutoNext: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(t) {
        var that = this;
        t.mode == 4 ? (r_param = "收藏夹", model = "star") : (r_param = "错题集", model = "error");
        wx.setNavigationBarTitle({
            title: r_param
        })
        var ids = wx.getStorageSync(model + 'ids' + t.id)[0][t.id]
        console.log(ids)
        s_param = t.id
        t.mode == 4 ? (
            a_param = "z全部收藏z",
            wx.getStorage({
                key: model + 'ids' + t.id,
                success: function (params) {
                    that.setData({
                        collectData: params.data
                    })
                }
            }),
            console.log(a_param)
        ) : (
            a_param = "z全部错题z",
            wx.getStorage({
                key: model + 'ids' + t.id,
                success: function (params) {
                    that.setData({
                        collectData: params.data
                    })
                }
            })
        );
        that.setData({
            mode: t.mode,
            category: t.id,
            idarr: ids,
            ids: ids.join(','),
            iconcircle: [{
                title: "",
                question_ids: ids,
                len: 0
            }]
        }), that.getMsg();

        this.initBgm();
    },

    getMsg() {
        for (var a = this, r = question_js.getQuestionsByIds(a.data.ids), n = 0; n < r.length; n++)
            if (r[n].answerArr = r[n].answer.split(""),
                a.data.StorageAll[r[n].id]) {
                var d = a.data.StorageAll[r[n].id];
                "1" == d.subup || "0" == d.after ? r[n].order = d : ((r[n].order = {},
                    r[n].order.subup = 0, r[n].order.down = {
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
            } else(r[n].order = {}, r[n].order.subup = 0, r[n].order.down = {
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
        e_param = r, a.getthree();
    },

    getthree() {
        var t = this,
            e = {
                currentTarget: {
                    dataset: {
                        index: 0
                    }
                }
            };
        t.jumpToQuestion(e);
    },

    jumpToQuestion(t) {
        var a = this,
            r = a.data.orderPX;
        for (var n in r) "blue" == r[n] && (r[n] = "");
        this.setData({
            orderPX: r,
            iconInd: !1,
            iconIndtwo: !1
        });
        var d = t.currentTarget.dataset.color;
        if ("red" != d && "green" != d) {
            var i = a.data.orderPX;
            i[t.currentTarget.dataset.id] = "blue", a.setData({
                orderPX: i
            });
        }
        var s = t.currentTarget.dataset.index;
        a.data.indexInd = s;
        var o = [];
        1 == this.data.current ? (a.data.indexInd <= 0 ? o.push(e_param[e_param.length - 1]) : o.push(e_param[a.data.indexInd - 1]),
            o.push(e_param[a.data.indexInd]), a.data.indexInd >= e_param.length - 1 ? o.push(e_param[0]) : o.push(e_param[e_param.length - 1])) : 0 == this.data.current ? (o.push(e_param[a.data.indexInd]),
            a.data.indexInd == e_param.length - 1 ? (o.push(e_param[0]), o.push(e_param[1])) : a.data.indexInd == e_param.length - 2 ? (o.push(e_param[a.data.indexInd + 1]),
                o.push(e_param[0])) : (o.push(e_param[a.data.indexInd + 1]), o.push(e_param[a.data.indexInd + 2]))) : (0 == a.data.indexInd ? (o.push(e_param[e_param.length - 2]),
            o.push(e_param[e_param.length - 1])) : 1 == a.data.indexInd ? (o.push(e_param[e_param.length - 1]), o.push(e_param[0])) : (o.push(e_param[a.data.indexInd - 2]),
            o.push(e_param[a.data.indexInd - 1])), o.push(e_param[a.data.indexInd])), this.setData({
            questions: o,
            indexInd: s
        }), this.infoshow(e_param[s].id)
        console.log(this.data.questions)
    },

    starcollect() {
        this.setData({
            starshow: !this.data.starshow
        });
        var t = this.data.delarr,
            e = this.data.idarr;
        this.data.starshow ? t.indexOf(e[this.data.indexInd]) > -1 && t.splice(t.indexOf(e[this.data.indexInd]), 1) : t.push(e[this.data.indexInd]),
            this.setData({
                delarr: t
            }), wx.setStorage({
                key: "delstar" + this.data.category,
                data: t
            });
    },

    infoshow(t) {
        this.data.delarr.indexOf(t) > -1 ? this.setData({
            starshow: !1
        }) : this.setData({
            starshow: !0
        });
    },

    closeNotice() {
        this.setData({
            notice: !this.data.notice
        })
    },

    _updown() {
        this.setData({
            iconInd: !this.data.iconInd,
            iconIndtwo: !this.data.iconIndtwo,
        })
    },

    selectAnswer(t) {
        function r() {
            if (i = n.data.idarr[0], d < n.data.idarr.length - 1) {
                if ("green" != n.data.orderPX[i] && "red" != n.data.orderPX[i]) {
                    wx.setStorage({
                        key: a_param + "ind" + n.data.category,
                        data: d
                    });
                    var t = n.data.orderPX;
                    for (var e in t) "blue" == t[e] && (t[e] = "");
                    return t[i] = "blue", n.setData({
                        orderPX: t
                    }), void console.log(n.data.orderPX);
                }
                d++, r();
            } else wx.setStorage({
                key: a_param + "ind" + n.data.category,
                data: n.data.idarr.length - 1
            })
        }
        var n = this,
            d = n.data.indexInd + 1,
            i = n.data.idarr[d];
        if (r(), (4 == n.data.mode || 5 == n.data.mode)) {
            var s = e_param,
                o = n.data.questions;
            if (n.data.StorageAll[n.data.idarr[n.data.indexInd]]) o[n.data.current].order = n.data.StorageAll[n.data.idarr[n.data.indexInd]],
                n.setData({
                    questions: o
                });
            else {
                s[n.data.indexInd].order = {
                    after: 0,
                    downAnswer: t.currentTarget.dataset.ind,
                    answer: t.currentTarget.dataset.answer
                }, o[n.data.current].order = {
                    after: 0,
                    downAnswer: t.currentTarget.dataset.ind,
                    answer: t.currentTarget.dataset.answer
                }, e_param = s, n.setData({
                    questions: o
                });
                var u = n.data.StorageAll;
                u[t.currentTarget.dataset.id] = {
                    after: 0,
                    downAnswer: t.currentTarget.dataset.ind,
                    answer: t.currentTarget.dataset.answer
                }, wx.setStorage({
                    key: a_param + "" + n.data.category,
                    data: u
                }), n.setData({
                    StorageAll: u
                });
                var c = n.data.allNum;
                //判断
                if (c++, t.currentTarget.dataset.ind == t.currentTarget.dataset.answer) {
                    playAudio(CORRECT_AUDIO);
                    var h = n.data.orderPX
                    h[t.currentTarget.dataset.id] = "green", h.all = c;
                    // wx.setStorage({
                    //     key: a_param + "list" + n.data.category,
                    //     data: h
                    // });
                    wx.setStorageSync(a_param + "list" + n.data.category, h)
                    var l = n.data.greenNum;
                    l++, n.setData({
                        greenNum: l
                    });
                    var g = wx.getStorageSync("rightRemove");
                    console.log(g)
                    g ? (n.delCollect(), n.data.indexInd < e_param.length - 1 && 0 !== n.data.indexInd && n.autoPlay()) : n.data.indexInd < e_param.length - 1 && n.autoPlay();
                } else if (t.currentTarget.dataset.ind != t.currentTarget.dataset.answer) {
                    playAudio(WRONG_AUDIO);
                    var h = n.data.orderPX;
                    h[t.currentTarget.dataset.id] = "red", h.all = c;
                    // wx.setStorage({
                    //     key: a_param + "list" + n.data.category,
                    //     data: h
                    // });
                    wx.setStorageSync(a_param + "list" + n.data.category, h)
                    var p = n.data.redNum;
                    p++, n.setData({
                        redNum: p
                    });

                }
                n.questionStatus();
            }
        }
    },

    selectAnswerMore(t) {
        var e = this;
        if ("1" != e.data.questions[e.data.current].order.subup) {
            var r = e.data.StorageAll,
                n = e.data.moreArr;
            n[t.currentTarget.dataset.ind] ? n[t.currentTarget.dataset.ind] = !1 : n[t.currentTarget.dataset.ind] = !0,
                r[t.currentTarget.dataset.id] = {
                    subup: 0,
                    down: n
                }, e.setData({
                    moreArr: n
                }), wx.setStorage({
                    key: a_param + "" + this.data.category,
                    data: r
                }), wx.getStorage({
                    key: a_param + "" + this.data.category,
                    success: function (t) {
                        e.setData({
                            StorageAll: t.data
                        });
                    }
                });
            var d = e.data.questions;
            d[e.data.current].order = r[t.currentTarget.dataset.id],
                e.setData({
                    questions: d
                });
        }
    },

    moreSelectSub(t) {
        function r() {
            if (i = n.data.idarr[d], d < n.data.idarr.length - 1) {
                if ("green" != n.data.orderPX[i] && "red" != n.data.orderPX[i]) {
                    wx.setStorage({
                        key: a_param + "ind" + n.data.category,
                        data: d
                    });
                    var t = n.data.orderPX;
                    for (var e in t) "blue" == t[e] && (t[e] = "");
                    return t[i] = "blue", n.setData({
                        orderPX: t
                    }), void console.log(n.data.orderPX);
                }
                d++, r();
            } else wx.setStorage({
                key: a_param + "ind" + n.data.category,
                data: n.data.idarr.length - 1
            });
        }
        var n = this,
            d = n.data.indexInd + 1,
            i = n.data.idarr[d];
        r();
        var s = n.data.StorageAll,
            o = n.data.moreArr;
        var h = 0;
        var downAnswer = ""
        for (var v in n.data.moreArr) {
            if (n.data.moreArr[v]) {
                h++;
                downAnswer += v
            }
        }
        s[t.currentTarget.dataset.id] = {
            subup: 1,
            down: o,
            downAnswer: downAnswer
        }, console.log(s[t.currentTarget.dataset.id]), n.setData({
            StorageAll: s
        }), wx.setStorage({
            key: a_param + "" + n.data.category,
            data: s
        });
        var u = n.data.questions,
            c = e_param;
        c[n.data.indexInd].order = {
            subup: 1,
            down: o,
            downAnswer: downAnswer
        }, u[n.data.current].order = {
            subup: 1,
            down: o,
            downAnswer: downAnswer
        }, e_param = c, n.setData({
            questions: u
        });
        var l = 0;
        for (var g in n.data.moreArr) n.data.moreArr[g] && l++;
        var h = n.data.allNum;
        if (h++, l == t.currentTarget.dataset.answer.length && downAnswer == t.currentTarget.dataset.answer) {
            (x = n.data.orderPX)[t.currentTarget.dataset.id] = "green", x.all = h;
            // wx.setStorage({
            //     key: a_param + "list" + n.data.category,
            //     data: x
            // });
            wx.setStorageSync(a_param + "list" + n.data.category, x)
            playAudio(CORRECT_AUDIO);
            var p = n.data.greenNum;
            p++, n.setData({
                greenNum: p
            }), n.questionStatus(), n.data.indexInd < e_param.length - 1 && n.autoPlay();
        } else {
            var x = n.data.orderPX;
            x[t.currentTarget.dataset.id] = "red", x.all = h;
            // wx.setStorage({
            //     key: a_param + "list" + n.data.category,
            //     data: x
            // });
            wx.setStorageSync(a_param + "list" + n.data.category, x)
            playAudio(WRONG_AUDIO);
            var f = n.data.redNum;
            f++, n.setData({
                redNum: f
            }), n.questionStatus();
        }
        n.setData({
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

    fillSub:function(params){
        if(params.detail.value.subAnswer == ''){
          $Toast({
            content: '请输入答案'
          });
          return false;
        }
    
        function acet() {
          if(opar = that.data.idarr[index_ind], index_ind < that.data.idarr.length - 1){
            if("green" != that.data.orderPX[opar] && "red" != that.data.orderPX[opar]){
              wx.setStorage({
                key: a_param + "ind" + that.data.category,
                data: index_ind
              });
              var tar = that.data.orderPX;
              for(var r in tar) "blue" == tar[r] && (tar[r] = "");
              return tar[opar] = "blue",that.setData({
                orderPX: tar
              }), void console.log(that.data.orderPX); 
            }
            index_ind++, acet();
          }else wx.setStorage({
            key: a_param+"ind"+that.data.category,
            data:that.data.idarr.length - 1
          })
        }
        
        var that = this
        var index_ind = that.data.indexInd + 1;
        var opar = that.data.idarr[index_ind];
        if(acet(),(4 == that.data.mode || 5 == that.data.mode )){
          var u = e_param
          var l = that.data.questions;
          if(that.data.StorageAll[that.data.idarr[that.data.indexInd]]) l[that.data.current].order = that.data.StorageAll[that.data.idarr[that.data.indexInd]],
            that.setData({
              questions:l
            });
          else{
            u[that.data.indexInd].order = {
              after:0,
              downAnswer:params.detail.value.subAnswer,
              answer: params.detail.value.answer,
              subup:1
            }, l[that.data.current].order = {
              after: 0,
              downAnswer:params.detail.value.subAnswer,
              answer: params.detail.value.answer,
              subup:1
            }, e_param = u,that.setData({
              questions : l
            });
            var storage_c = that.data.StorageAll
            storage_c[params.detail.value.id] = {
              after: 0,
              downAnswer:params.detail.value.subAnswer,
              answer: params.detail.value.answer,
              subup:1
            }, wx.setStorage({
              key:a_param + "" + that.data.category,
              data: storage_c
            }), that.setData({
              StorageAll: storage_c
            });
            var all = that.data.allNum
            if(all++, params.detail.value.subAnswer == params.detail.value.answer){
              playAudio(CORRECT_AUDIO)
              var orderPX_v = that.data.orderPX
              orderPX_v[params.detail.value.id] = "green",orderPX_v.all = all;
            //   wx.setStorage({
            //     key: a_param + 'list' + that.data.category,
            //     data: orderPX_v
            //   });
              wx.setStorageSync(a_param + 'list' + that.data.category, orderPX_v)
              var greenNum_h = that.data.greenNum;
              if (greenNum_h++ , that.setData({
                greenNum: greenNum_h
              }),that.data.indexInd < e_param.length - 1){
                that.autoPlay();
                var x = that.data.everyDay_all;
                x++ , that.setData({
                  everyDay_all: x
                })
              }
            } else if( params.detail.value.subAnswer != params.detail.value.answer) {
              console.log(l)
              playAudio(WRONG_AUDIO)
              getApp().setIdsStroage("errorids", that.data.category, "1", l[that.data.current].id.toString())
              var orderPX_v = that.data.orderPX
              orderPX_v[params.detail.value.id] = "red", orderPX_v.all = all;
            //   wx.setStorage({
            //     key: a_param + "list" + that.data.category,
            //     data: orderPX_v
            //   });
              wx.setStorageSync(a_param + "list" + that.data.category, orderPX_v)
              var redNum_f = that.data.redNum;
              redNum_f++, that.setData({
                redNum:redNum_f
              })
              // var p = that.data.everyDay_error;
              // rParam += "," + params.detail.value.id;
              // var x = that.data.everyDay_all;
              // p++ , x++ , that.setData({
              //   everyDay_error: p,
              //   everyDay_all: x
              // });
            }
            that.questionStatus();
          }
        }
      },
    
    moreFillSub(params) {
    var arrAnswer = params.detail.value.answer.split('；');
    var null_i = 0;
    for (var i = 0; i < arrAnswer.length; i++) {
        if (params.detail.value['subAnswer' + i] == '') {
        null_i++;
        }
    }
    if (null_i == arrAnswer.length) {
        $Toast({
        content: '请输入答案'
        });
        return false;
    }

    function acet() {
        if (opar = that.data.idarr[index_ind], index_ind < that.data.idarr.length - 1) {
        if ("green" != that.data.orderPX[opar] && "red" != that.data.orderPX[opar]) {
            wx.setStorage({
            key: a_param + "ind" + that.data.category,
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
        key: a_param + "ind" + that.data.category,
        data: that.data.idarr.length - 1
        })
    }

    var that = this
    var index_ind = that.data.indexInd + 1;
    var opar = that.data.idarr[index_ind];
    if (acet(),(4 == that.data.mode || 5 == that.data.mode )) {
        var u = e_param
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
        }, e_param = u, that.setData({
            questions: l
        });
        var storage_c = that.data.StorageAll
        storage_c[params.detail.value.id] = {
            after: 0,
            downAnswer: arrFillAnswer.join(';'),
            answer: params.detail.value.answer,
            subup: 1
        }, wx.setStorage({
            key: a_param + "" + that.data.category,
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
            wx.setStorageSync(a_param + 'list' + that.data.category, orderPX_v)
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
            getApp().setIdsStroage("errorids", that.data.category, that.data.category, l[that.data.current].id.toString())
            var orderPX_v = that.data.orderPX
            orderPX_v[params.detail.value.id] = "red", orderPX_v.all = all;
            // wx.setStorage({
            //     key: mode + "list" + category_id,
            //     data: orderPX_v
            // });
            wx.setStorageSync(a_param + "list" + that.data.category, orderPX_v)
            var redNum_f = that.data.redNum;
            redNum_f++, that.setData({
            redNum: redNum_f
            })
        //   var p = that.data.everyDay_error;
        //   rParam += "," + params.detail.value.id;
        //   var x = that.data.everyDay_all;
        //   p++, x++, that.setData({
        //     everyDay_error: p,
        //     everyDay_all: x
        //   });
        }
        that.questionStatus();
        }
    }
    },  

    questionStatus() {
        var t = this;
        wx.getStorage({
            key: a_param + "list" + s_param,
            success: function (e) {
                t.setData({
                    orderPX: e.data,
                    allNum: e.data.all
                });
            }
        });
    },

    autoPlay() {
        console.log('auto')
        if(this.data.rightAutoNext){
            this.setData({
                autoplay: !0
            });
       }
    },

    pageChange(t) {
        "autoplay" == t.detail.source && this.setData({
            autoplay: !1
        });
        var a = this;
        a.setData({
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
        }), e_param.length < 3 ? a.setData({
            xiejie: !1
        }) : a.setData({
            xiejie: !0
        }), 1 == e_param.length && a.setData({
            xiejie: !1,
            current: 0
        });
        var r = this.data.current,
            n = t.detail.current,
            d = a.data.indexInd,
            i = 1 * n - 1 * r;
        if (-2 == i ? i = 1 : 2 == i && (i = -1), (d += i) >= e_param.length) return d = 0, wx.showToast({
            title: "已经是最后一题了"
        }), void a.setData({
            xiejie: !1,
            current: 2
        });
        if (d < 0) return wx.showToast({
            title: "已经是第一题了"
        }), a.setData({
            xiejie: !1,
            current: 0
        }), void(d = e_param.length - 1);
        var s = [];
        e_param.length > 3 ? 0 == n ? (s.push(e_param[d]), s.push(e_param[d + 1]), s.push(e_param[d - 1]), s[1] || (s[1] = e_param[0]),
                s[2] || (s[2] = e_param[e_param.length - 1])) : 1 == n ? (s.push(e_param[d - 1]), s.push(e_param[d]), s.push(e_param[d + 1]),
                s[2] || (s[2] = e_param[0]), s[0] || (s[0] = e_param[e_param.length - 1])) : 2 == n && (s.push(e_param[d + 1]),
                s.push(e_param[d - 1]), s.push(e_param[d]), s[0] || (s[0] = e_param[0]), s[1] || (s[1] = e_param[e_param.length - 1])) : s = e_param,
            this.setData({
                questions: s,
                indexInd: d,
                current: n
            }), this.infoshow(e_param[d].id)
        console.log(s)
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
        if(rightAutoNext !==''){
            this.setData({
                rightAutoNext: rightAutoNext
            })
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
     * 生命周期函数--监听页面隐藏
     */
    onHide() {
        var t = this,
            r = [],
            n = [],
            i = [],
            o = [];
        wx.getStorage({
            key: "delstar" + t.data.category,
            success: function (t) {
                o = t.data;
            }
        }), wx.getStorage({
            key: "starids" + t.data.category,
            success: function (e) {
                console.log(o);
                for (var s = e.data, a = 0; a < o.length; a++)
                    for (g = 0; g < s.length; g++)
                        if (s[g][Object.keys(s[g]).toString()].indexOf(o[a]) > -1) {
                            var c = s[g][Object.keys(s[g]).toString()].indexOf(o[a]);
                            s[g][Object.keys(s[g]).toString()].splice(c, 1), 0 == s[g][Object.keys(s[g]).toString()].length && s.splice(g, 1);
                        }
                wx.setStorage({
                    key: "starids" + t.data.category,
                    data: s
                }), wx.removeStorage({
                    key: "delstar" + t.data.category
                });
                for (var u = "", g = 0; g < s.length; g++) {
                    s[g][Object.keys(s[g]).toString()].toString() && (u += s[g][Object.keys(s[g]).toString()].toString() + ",");
                    for (a = 0; a < r.length; a++) Object.keys(s[g]).toString() == r[a].chapter_id && i.push({
                        title: r[a].title,
                        question_ids: s[g][Object.keys(s[g]).toString()]
                    });
                }
                n = "" != u ? [{
                    title: "全部收藏",
                    question_ids: u.slice(0, -1).split(",")
                }] : [{
                    title: "全部收藏",
                    question_ids: []
                }], t.setData({
                    errorAll: n,
                    errorEach: i
                });
            },
            fail: function () {}
        });
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {
        if(wx.getStorageSync('music')){
            this.bgm.pause()
        }
        var t = this,
            r = [],
            n = [],
            i = [],
            o = [];
        wx.getStorage({
            key: "delstar" + t.data.category,
            success: function (t) {
                o = t.data;
            }
        }), wx.getStorage({
            key: "starids" + t.data.category,
            success: function (e) {
                console.log(o);
                for (var s = e.data, a = 0; a < o.length; a++)
                    for (g = 0; g < s.length; g++)
                        if (s[g][Object.keys(s[g]).toString()].indexOf(o[a]) > -1) {
                            var c = s[g][Object.keys(s[g]).toString()].indexOf(o[a]);
                            s[g][Object.keys(s[g]).toString()].splice(c, 1), 0 == s[g][Object.keys(s[g]).toString()].length && s.splice(g, 1);
                        }
                wx.setStorage({
                    key: "starids" + t.data.category,
                    data: s
                }), wx.removeStorage({
                    key: "delstar" + t.data.category
                });
                for (var u = "", g = 0; g < s.length; g++) {
                    s[g][Object.keys(s[g]).toString()].toString() && (u += s[g][Object.keys(s[g]).toString()].toString() + ",");
                    for (a = 0; a < r.length; a++) Object.keys(s[g]).toString() == r[a].chapter_id && i.push({
                        title: r[a].title,
                        question_ids: s[g][Object.keys(s[g]).toString()]
                    });
                }
                n = "" != u ? [{
                    title: "全部收藏",
                    question_ids: u.slice(0, -1).split(",")
                }] : [{
                    title: "全部收藏",
                    question_ids: []
                }], t.setData({
                    errorAll: n,
                    errorEach: i
                });
            },
            fail: function () {}
        });
    },

    delCollect() {
        console.log(111)
        var t = this.data.idarr,
            a = this.data.greenNum,
            n = this.data.redNum;
        console.log(this.data.orderPX[t[this.data.indexInd]]);
        "red" == this.data.orderPX[t[this.data.indexInd]] ? n-- : "green" == this.data.orderPX[t[this.data.indexInd]] && a--;
        for (var d = this.data.collectData, i = 0; i < d.length; i++)
            if (d[i][Object.keys(d[i]).toString()].indexOf(t[this.data.indexInd]) > -1) {
                var s = d[i][Object.keys(d[i]).toString()].indexOf(t[this.data.indexInd]);
                d[i][Object.keys(d[i]).toString()].splice(s, 1), 0 == d[i][Object.keys(d[i]).toString()].length && d.splice(i, 1);
            }

        4 == this.data.mode ? wx.setStorage({
            key: "starids" + this.data.category,
            data: d
        }) : wx.setStorage({
            key: "errorids" + this.data.category,
            data: d,
        }), e_param.splice(this.data.indexInd, 1), t.splice(this.data.indexInd, 1);

        var o = this.data.questions;
        o.splice(this.data.current, 1), this.setData({
            idarr: t,
            question: o,
            iconcircle: [{
                title: "",
                question_ids: t,
                len: 0
            }],
            greenNum: a,
            redNum: n
        }), 0 != this.data.indexInd && this.setData({
            indexInd: this.data.indexInd - 1
        }), 2 == e_param.length && this.setData({
            current: 1
        }), this.pageChange({
            detail: {
                current: this.data.current
            }
        }), 0 == e_param.length && wx.navigateBack({
            delta: 1
        });
    },

    del_data() {
        var t = this;
        console.log(this.data.del_chapter_id);
        var e = wx.getStorageInfoSync("errorids" + s_param),
            a = [];
        e && (0 == e.length || "all" == this.data.del_chapter_id ? (wx.setStorage({
            key: "errorids" + s_param,
            data: [],
        }), wx.navigateBack({
            delta: 1
        })) : (e.forEach(function (e, r) {
            Object.keys(e)[0] != t.data.del_chapter_id && a.push(e);
        }), wx.setStorage({
            key: "errorids" + s_param,
            data: a
        }), wx.navigateBack({
            delta: 1
        })));
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