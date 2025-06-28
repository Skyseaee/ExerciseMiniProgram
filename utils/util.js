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

const getCurrentTime = () => {
  // 获取当前时间的 Date 对象
  var currentDate = new Date();

  // 获取年、月、日、小时、分钟、秒
  var year = currentDate.getFullYear();
  var month = ('0' + (currentDate.getMonth() + 1)).slice(-2); // 月份从0开始，需要加1
  var day = ('0' + currentDate.getDate()).slice(-2);
  var hours = ('0' + currentDate.getHours()).slice(-2);
  var minutes = ('0' + currentDate.getMinutes()).slice(-2);
  var seconds = ('0' + currentDate.getSeconds()).slice(-2);

  // 格式化为字符串
  var formattedDate = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;

  return formattedDate;
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

const getRandomItems = (n, num) =>{  
  let randomNumbers = [];
  while (randomNumbers.length < n) {
    const randomNumber = Math.floor(Math.random() * (num + 1));
    if (!randomNumbers.includes(randomNumber)) {
      randomNumbers.push(randomNumber);
    }
  }

  return randomNumbers;
}

const generateExamKey = (name) => {
  return name + '_exam'
}

const mappingExercise = (type) => {
  switch(type){
    case 0: return "单选"
    case 1: return "多选"
    case 2: return "判断"
    default: return "专项题型"
  }
}

const feedback = (index, questionInfo, uid, correct_answer, comment) => {
  wx.request({
    url: 'https://www.skyseaee.cn/routine/auth_api/feedback_wrong_answer',
    header: {
      "content-type": "application/x-www-form-urlencoded",
    },
    data: {
      uid: uid,
      exercise_id: index,
      first_id: questionInfo.first_id,
      second_id: questionInfo.second_id,
      correct_answer: correct_answer,
      comment: comment,
      exercise_type: questionInfo.exercise_type,
    },
    success: function(res) {
      wx.showToast({
        title: '已提交，我们将快速审核',
        icon: 'none',
      })
    }
  })
}

const getImageInfo = (imageUrl) => {
  wx.getImageInfo({
    src: imageUrl,
    success: (res) => {
      const aspectRatio = res.width / res.height; // 图片宽高比
      const windowHeight = wx.getSystemInfoSync().windowHeight; // 获取窗口高度
      const imageHeight = windowHeight * 0.8; // 设置图片高度为窗口高度的80%，可根据需求调整

      // 根据宽高比动态计算图片高度
      this.setData({
        imageHeight: `${imageHeight * aspectRatio}rpx`,
      });
    },
    fail: (error) => {
      console.error('获取图片信息失败', error);
    },
  });
}

const convertToLetters = (str) => {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    let charCode = parseInt(str[i]) + 65; // ASCII码中 A 的值是 65
    let letter = String.fromCharCode(charCode);
    result += letter;
  }
  return result;
}

const mappingOptions = (i, answer, user_answer) => {
  if(i == answer) {
    return 'optionCorrect'
  } else if(i === user_answer && answer != user_answer) {
    return 'optionWrong'
  } else {
    return 'optionUnselected'
  }
}

const base64_encode = (str) => {
  var c1, c2, c3;
  var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var i = 0, len = str.length, string = '';

  while (i < len) {
    c1 = str.charCodeAt(i++) & 0xff;
    if (i == len) {
      string += base64EncodeChars.charAt(c1 >> 2);
      string += base64EncodeChars.charAt((c1 & 0x3) << 4);
      string += "==";
      break;
    }
    c2 = str.charCodeAt(i++);
    if (i == len) {
      string += base64EncodeChars.charAt(c1 >> 2);
      string += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
      string += base64EncodeChars.charAt((c2 & 0xF) << 2);
      string += "=";
      break;
    }
    c3 = str.charCodeAt(i++);
    string += base64EncodeChars.charAt(c1 >> 2);
    string += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
    string += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
    string += base64EncodeChars.charAt(c3 & 0x3F)
  }
  return string
}


module.exports = {
  formatTime,
  getNowDate,
  judgeDate,
  playAudio,
  getCurrentTime,
  getRandomItems,
  generateExamKey,
  mappingExercise,
  feedback,
  getImageInfo,
  convertToLetters,
  base64_encode,
  mappingOptions,
}
