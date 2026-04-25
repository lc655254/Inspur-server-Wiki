<template>
  <div class="auth-buttons">
    <template v-if="user">
      <span class="user-info">👋 {{ user.username }}</span>
      <button class="btn btn-sm btn-logout" @click="logout">退出</button>
    </template>
    <template v-else>
      <button class="btn btn-primary" @click="showModal = true">🔑 登录 / 注册</button>
    </template>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-box">
        <div class="tab-bar">
          <button :class="['tab-btn', { active: !isRegisterMode }]" @click="isRegisterMode = false">登录</button>
          <button :class="['tab-btn', { active: isRegisterMode }]" @click="isRegisterMode = true">注册</button>
        </div>
        <input v-model="form.username" placeholder="用户名" />
        <input v-model="form.password" type="password" placeholder="密码（至少6位）" />
        <button class="btn btn-primary" @click="submitAuth">{{ isRegisterMode ? '注 册' : '登 录' }}</button>
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
  mounted() {
    this.restoreSession();
  },
  methods: {
    restoreSession() {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
      const role = localStorage.getItem('role');
      if (token && username && role) {
        this.user = { username, role };
      }
    },
    async submitAuth() {
      this.errorMsg = '';
      const url = this.isRegisterMode ? '/api/user/register' : '/api/user/login';
      try {
        const res = await fetch('https://www.inspurs.work' + url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.form)
        });
        const data = await res.json();
        if (data.code === 200) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('username', data.username);
          localStorage.setItem('role', data.role);
          this.user = { username: data.username, role: data.role };
          this.showModal = false;
          this.form = { username: '', password: '' };
          location.reload(); // 强制刷新页面，确保所有组件重新加载
        } else {
          this.errorMsg = data.msg;
        }
      } catch (e) {
        this.errorMsg = '网络错误';
      }
    },
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      this.user = null;
      location.reload(); // 强制刷新页面
    }
  }
}
</script>

<style scoped>
.auth-buttons { display: flex; align-items: center; gap: 10px; }
.user-info { font-weight: 500; color: var(--vp-c-text-1); }
.btn {
  display: inline-flex; align-items: center; gap: 6px; background: var(--vp-c-brand);
  color: white; border: none; border-radius: 8px; padding: 8px 18px; font-size: 0.9rem;
  font-weight: 500; cursor: pointer; transition: background 0.2s, opacity 0.2s;
}
.btn:hover { background: var(--vp-c-brand-dark); opacity: 0.9; }
.btn-sm { padding: 5px 12px; font-size: 0.8rem; }
.btn-logout { background: var(--vp-c-bg-alt); color: var(--vp-c-text-1); border: 1px solid var(--vp-c-divider); }
.btn-logout:hover { background: var(--vp-c-bg-soft); }
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 2000;
}
.modal-box {
  background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider);
  border-radius: 12px; padding: 30px; width: 90%; max-width: 360px;
  display: flex; flex-direction: column; gap: 12px;
}
.tab-bar { display: flex; margin-bottom: 10px; gap: 4px; }
.tab-btn {
  flex: 1; padding: 10px 0; border: none; background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-2); border-radius: 6px; font-size: 0.95rem; font-weight: 500;
  cursor: pointer; transition: 0.2s; border: 1px solid var(--vp-c-divider);
}
.tab-btn.active { background: var(--vp-c-brand); color: white; border-color: var(--vp-c-brand); font-weight: 600; }
.modal-box input {
  padding: 10px; border: 1px solid var(--vp-c-divider); border-radius: 6px;
  background: var(--vp-c-bg); color: var(--vp-c-text-1);
}
.error { color: #d63031; font-size: 0.85rem; }
</style>