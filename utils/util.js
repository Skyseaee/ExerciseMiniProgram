const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

// 格式化日对象
const getNowDate = () => {
  var date = new Date();
  var sign2 = ":";
  var year = date.getFullYear() // 年
  var month = date.getMonth() + 1; // 月
  var day = date.getDate(); // 日
  var hour = date.getHours(); // 时
  var minutes = date.getMinutes(); // 分
  var seconds = date.getSeconds() //秒
  var weekArr = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期天'];
  var week = weekArr[date.getDay()];
  // 给一位数的数据前面加 “0”
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (day >= 0 && day <= 9) {
    day = "0" + day;
  }
  if (hour >= 0 && hour <= 9) {
    hour = "0" + hour;
  }
  if (minutes >= 0 && minutes <= 9) {
    minutes = "0" + minutes;
  }
  if (seconds >= 0 && seconds <= 9) {
    seconds = "0" + seconds;
  }
  return year + "-" + month + "-" + day
}


const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

/**
 * 判断时间
 * 1：已开始 2：已过期 3：未开始
 * @param {*} date1 
 * @param {*} date2 
 */
const judgeDate = (date1,date2) => {
  let dateBegin = new Date(date1.replace(/-/g, "/"));
  let dateEnd = new Date(date2.replace(/-/g, "/"));
  let dateNow = new Date(); //获取当前时间
  let beginDiff = dateNow.getTime() - dateBegin.getTime(); //时间差的毫秒数
  let beginDayDiff = Math.floor(beginDiff / (24 * 3600 * 1000)); //计算出相差天数
  let endDiff = dateEnd.getTime() - dateNow.getTime(); //时间差的毫秒数
  let endDayDiff = Math.floor(endDiff / (24 * 3600 * 1000)); //计算出相差天数
  if(endDayDiff < 0){//已过期
    return 2
  }
  if(beginDayDiff < 0){//未开始
    return 3
  }
  //已开始
  return 1
}

const playAudio = (src) =>{
  if(wx.getStorageSync('music')){
    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.autoplay = true
    innerAudioContext.src = src
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
  }
}

module.exports = {
  formatTime,
  getNowDate,
  judgeDate,
  playAudio
}
