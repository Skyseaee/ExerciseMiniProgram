// pages/exerciseCharts/exerciseCharts.js
import * as echarts from '../ec-canvas/echarts'
const app = getApp();

Page({
  data: {
    ec: {
      lazyLoad: true
    },

    duration: 0, // 0 - month, 1 - year
    total: 0, 
    currectrate: 100, 
    label: [],
    data: [],
    labels: [],
    datas: [],
  },

  onLoad() {
    let that = this
    wx.request({
      url: 'https://www.skyseaee.cn/routine/auth_api/get_simple_records_by_userID',
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        userid: app.globalData.uid,
      },
      success: function(res) {
        let data = res.data
        console.log(data.data)
        let dict = that.countExercisesPerMonth(data.data)
        let labels = that.generateLables(dict)
        that.setData({
          total: data.count,
          label: labels[0],
          data: dict[0],
          datas: dict,
          labels
        })
        // console.log(labels[0], dict[0])
        let ecComponent = that.selectComponent('#mychart-height')
        ecComponent.init((canvas, width, height, dpr) => {
          const chart = echarts.init(canvas, null, {
            width: width,
            height: height,
            devicePixelRatio: dpr
          })
          that.initChart(canvas, width, height, dpr, labels[0], dict[0])
          return chart
        })
      }
    })
  },

  onReady() {
  },

  initChart(canvas, width, height, dpr, label, data, correct) {
    const chart = echarts.init(canvas, null, {
      width: width,
      height: height,
      devicePixelRatio: dpr // new
    });
    canvas.setChart(chart);
  
    var option = {
      legend: {
        data: ['刷题数', '正确题数'],
        top: '90%',
      },
      grid: {
        containLabel: true
      },
      tooltip: {
        show: true,
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: label,
        // show: false
      },
      yAxis: {
        x: 'center',
        type: 'value',
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        }
        // show: false
      },
      series: [{
        name: '正确题数',
        type: 'line',
        smooth: false,
        data: correct,
        symbol: 'circle', // 拐点的形状
        symbolSize: 6, // 拐点大小
        itemStyle: {
          normal: {
              color: '#FFC625', //改变折线点的颜色
              lineStyle: {
                  color: '#FFEAA8', //改变折线颜色
                  width: 4
              }
          }
        },
      },{
        name: '刷题数',
        type: 'line',
        smooth: false,
        data: data,
        symbol: 'circle', // 拐点的形状
        symbolSize: 6, // 拐点大小
        itemStyle: {
          normal: {
              color: '#1A70E1', //改变折线点的颜色
              lineStyle: {
                  color: '#A8B9FD', //改变折线颜色
                  width: 4
              }
          }
        },
      }]
    };
  
    chart.setOption(option);
    return chart;
  },

  switchMonth() {
    let data =  this.data.datas[0]
    let label = this.data.labels[0]
    let correct = this.data.datas[2]
    this.setData({
      duration: 0,
      data,
      label
    })
    let ecComponent = this.selectComponent('#mychart-height')
      ecComponent.init((canvas, width, height, dpr) => {
        const chart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: dpr
        })
        this.initChart(canvas, width, height, dpr, label, data, correct)
        return chart
      })
  },

  switchTotal() {
    let data =  this.data.datas[1]
    let label = this.data.labels[1]
    let correct = this.data.datas[3]
    console.log(this.data.datas)
    this.setData({
      duration: 2,
      data,
      label
    })
    let ecComponent = this.selectComponent('#mychart-height')
      ecComponent.init((canvas, width, height, dpr) => {
        const chart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: dpr
        })
        this.initChart(canvas, width, height, dpr, label, data, correct)
        return chart
      })
  },

  countExercisesPerMonth(data) {
    // 获取当前日期
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 月份从0开始，所以要加1
    const currentYear = currentDate.getFullYear();
    const currentDay = currentDate.getDate();

    let totalCount = []
    let dailyCount = []
    let monthlyCount = []
    let monthlyCorrect = []

    let correctMonthlyNum = []
    let correctTotalNum = []

    for(let i=0; i<currentDay; i++) {
      dailyCount.push(0)
      correctMonthlyNum.push(0)
    }

    for(let i=0; i<currentMonth; i++) {
      totalCount.push(0)
      monthlyCount.push(0)
      monthlyCorrect.push(0)
      correctTotalNum.push(0)
    }
    let temp = data.length
    let correct = 0
    for(let i=0; i<data.length; i++) {
      let record = data[i]
      const answerDate = new Date(record.answer_time);
      // 获取年份和月份
      const year = answerDate.getFullYear();
      const month = answerDate.getMonth() + 1; // 月份从0开始，所以要加1
      const day = answerDate.getDate();
      if(year == currentYear) {
        temp--
        monthlyCount[month-1]++
        if(record.is_correct == 1) {
          monthlyCorrect[month-1]++
        }
        if(month == currentMonth) {
          dailyCount[day-1]++
          if(record.is_correct == 1) {
            correctMonthlyNum[day-1]++
          }
        }
      } else if(record.is_correct == 1) {
        correct++
      }
    }
    
    totalCount[0] = monthlyCount[0] + temp
    correctTotalNum[0] = correct

    for(let i=1; i<monthlyCount.length; i++) {
      totalCount[i] += totalCount[i-1] + monthlyCount[i]
      correctTotalNum[i] += monthlyCorrect[i] + correctTotalNum[i-1]
    }
    
    // 返回包含当前月、当前年以及总数的数组
    return [
      dailyCount,
      totalCount,
      correctMonthlyNum,
      correctTotalNum,
    ]
  },

  generateLables(data) {
    let month = data[0]
    let year = data[1]
    let total = data[2]

    let monthLables = []
    for(let i=0; i<month.length; i++) {
      monthLables.push(this.formatIndex(i) + '号')
    }

    let yearLabels = []
    for(let i=0; i<year.length; i++) {
      yearLabels.push(this.formatIndex(i) + '月')
    }

    return [
      monthLables,
      yearLabels,
      yearLabels
    ]
  },

  formatIndex(index) {
    let dict = {1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六', 7: '七', 8: '八', 9: '九', 10: '十',
    11: '十一', 12: '十二', 13: '十三', 14: '十四', 15: '十五', 16: '十六', 17: '十七', 18: '十八', 19: '十九', 20: '二十', 21: '二十一', 22: '二十二', 23: '二十三', 24: '二十四', 25: '二十五', 26: '二十六', 27: '二十七', 28: '二十八', 29: '二十九', 30: '三十', 31: '三十一'}
    return dict[index+1]
  }
});
