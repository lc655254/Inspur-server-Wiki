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
        <!-- Tab 切换栏 -->
        <div class="tab-bar">
          <button
            :class="['tab-btn', { active: !isRegisterMode }]"
            @click="isRegisterMode = false"
          >
            登录
          </button>
          <button
            :class="['tab-btn', { active: isRegisterMode }]"
            @click="isRegisterMode = true"
          >
            注册
          </button>
        </div>

        <input v-model="form.username" placeholder="用户名" />
        <input v-model="form.password" type="password" placeholder="密码（至少6位）" />
        <button class="btn btn-primary" @click="submitAuth">
          {{ isRegisterMode ? '注 册' : '登 录' }}
        </button>
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

/* 通用按钮 */
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

/* 弹窗 */
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

/* Tab 栏 */
.tab-bar {
  display: flex;
  margin-bottom: 10px;
  gap: 4px;
}

.tab-btn {
  flex: 1;
  padding: 10px 0;
  border: none;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-2);
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;
  border: 1px solid var(--vp-c-divider);
}

.tab-btn.active {
  background: var(--vp-c-brand);
  color: white;
  border-color: var(--vp-c-brand);
  font-weight: 600;
}

.modal-box input {
  padding: 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.error {
  color: #d63031;
  font-size: 0.85rem;
}
</style>