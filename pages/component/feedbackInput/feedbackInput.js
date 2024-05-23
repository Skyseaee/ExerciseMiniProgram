// pages/component/feedbackInput/feedbackInput.js
Component({

    options: {
      multipleSlots: true // 允许组件拥有多个插槽  
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
      inputValue2: ''  
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
          value1: this.data.inputValue1,  
          value2: this.data.inputValue2  
        };  
        this.triggerEvent('confirm', eventDetail);  
      },  
      
      closeModal() {  
        this.triggerEvent('closeModal', "")
      } 
    }
})