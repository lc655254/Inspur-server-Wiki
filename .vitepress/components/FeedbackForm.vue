<template>
  <div class="feedback-form">
    <AuthButton />
    <div v-if="!loggedIn" class="login-hint">⚠️ 请先登录后再提交反馈</div>
    <div v-else class="card">
      <form @submit.prevent="submit">
        <div class="form-group">
          <label class="required">游戏昵称</label>
          <input v-model="form.playerName" placeholder="你的游戏ID" />
        </div>
        <div class="form-group">
          <label>游戏版本</label>
          <input v-model="form.version" placeholder="例如 v1.21.3" />
        </div>
        <div class="form-group">
          <label>设备信息</label>
          <input v-model="form.device" placeholder="例如 Windows 10" />
        </div>
        <div class="form-group">
          <label>反馈类型</label>
          <select v-model="form.type">
            <option value="">请选择</option>
            <option value="bug">🐛 BUG报告</option>
            <option value="suggestion">💡 功能建议</option>
            <option value="balance">⚖️ 游戏平衡性</option>
            <option value="ui">🎨 界面/用户体验</option>
            <option value="performance">🚀 性能问题</option>
            <option value="other">❓ 其他</option>
          </select>
        </div>
        <div class="form-group">
          <label class="required">标题</label>
          <input v-model="form.title" placeholder="简要描述" />
        </div>
        <div class="form-group">
          <label class="required">详细描述</label>
          <textarea v-model="form.content" rows="5" placeholder="详细说明..."></textarea>
        </div>
        <div class="form-group">
          <label>严重程度</label>
          <div class="radio-group">
            <label v-for="s in severities" :key="s.value">
              <input type="radio" :value="s.value" v-model="form.severity" />
              {{ s.emoji }} {{ s.label }}
            </label>
          </div>
        </div>
        <button class="btn btn-primary" :disabled="submitting">{{ submitting ? '提交中...' : '📝 提交反馈' }}</button>
        <button type="button" class="btn btn-secondary" @click="reset">重置</button>
        <div v-if="successMsg" class="success-msg">{{ successMsg }}</div>
      </form>
    </div>
  </div>
</template>

<script>
import AuthButton from './AuthButton.vue'

export default {
  name: 'FeedbackForm',
  components: { AuthButton },
  data() {
    return {
      loggedIn: false,
      form: {
        playerName: '',
        version: '',
        device: '',
        type: '',
        title: '',
        content: '',
        severity: 'medium'
      },
      submitting: false,
      successMsg: '',
      severities: [
        { value: 'low', label: '低', emoji: '🔵' },
        { value: 'medium', label: '中', emoji: '🟡' },
        { value: 'high', label: '高', emoji: '🟠' },
        { value: 'critical', label: '严重', emoji: '🔴' }
      ]
    }
  },
  mounted() {
    this.loggedIn = !!localStorage.getItem('token');
  },
  methods: {
    async submit() {
      if (!this.form.title.trim() || !this.form.content.trim()) {
        alert('标题和内容不能为空'); return;
      }
      this.submitting = true;
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://api.inspurs.work/api/feedback/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({
            player_name: this.form.playerName,
            title: this.form.title,
            type: this.form.type,
            version: this.form.version,
            device: this.form.device,
            content: this.form.content,
            severity: this.form.severity
          })
        });
        const data = await res.json();
        if (data.code === 200) {
          this.successMsg = `✅ 提交成功！追踪码：${data.token}（请保存用于查看进度）`;
          this.reset();
        } else {
          alert('提交失败：' + data.msg);
        }
      } catch (e) { alert('网络错误'); }
      finally { this.submitting = false; }
    },
    reset() {
      this.form = { playerName: '', version: '', device: '', type: '', title: '', content: '', severity: 'medium' };
    }
  }
}
</script>

<style scoped>
.feedback-form { max-width: 800px; margin: 0 auto; }
.login-hint { text-align: center; margin-top: 40px; color: var(--vp-c-text-2); }
.card {
  background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider);
  border-radius: 12px; padding: 30px; margin-top: 20px;
}
.form-group { margin-bottom: 15px; }
label { display: block; margin-bottom: 5px; font-weight: 500; color: var(--vp-c-text-1); }
.required::after { content: " *"; color: #d63031; }
input, select, textarea {
  width: 100%; padding: 10px; border: 1px solid var(--vp-c-divider); border-radius: 6px;
  background: var(--vp-c-bg); color: var(--vp-c-text-1);
}
.radio-group { display: flex; gap: 15px; flex-wrap: wrap; }
.btn { cursor: pointer; border: none; border-radius: 6px; padding: 10px 20px; font-size: 1rem; margin-right: 10px; }
.btn-primary { background: var(--vp-c-brand); color: white; }
.btn-secondary { background: var(--vp-c-bg-alt); color: var(--vp-c-text-1); border: 1px solid var(--vp-c-divider); }
.btn:disabled { opacity: 0.6; }
.success-msg { margin-top: 15px; padding: 10px; background: #d4edda; color: #155724; border-radius: 6px; }
</style>