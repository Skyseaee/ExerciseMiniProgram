Component({
  properties: {
    questionData: {
      type: Object,
      value: {}
    },
    currentQuestion: {
      type: Object,
      value: {}
    },
    totalCount: {
      type: Number,
      value: 0
    },
    currentIndex: {
      type: Number,
      value: 0
    },
    options: {
      type: Array,
      value: []
    },
    optionType: {
      type: Number,
      value: 0
    },
    answer: {
      type: String,
      value: ''
    },
    userAnswer: {
      type: String,
      value: ''
    },
    currentRate: {
      type: String,
      value: ''
    },
    isFavor: {
      type: Boolean,
      value: false
    },
    mode: {
      type: Boolean,
      value: false
    },
    showAnswer: {
      type: Boolean,
      value: false
    },
    showModeSwitch: {
      type: Boolean,
      value: false
    },
    showLike: {
      type: Boolean,
      value: false
    },
    showList: {
      type: Boolean,
      value: false
    },
    showCorrectRate: {
      type: Boolean,
      value: true
    },
    likeState: {
      type: Number,
      value: 0
    },
    likeCount: {
      type: Number,
      value: 0
    },
    dislikeCount: {
      type: Number,
      value: 0
    },
    pointName: {
      type: String,
      value: ''
    },
    tags: {
      type: Array,
      value: []
    }
  },

  data: {
    displayOptions: [],
    questionImageHeight: 0,
    commentImageHeight: 0
  },

  observers: {
    'options, answer, userAnswer, showAnswer, mode': function(options, answer, userAnswer, showAnswer, mode) {
      this.updateDisplayOptions(options, answer, userAnswer, showAnswer, mode)
    }
  },

  lifetimes: {
    attached() {
      this.updateDisplayOptions(this.data.options, this.data.answer, this.data.userAnswer, this.data.showAnswer, this.data.mode)
    }
  },

  methods: {
    updateDisplayOptions(options, answer, userAnswer, showAnswer, mode) {
      if (!options || options.length === 0) return
      
      const optionType = this.data.optionType
      const displayOptions = options.map((item, index) => {
        let selected = ''
        if (showAnswer || mode) {
          if (optionType == 1) {
            const answerIndex = this.letterToIndex(answer)
            const userAnswerIndex = this.letterToIndex(userAnswer)
            if (index === answerIndex) {
              selected = 'correct'
            } else if (index === userAnswerIndex && userAnswer !== answer) {
              selected = 'wrong'
            }
          } else {
            const answerIndex = parseInt(answer)
            const userAnswerIndex = parseInt(userAnswer)
            if (index === answerIndex) {
              selected = 'correct'
            } else if (index === userAnswerIndex && userAnswer !== answer) {
              selected = 'wrong'
            }
          }
        }
        return {
          ...item,
          selected
        }
      })
      this.setData({ displayOptions })
    },

    letterToIndex(letter) {
      const map = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5 }
      return map[letter] || 0
    },

    getProgress() {
      return (this.data.currentIndex + 1) * 100 / this.data.totalCount
    },

    switchMode(e) {
      this.triggerEvent('switchMode', { mode: e.detail.value })
    },

    selectOption(e) {
      const index = e.currentTarget.dataset.index
      this.triggerEvent('selectOption', { index })
    },

    onFavor() {
      this.triggerEvent('favor')
    },

    onPrev() {
      this.triggerEvent('prev')
    },

    onNext() {
      this.triggerEvent('next')
    },

    onLike() {
      this.triggerEvent('like')
    },

    onDislike() {
      this.triggerEvent('dislike')
    },

    onShowList() {
      this.triggerEvent('showList')
    },

    onQuestionImageLoad(e) {
      const ratio = e.detail.width / e.detail.height
      this.setData({
        questionImageHeight: 750 / ratio
      })
    },

    onCommentImageLoad(e) {
      const ratio = e.detail.width / e.detail.height
      this.setData({
        commentImageHeight: 750 / ratio
      })
    },

    onQuestionImageTap() {
      if (this.data.currentQuestion && this.data.currentQuestion.question_img) {
        this.triggerEvent('previewQuestionImage', { url: this.data.currentQuestion.question_img })
      }
    },

    onCommentImageTap() {
      if (this.data.currentQuestion && this.data.currentQuestion.comment_img) {
        this.triggerEvent('previewCommentImage', { url: this.data.currentQuestion.comment_img })
      }
    }
  }
})
