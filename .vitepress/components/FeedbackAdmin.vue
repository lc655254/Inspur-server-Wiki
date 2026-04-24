<template>
  <div class="feedback-admin">
    <!-- 登录弹窗 -->
    <div v-if="!isAuthenticated" class="login-overlay">
      <div class="login-card">
        <div class="login-icon">🔐</div>
        <h2>管理员登录</h2>
        <p class="login-desc">输入密码以管理反馈</p>
        <input type="password" v-model="password" placeholder="管理员密码" class="login-input" @keyup.enter="checkPassword" />
        <button class="btn btn-login" @click="checkPassword">登 录</button>
        <p v-if="loginError" class="login-error">{{ loginError }}</p>
      </div>
    </div>

    <div v-else class="container">
      <header class="admin-header">
        <div>
          <h1>🎮 玩家反馈管理</h1>
          <p class="subtitle">实时显示玩家反馈</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-logout" @click="logout">🚪 退出</button>
        </div>
        <div class="auto-refresh">
          <label><input type="checkbox" v-model="autoRefresh" /> 🔄 自动刷新</label>
          <select v-model="refreshInterval" v-if="autoRefresh">
            <option :value="10">10秒</option>
            <option :value="30">30秒</option>
            <option :value="60">1分钟</option>
          </select>
          <span class="last-refresh">最后刷新：{{ lastRefreshTime }}</span>
        </div>
      </header>

      <!-- 统计卡片 -->
      <div class="stats">
        <div class="stat-card" :class="{ active: currentFilter === 'all' }" @click="setFilter('all')">
          <span class="stat-num">{{ totalCount }}</span><span class="stat-label">📋 全部</span>
        </div>
        <div class="stat-card" :class="{ active: currentFilter === 'open' }" @click="setFilter('open')">
          <span class="stat-num">{{ openCount }}</span><span class="stat-label">🔓 待处理</span>
        </div>
        <div class="stat-card" :class="{ active: currentFilter === 'closed' }" @click="setFilter('closed')">
          <span class="stat-num">{{ closedCount }}</span><span class="stat-label">✅ 已解决</span>
        </div>
        <div class="stat-card" :class="{ active: currentFilter === 'bug' }" @click="setFilter('bug')">
          <span class="stat-num">{{ bugCount }}</span><span class="stat-label">🐛 BUG</span>
        </div>
      </div>

      <!-- 筛选 -->
      <div class="toolbar">
        <div class="filters">
          <select v-model="statusFilter">
            <option value="all">全部状态</option>
            <option value="open">待处理</option>
            <option value="in_progress">处理中</option>
            <option value="closed">已解决</option>
          </select>
          <select v-model="typeFilter">
            <option value="all">全部类型</option>
            <option value="bug">🐛 BUG</option>
            <option value="suggestion">💡 建议</option>
            <option value="balance">⚖️ 平衡</option>
            <option value="ui">🎨 UI</option>
            <option value="performance">🚀 性能</option>
            <option value="other">❓ 其他</option>
          </select>
        </div>
        <div>
          <button class="btn btn-export" @click="exportCSV">📊 导出CSV</button>
          <button class="btn btn-danger" @click="clearAll" v-if="feedbacks.length">🗑️ 清空</button>
        </div>
      </div>

      <!-- 反馈列表 -->
      <div class="feedback-list">
        <div v-if="filteredFeedbacks.length === 0" class="empty">📭 暂无反馈</div>
        <div v-for="fb in filteredFeedbacks" :key="fb.id" class="feedback-item" :class="'sev-' + fb.severity">
          <div class="item-header">
            <span class="status-dot" :class="fb.status"></span>
            <strong>{{ fb.feedback_title }}</strong>
            <span class="type-badge">{{ typeText(fb.feedback_type) }}</span>
            <span class="severity-badge" :class="'sev-' + fb.severity">{{ severityText(fb.severity) }}</span>
          </div>
          <p class="item-body">{{ fb.feedback_content }}</p>
          <div class="item-footer">
            <span>👤 {{ fb.username || fb.player_name }}</span>
            <span>📅 {{ formatDate(fb.created_at) }}</span>
            <div class="item-actions">
              <select v-model="fb.status" @change="updateStatus(fb)" class="status-select">
                <option value="open">待处理</option>
                <option value="in_progress">处理中</option>
                <option value="closed">已解决</option>
              </select>
              <button class="btn btn-sm" @click="editProgress(fb)">📝 进度</button>
              <button class="btn btn-sm btn-danger" @click="deleteFeedback(fb.id)">🗑️</button>
            </div>
          </div>
          <!-- 进度编辑区 -->
          <div v-if="editingProgressId === fb.id" class="progress-edit">
            <textarea v-model="progressText" rows="2" placeholder="输入处理进度..."></textarea>
            <button class="btn btn-sm btn-primary" @click="saveProgress(fb.id)">保存</button>
            <button class="btn btn-sm" @click="editingProgressId = null">取消</button>
          </div>
          <div v-else-if="fb.progress" class="progress-display">🔧 {{ fb.progress }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FeedbackAdmin',
  data() {
    return {
      feedbacks: [],
      isAuthenticated: false,
      password: '',
      loginError: '',
      autoRefresh: true,
      refreshInterval: 30,
      lastRefreshTime: '',
      refreshTimer: null,
      currentFilter: 'all',
      statusFilter: 'all',
      typeFilter: 'all',
      editingProgressId: null,
      progressText: '',
      adminToken: '你的管理员token'   // 需与后端 ADMIN_TOKEN 一致
    }
  },
  computed: {
    filteredFeedbacks() {
      return this.feedbacks.filter(f => {
        const ms = this.statusFilter === 'all' || f.status === this.statusFilter;
        const mt = this.typeFilter === 'all' || f.feedback_type === this.typeFilter;
        return ms && mt;
      }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },
    totalCount() { return this.feedbacks.length },
    openCount() { return this.feedbacks.filter(f => f.status === 'open').length },
    closedCount() { return this.feedbacks.filter(f => f.status === 'closed').length },
    bugCount() { return this.feedbacks.filter(f => f.feedback_type === 'bug').length }
  },
  mounted() {
    this.checkAuth();
    if (this.isAuthenticated) this.initData();
  },
  beforeUnmount() { clearInterval(this.refreshTimer) },
  watch: {
    autoRefresh(val) { val ? this.startRefresh() : clearInterval(this.refreshTimer) },
    refreshInterval() { clearInterval(this.refreshTimer); if (this.autoRefresh) this.startRefresh() }
  },
  methods: {
    checkAuth() { this.isAuthenticated = localStorage.getItem('adminAuth') === '655254'; },
    checkPassword() {
      if (this.password === '655254') {
        this.isAuthenticated = true;
        localStorage.setItem('adminAuth', '655254');
        this.loginError = '';
        this.initData();
      } else {
        this.loginError = '密码错误';
      }
    },
    logout() {
      this.isAuthenticated = false;
      localStorage.removeItem('adminAuth');
      clearInterval(this.refreshTimer);
    },
    initData() { this.loadFeedbacks(); this.startRefresh(); },
    async loadFeedbacks() {
      try {
        const res = await fetch('http://api.inspurs.work/api/feedback/public/list');
        const data = await res.json();
        this.feedbacks = data.data || [];
        this.lastRefreshTime = new Date().toLocaleTimeString();
      } catch (e) { console.error(e) }
    },
    startRefresh() { this.refreshTimer = setInterval(() => this.loadFeedbacks(), this.refreshInterval * 1000); },
    setFilter(f) {
      this.currentFilter = f;
      if (f === 'open') this.statusFilter = 'open';
      else if (f === 'closed') this.statusFilter = 'closed';
      else if (f === 'bug') this.typeFilter = 'bug';
      else { this.statusFilter = 'all'; this.typeFilter = 'all'; }
    },
    async updateStatus(fb) {
      try {
        await fetch(`http://api.inspurs.work/api/feedback/${fb.id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + fb.status
          },
          body: JSON.stringify({ status: fb.status })
        });
      } catch (e) { alert('更新状态失败') }
    },
    editProgress(fb) {
      this.editingProgressId = fb.id;
      this.progressText = fb.progress || '';
    },
    async saveProgress(id) {
      try {
        await fetch(`http://api.inspurs.work/api/feedback/${id}/progress`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.adminToken
          },
          body: JSON.stringify({ progress: this.progressText })
        });
        const fb = this.feedbacks.find(f => f.id === id);
        if (fb) fb.progress = this.progressText;
        this.editingProgressId = null;
      } catch (e) { alert('保存进度失败') }
    },
    async deleteFeedback(id) {
      if (!confirm('确定删除？')) return;
      try {
        await fetch(`http://api.inspurs.work/api/feedback/${id}`, { method: 'DELETE' });
        this.feedbacks = this.feedbacks.filter(f => f.id !== id);
      } catch (e) { alert('删除失败') }
    },
    async clearAll() {
      if (!confirm('确定清空所有？不可恢复！')) return;
      try {
        await fetch('http://api.inspurs.work/api/feedback/clear', { method: 'DELETE' });
        this.feedbacks = [];
      } catch (e) { alert('清空失败') }
    },
    exportCSV() { /* 保留原有导出逻辑 */ },
    typeText(t) {
      const m = { bug:'🐛 BUG', suggestion:'💡 建议', balance:'⚖️ 平衡', ui:'🎨 UI', performance:'🚀 性能', other:'❓ 其他' };
      return m[t] || t;
    },
    severityText(s) {
      const m = { low:'🔵 低', medium:'🟡 中', high:'🟠 高', critical:'🔴 严重' };
      return m[s] || s;
    },
    formatDate(t) {
      if (!t) return '';
      const d = new Date(t);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    }
  }
}
</script>

<style scoped>
/* 沿用之前的样式，已适配 VitePress 变量，此处省略完整样式，请直接使用之前你调整好的 FeedbackAdmin 样式，
   并将进度编辑相关的样式添加进去 */
.progress-edit { margin-top: 10px; display: flex; gap: 10px; align-items: flex-start; }
.progress-edit textarea { flex: 1; background: var(--vp-c-bg); border: 1px solid var(--vp-c-divider); color: var(--vp-c-text-1); border-radius: 4px; padding: 6px; resize: vertical; }
.progress-display { margin-top: 5px; font-size: 0.9rem; color: var(--vp-c-brand); }
.status-select { background: var(--vp-c-bg-alt); color: var(--vp-c-text-1); border: 1px solid var(--vp-c-divider); border-radius: 4px; padding: 4px; }
/* 其他原有样式 ... */
</style>