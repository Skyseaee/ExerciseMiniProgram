// pages/component/feedbackInput/feedbackInput.js
Component({

    options: {
      multipleSlots: true, // 允许组件拥有多个插槽  ,
    },
    /**
     * 组件的属性列表
     */
    properties: {

    },

    /**
     * 组件的初始数据
     */
    data: {
      inputValue1: '',  
      inputValue2: '',
      options: ['答案', '题目', '选项', '解析', '其他'],
      selectedOption: '请选择',
    },

    /**
     * 组件的方法列表
     */
    methods: {
      getInputValue1(e) {  
        this.setData({  
          inputValue1: e.detail.value  
        });  
      },  
      getInputValue2(e) {  
        this.setData({  
          inputValue2: e.detail.value  
        });  
      },  
      confirm() {  
        // 触发自定义事件，将输入框的值传递给父组件  
        const eventDetail = {  
          value1: this.data.selectedOption,  
          value2: this.data.inputValue2  
        };  
        this.triggerEvent('confirm', eventDetail);  
      }, 

      bindPickerChange: function(e) {
        this.setData({
          selectedOption: this.data.options[e.detail.value]
        });
      },
      
      closeModal() {  
        this.triggerEvent('closeModal', "")
      } 
    }
})