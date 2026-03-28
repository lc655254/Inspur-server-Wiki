<template>
  <div class="feedback-system">
    <div class="container">
      <header>
        <h1>游戏反馈与建议</h1>
        <p class="subtitle">帮助我们改进游戏体验，您的反馈对我们非常重要！</p>
      </header>
      
      <div class="card">
        <form @submit.prevent="submitFeedback">
          <div class="form-group">
            <label for="playerName" class="required">玩家名称</label>
            <input type="text" id="playerName" v-model="form.playerName" placeholder="请输入您的游戏昵称" required>
            <div class="error" v-if="errors.playerName">请输入玩家名称</div>
          </div>
          
          <div class="form-group">
            <label for="playerEmail">联系方式（邮箱）</label>
            <input type="email" id="playerEmail" v-model="form.playerEmail" placeholder="请输入您的邮箱（选填）">
            <div class="error" v-if="errors.playerEmail">请输入有效的邮箱地址</div>
          </div>
          
          <div class="form-group">
            <label for="feedbackTitle" class="required">反馈标题</label>
            <input type="text" id="feedbackTitle" v-model="form.feedbackTitle" placeholder="简要描述问题或建议" required>
            <div class="error" v-if="errors.feedbackTitle">请输入反馈标题</div>
          </div>
          
          <div class="form-group">
            <label for="feedbackType" class="required">反馈类型</label>
            <select id="feedbackType" v-model="form.feedbackType" required>
              <option value="">请选择反馈类型</option>
              <option value="bug">🐛 BUG报告</option>
              <option value="suggestion">💡 功能建议</option>
              <option value="balance">⚖️ 游戏平衡性</option>
              <option value="ui">🎨 界面/用户体验</option>
              <option value="performance">🚀 性能问题</option>
              <option value="other">❓ 其他</option>
            </select>
            <div class="error" v-if="errors.feedbackType">请选择反馈类型</div>
          </div>
          
          <div class="form-group">
            <label for="gameVersion">游戏版本</label>
            <input type="text" id="gameVersion" v-model="form.gameVersion" placeholder="例如：v1.2.3（选填）">
          </div>
          
          <div class="form-group">
            <label for="deviceInfo">设备信息</label>
            <input type="text" id="deviceInfo" v-model="form.deviceInfo" placeholder="例如：Windows 10 / iPhone 12（选填）">
          </div>
          
          <div class="form-group">
            <label for="feedbackContent" class="required">详细描述</label>
            <textarea id="feedbackContent" v-model="form.feedbackContent" placeholder="请详细描述您遇到的问题或建议..." required></textarea>
            <div class="error" v-if="errors.feedbackContent">请输入反馈内容</div>
          </div>
          
          <div class="form-group">
            <label>严重程度</label>
            <div class="radio-group">
              <div class="radio-option" v-for="option in severityOptions" :key="option.value">
                <input type="radio" :id="'severity' + option.value" :value="option.value" v-model="form.severity">
                <label :for="'severity' + option.value">{{ option.emoji }} {{ option.label }}</label>
              </div>
            </div>
          </div>
          
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            <span v-if="!submitting">📝 提交反馈</span>
            <span v-else>⏳ 提交中...</span>
          </button>
          <button type="button" class="btn btn-secondary" @click="resetForm">🔄 重置表单</button>
          
          <div class="success-message" v-if="submitSuccess">
            ✅ 感谢您的反馈！我们已经收到您的提交。
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FeedbackForm',
  data() {
    return {
      // 👇 这是你自己电脑的后端地址（本地运行）
      baseURL: "https://inspur-feedback.onrender.com",
      
      form: {
        playerName: '',
        playerEmail: '',
        feedbackTitle: '',
        feedbackType: '',
        gameVersion: '',
        deviceInfo: '',
        feedbackContent: '',
        severity: 'medium'
      },
      errors: {},
      submitting: false,
      submitSuccess: false,
      severityOptions: [
        { value: 'low', label: '低', emoji: '🔵' },
        { value: 'medium', label: '中', emoji: '🟡' },
        { value: 'high', label: '高', emoji: '🟠' },
        { value: 'critical', label: '严重', emoji: '🔴' }
      ]
    }
  },

  methods: {
    validateForm() {
      this.errors = {}
      
      if (!this.form.playerName.trim()) {
        this.errors.playerName = true
      }
      
      if (this.form.playerEmail && !this.validateEmail(this.form.playerEmail)) {
        this.errors.playerEmail = true
      }
      
      if (!this.form.feedbackTitle.trim()) {
        this.errors.feedbackTitle = true
      }
      
      if (!this.form.feedbackType) {
        this.errors.feedbackType = true
      }
      
      if (!this.form.feedbackContent.trim()) {
        this.errors.feedbackContent = true
      }
      
      return Object.keys(this.errors).length === 0
    },
    
    validateEmail(email) {
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return re.test(String(email).toLowerCase())
    },
    
    // 👇 提交到你自己的本地后端
    async submitFeedback() {
      if (!this.validateForm()) {
        return
      }
      
      this.submitting = true
      
      try {
        const response = await fetch(this.baseURL + "/api/feedback/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username: this.form.playerName,
            email: this.form.playerEmail,
            title: this.form.feedbackTitle,
            type: this.form.feedbackType,
            version: this.form.gameVersion,
            device: this.form.deviceInfo,
            content: this.form.feedbackContent,
            severity: this.form.severity
          })
        })

        const result = await response.json()

        if (result.code === 200) {
          this.submitSuccess = true
          setTimeout(() => {
            this.resetForm()
            this.submitSuccess = false
          }, 3000)
        } else {
          alert("提交失败：" + result.msg)
        }
        
      } catch (error) {
        console.error("提交失败：", error)
        alert("提交失败，请检查后端是否启动")
      } finally {
        this.submitting = false
      }
    },
    
    resetForm() {
      this.form = {
        playerName: '',
        playerEmail: '',
        feedbackTitle: '',
        feedbackType: '',
        gameVersion: '',
        deviceInfo: '',
        feedbackContent: '',
        severity: 'medium'
      }
      this.errors = {}
    }
  }
}
</script>

<style scoped>
.feedback-system {
  padding: 20px 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #6c5ce7;
  margin-bottom: 10px;
}

.subtitle {
  color: #2d3436;
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.card {
  background-color: white;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2d3436;
}

input, select, textarea {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input:focus, select:focus, textarea:focus {
  border-color: #6c5ce7;
  outline: none;
}

textarea {
  min-height: 150px;
  resize: vertical;
}

.radio-group {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.radio-option input {
  width: auto;
}

.btn {
  padding: 14px 25px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-primary {
  background-color: #6c5ce7;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #a29bfe;
}

.btn-secondary {
  background-color: #f5f6fa;
  color: #2d3436;
  margin-left: 15px;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.required::after {
  content: " *";
  color: #d63031;
}

.error {
  color: #d63031;
  font-size: 14px;
  margin-top: 5px;
}

.success-message {
  background-color: #00b894;
  color: white;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  margin-top: 20px;
}

@media (max-width: 600px) {
  .card {
    padding: 20px;
  }
  
  .radio-group {
    flex-direction: column;
    gap: 10px;
  }
  
  .btn {
    width: 100%;
    margin-bottom: 10px;
  }
  
  .btn-secondary {
    margin-left: 0;
  }
}
</style>
