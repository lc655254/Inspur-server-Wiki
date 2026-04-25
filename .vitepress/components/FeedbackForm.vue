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

        <!-- 优化后的严重程度部分 -->
        <div class="form-group">
          <label>严重程度</label>
          <div class="severity-options">
            <label
              v-for="s in severities"
              :key="s.value"
              :class="['severity-item', { active: form.severity === s.value }]"
            >
              <input
                type="radio"
                :value="s.value"
                v-model="form.severity"
                @change="form.severity = s.value"
              />
              <span class="severity-emoji">{{ s.emoji }}</span>
              <span class="severity-label">{{ s.label }}</span>
            </label>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn btn-primary" :disabled="submitting">{{ submitting ? '提交中...' : '📝 提交反馈' }}</button>
          <button type="button" class="btn btn-secondary" @click="reset">重置</button>
        </div>
        <div v-if="successMsg" class="success-msg">{{ successMsg }}</div>
      </form>
    </div>
  </div>
</template>

<script>
import AuthButton from './AuthButton.vue'

export default {
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
    // 可选：从 localStorage 预填用户名
    const username = localStorage.getItem('username');
    if (username) this.form.playerName = username;
  },
  methods: {
    async submit() {
      if (!this.form.title.trim() || !this.form.content.trim()) {
        alert('标题和内容不能为空'); return;
      }
      this.submitting = true;
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('https://api.inspurs.work/api/feedback/submit', {
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
      this.successMsg = '';
    }
  }
}
</script>

<style scoped>
.feedback-form { max-width: 800px; margin: 0 auto; }
.login-hint { text-align: center; margin-top: 40px; color: var(--vp-c-text-2); }
.card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 30px;
  margin-top: 20px;
}
.form-group {
  margin-bottom: 20px;
}
label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: var(--vp-c-text-1);
}
.required::after {
  content: " *";
  color: #d63031;
  margin-left: 2px;
}
input, select, textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.95rem;
  transition: border-color 0.2s;
}
input:focus, select:focus, textarea:focus {
  border-color: var(--vp-c-brand);
  outline: none;
}
textarea {
  resize: vertical;
  min-height: 100px;
}

/* 严重程度选项样式 */
.severity-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 4px;
}
.severity-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}
.severity-item:hover {
  border-color: var(--vp-c-brand-light);
  background: var(--vp-c-bg-soft);
}
.severity-item.active {
  border-color: var(--vp-c-brand);
  background: var(--vp-c-brand-light);
  color: white;
}
.severity-item.active .severity-label {
  color: white;
}
.severity-item input[type="radio"] {
  display: none; /* 隐藏原生单选框，使用自定义样式 */
}
.severity-emoji {
  font-size: 1.1rem;
}
.severity-label {
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}
.btn {
  cursor: pointer;
  border: none;
  border-radius: 8px;
  padding: 10px 22px;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s;
}
.btn-primary {
  background: var(--vp-c-brand);
  color: white;
}
.btn-primary:hover:not(:disabled) {
  background: var(--vp-c-brand-dark);
}
.btn-secondary {
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}
.btn-secondary:hover {
  background: var(--vp-c-bg-soft);
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.success-msg {
  margin-top: 15px;
  padding: 12px;
  background: #d4edda;
  color: #155724;
  border-radius: 6px;
  border: 1px solid #c3e6cb;
}

@media (max-width: 600px) {
  .card {
    padding: 20px;
  }
  .severity-options {
    flex-direction: column;
  }
}
</style>