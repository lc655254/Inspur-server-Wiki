<template>
  <div class="auth-buttons">
    <template v-if="user">
      <span class="user-info">👋 {{ user.username }}</span>
      <button class="btn btn-sm btn-logout" @click="logout">退出</button>
    </template>
    <template v-else>
      <button class="btn btn-primary" @click="showModal = true">🔑 登录 / 注册</button>
    </template>

    <!-- 弹出框 -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-box">
        <h3>{{ isRegisterMode ? '注册' : '登录' }}</h3>
        <input v-model="form.username" placeholder="用户名" />
        <input v-model="form.password" type="password" placeholder="密码（至少6位）" />
        <div class="modal-actions">
          <button class="btn btn-primary" @click="submitAuth">{{ isRegisterMode ? '注册' : '登录' }}</button>
          <button class="btn btn-secondary" @click="toggleMode">{{ isRegisterMode ? '已有账号？去登录' : '没有账号？去注册' }}</button>
        </div>
        <p class="error" v-if="errorMsg">{{ errorMsg }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AuthButton',
  data() {
    return {
      user: null,
      showModal: false,
      isRegisterMode: false,
      form: { username: '', password: '' },
      errorMsg: ''
    }
  },
  mounted() { this.checkLogin() },
  methods: {
    async checkLogin() {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('http://api.inspurs.work/api/user/info', {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json();
        if (data.code === 200) this.user = data.data;
        else localStorage.removeItem('token');
      } catch (e) { console.error(e) }
    },
    async submitAuth() {
      this.errorMsg = '';
      const url = this.isRegisterMode ? '/api/user/register' : '/api/user/login';
      try {
        const res = await fetch('http://api.inspurs.work' + url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.form)
        });
        const data = await res.json();
        if (data.code === 200) {
          localStorage.setItem('token', data.token);
          this.user = { username: data.username };
          this.showModal = false;
          this.form = { username: '', password: '' };
        } else {
          this.errorMsg = data.msg;
        }
      } catch (e) { this.errorMsg = '网络错误' }
    },
    toggleMode() {
      this.isRegisterMode = !this.isRegisterMode;
      this.errorMsg = '';
    },
    logout() {
      localStorage.removeItem('token');
      this.user = null;
    }
  }
}
</script>

<style scoped>
.auth-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-info {
  font-weight: 500;
  color: var(--vp-c-text-1);
}

/* 增强按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--vp-c-brand);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
}

.btn:hover {
  background: var(--vp-c-brand-dark);
  opacity: 0.9;
}

.btn-sm {
  padding: 5px 12px;
  font-size: 0.8rem;
}

.btn-logout {
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}

.btn-logout:hover {
  background: var(--vp-c-bg-soft);
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-box {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 30px;
  width: 90%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal-box input {
  padding: 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-secondary {
  background: transparent;
  color: var(--vp-c-brand);
  border: none;
  padding: 0;
  font-size: 0.85rem;
  text-decoration: underline;
  cursor: pointer;
}

.error {
  color: #d63031;
  font-size: 0.85rem;
}
</style>