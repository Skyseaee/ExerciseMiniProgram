function t(id) {
  var question = wx.getStorageSync('question_'+id)
  d["questionId"] = wx.getStorageSync('question_id_'+id)
  for (var r = question, n = {}, i = 0; i < r.length; i++) {
    var g = r[i];
    n[g.id] = g;
  }
  a["question"] = n;
}
var a = {
  question: {},
}
var d = {
  questionId:[]
}
var n = require("./underscore-min.js");
module.exports = {
  initQuestions: t,
  questions: a,
  questionIds:d,
  initAllQuestionFromStorage: function (id) {
    t(id);
  },
  getQuestionsByIds: function (t) {
    var r = a.question, o = [], s = [];
    s = n.isArray(t) ? t : t.split(",");
    for (var c = 0; c < s.length; c++) {
      var u = s[c];
      r[u] && o.push(n.clone(r[u]));
    }
    return o;
  },
}