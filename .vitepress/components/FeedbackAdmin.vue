<template>
  <div class="feedback-admin">
    <!-- 登录弹窗 -->
    <div v-if="!isAuthenticated" class="login-overlay">
      <div class="login-card">
        <div class="login-icon">🔐</div>
        <h2>管理员登录</h2>
        <p class="login-desc">输入管理密码以查看反馈</p>
        <input
          type="password"
          v-model="password"
          placeholder="管理员密码"
          class="login-input"
          @keyup.enter="checkPassword"
        />
        <button class="btn btn-login" @click="checkPassword">登 录</button>
        <p v-if="loginError" class="login-error">{{ loginError }}</p>
      </div>
    </div>

    <div v-else class="container">
      <header class="admin-header">
        <div>
          <h1>🎮 玩家反馈管理</h1>
          <p class="subtitle">实时显示所有反馈（包含隐藏内容）</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-logout" @click="logout">🚪 退出</button>
        </div>
        <div class="auto-refresh">
          <label>
            <input type="checkbox" v-model="autoRefresh" /> 🔄 自动刷新
          </label>
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

      <!-- 筛选与导出 -->
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
          <button class="btn btn-danger" @click="clearAll" v-if="feedbacks.length">🗑️ 清空所有</button>
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
            <span v-if="fb.hidden" class="hidden-badge">👁️‍🗨️ 已隐藏</span>
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
      adminToken: 'wyt655254'   // 与后端 ADMIN_TOKEN 一致
    }
  },
  computed: {
    filteredFeedbacks() {
      return this.feedbacks
        .filter(f => {
          const ms = this.statusFilter === 'all' || f.status === this.statusFilter
          const mt = this.typeFilter === 'all' || f.feedback_type === this.typeFilter
          return ms && mt
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    },
    totalCount() { return this.feedbacks.length },
    openCount() { return this.feedbacks.filter(f => f.status === 'open').length },
    closedCount() { return this.feedbacks.filter(f => f.status === 'closed').length },
    bugCount() { return this.feedbacks.filter(f => f.feedback_type === 'bug').length }
  },
  mounted() {
    this.checkAuth()
    if (this.isAuthenticated) this.initData()
  },
  beforeUnmount() { clearInterval(this.refreshTimer) },
  watch: {
    autoRefresh(val) { val ? this.startRefresh() : clearInterval(this.refreshTimer) },
    refreshInterval() { clearInterval(this.refreshTimer); if (this.autoRefresh) this.startRefresh() }
  },
  methods: {
    checkAuth() {
      this.isAuthenticated = localStorage.getItem('adminAuth') === '655254'
    },
    checkPassword() {
      if (this.password === '655254') {
        this.isAuthenticated = true
        localStorage.setItem('adminAuth', '655254')
        this.loginError = ''
        this.initData()
      } else {
        this.loginError = '密码错误'
      }
    },
    logout() {
      this.isAuthenticated = false
      localStorage.removeItem('adminAuth')
      clearInterval(this.refreshTimer)
    },
    initData() {
      this.loadFeedbacks()
      this.startRefresh()
    },
    async loadFeedbacks() {
      try {
        const res = await fetch('https://www.inspurs.work/api/feedback/public/list', {
          headers: { 'Authorization': 'Bearer ' + this.adminToken }
        })
        const data = await res.json()
        this.feedbacks = data.data || []
        this.lastRefreshTime = new Date().toLocaleTimeString()
      } catch (e) {
        console.error('加载失败', e)
      }
    },
    startRefresh() {
      this.refreshTimer = setInterval(() => this.loadFeedbacks(), this.refreshInterval * 1000)
    },
    setFilter(f) {
      this.currentFilter = f
      if (f === 'open') this.statusFilter = 'open'
      else if (f === 'closed') this.statusFilter = 'closed'
      else if (f === 'bug') this.typeFilter = 'bug'
      else { this.statusFilter = 'all'; this.typeFilter = 'all' }
    },
    async updateStatus(fb) {
      try {
        await fetch(`https://www.inspurs.work/api/feedback/${fb.id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.adminToken
          },
          body: JSON.stringify({ status: fb.status })
        })
      } catch (e) {
        alert('更新状态失败')
      }
    },
    editProgress(fb) {
      this.editingProgressId = fb.id
      this.progressText = fb.progress || ''
    },
    async saveProgress(id) {
      try {
        await fetch(`https://www.inspurs.work/api/feedback/${id}/progress`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.adminToken
          },
          body: JSON.stringify({ progress: this.progressText })
        })
        const fb = this.feedbacks.find(f => f.id === id)
        if (fb) fb.progress = this.progressText
        this.editingProgressId = null
      } catch (e) {
        alert('保存进度失败')
      }
    },
    async deleteFeedback(id) {
      if (!confirm('确定删除该反馈吗？')) return
      try {
        await fetch(`https://www.inspurs.work/api/feedback/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + this.adminToken }
        })
        this.feedbacks = this.feedbacks.filter(f => f.id !== id)
      } catch (e) {
        alert('删除失败')
      }
    },
    async clearAll() {
      if (!confirm('确定清空所有反馈吗？此操作不可恢复！')) return
      try {
        await fetch(`https://www.inspurs.work/api/feedback/clear`, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + this.adminToken }
        })
        this.feedbacks = []
      } catch (e) {
        alert('清空失败')
      }
    },
    exportCSV() {
      if (!this.feedbacks.length) return alert('无数据')
      const headers = ['时间', '玩家', '邮箱', '标题', '类型', '版本', '设备', '内容', '等级', '状态', '进度']
      const rows = this.feedbacks.map(f => [
        this.formatDate(f.created_at),
        f.player_name || '',
        f.player_email || '',
        f.feedback_title,
        this.typeText(f.feedback_type),
        f.game_version || '',
        f.device_info || '',
        `"${(f.feedback_content || '').replace(/"/g, '""')}"`,
        this.severityText(f.severity),
        f.status === 'open' ? '待处理' : f.status === 'in_progress' ? '处理中' : '已解决',
        f.progress || ''
      ])
      const csv = '\uFEFF' + [headers, ...rows].map(r => r.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `玩家反馈_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
    },
    typeText(t) {
      const m = { bug: '🐛 BUG', suggestion: '💡 建议', balance: '⚖️ 平衡', ui: '🎨 UI', performance: '🚀 性能', other: '❓ 其他' }
      return m[t] || t
    },
    severityText(s) {
      const m = { low: '🔵 低', medium: '🟡 中', high: '🟠 高', critical: '🔴 严重' }
      return m[s] || s
    },
    formatDate(t) {
      if (!t) return ''
      const d = new Date(t)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    }
  }
}
</script>

<style scoped>
/* 完全使用 VitePress 主题变量，自动适配亮色/暗色 */
.feedback-admin {
  --vp-c-bg: var(--vp-c-bg);
  --vp-c-bg-soft: var(--vp-c-bg-soft);
  --vp-c-bg-alt: var(--vp-c-bg-alt);
  --vp-c-text-1: var(--vp-c-text-1);
  --vp-c-text-2: var(--vp-c-text-2);
  --vp-c-divider: var(--vp-c-divider);
  --vp-c-brand: var(--vp-c-brand);
  --vp-c-brand-light: var(--vp-c-brand-light);
  --vp-c-brand-dark: var(--vp-c-brand-dark);

  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  min-height: 100vh;
  font-family: inherit;
}

/* ========== 登录弹窗 ========== */
.login-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.login-card {
  background: var(--vp-c-bg-soft);
  border-radius: 16px;
  padding: 40px;
  width: 90%;
  max-width: 380px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  border: 1px solid var(--vp-c-divider);
}
.login-icon {
  font-size: 3rem;
  margin-bottom: 10px;
}
.login-card h2 {
  margin: 0 0 5px;
  font-size: 1.5rem;
  color: var(--vp-c-text-1);
}
.login-desc {
  color: var(--vp-c-text-2);
  margin-bottom: 20px;
  font-size: 0.9rem;
}
.login-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}
.login-input:focus {
  border-color: var(--vp-c-brand);
}
.btn-login {
  width: 100%;
  margin-top: 15px;
  padding: 12px;
  background: var(--vp-c-brand);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-login:hover {
  background: var(--vp-c-brand-dark);
}
.login-error {
  color: #d63031;
  margin-top: 10px;
  font-size: 0.85rem;
}

/* ========== 通用按钮 ========== */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: opacity 0.2s;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}
.btn:hover { opacity: 0.85; }
.btn-sm { padding: 4px 10px; font-size: 0.8rem; }
.btn-logout { background: #fd79a8; color: white; border: none; }
.btn-export { background: var(--vp-c-brand); color: white; border: none; }
.btn-success { background: #00b894; color: white; border: none; }
.btn-secondary { background: #636e72; color: white; border: none; }
.btn-danger { background: #d63031; color: white; border: none; }

/* ========== 头部 ========== */
.admin-header {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}
.admin-header h1 { margin: 0; font-size: 1.6rem; color: var(--vp-c-brand); }
.subtitle { color: var(--vp-c-text-2); margin: 5px 0 0; }
.header-actions { display: flex; gap: 10px; }
.auto-refresh {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}
.auto-refresh select {
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  padding: 4px 8px;
}

/* ========== 统计卡片 ========== */
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}
.stat-card {
  background: var(--vp-c-bg-soft);
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: 0.2s;
  border-color: var(--vp-c-divider);
}
.stat-card.active { border-color: var(--vp-c-brand); }
.stat-card:hover { background: var(--vp-c-bg-alt); }
.stat-num { font-size: 1.8rem; font-weight: bold; color: var(--vp-c-brand); }
.stat-label { display: block; color: var(--vp-c-text-2); font-size: 0.85rem; }

/* ========== 工具栏 ========== */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 15px;
}
.filters { display: flex; gap: 10px; }
.filters select {
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 6px 10px;
}

/* ========== 反馈列表 ========== */
.feedback-list {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
}
.empty { padding: 60px 0; text-align: center; color: var(--vp-c-text-2); }
.feedback-item {
  padding: 20px;
  border-bottom: 1px solid var(--vp-c-divider);
}
.feedback-item:last-child { border-bottom: none; }
.item-header {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.status-dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: #6c757d;
}
.status-dot.open { background: #28a745; }
.type-badge, .severity-badge {
  padding: 2px 8px; border-radius: 20px; font-size: 0.75rem;
  background: var(--vp-c-bg-alt); color: var(--vp-c-text-2);
}
.severity-badge.sev-low { background: #00b894; color: white; }
.severity-badge.sev-medium { background: #fdcb6e; color: black; }
.severity-badge.sev-high { background: #e17055; color: white; }
.severity-badge.sev-critical { background: #d63031; color: white; }
.hidden-badge { background: #636e72; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; }
.item-body { margin-bottom: 10px; line-height: 1.5; }
.item-footer {
  display: flex; align-items: center; flex-wrap: wrap; gap: 15px;
  font-size: 0.85rem; color: var(--vp-c-text-2);
}
.item-actions { margin-left: auto; display: flex; gap: 6px; }
.status-select {
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  padding: 4px;
}

.progress-edit {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.progress-edit textarea {
  flex: 1;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  border-radius: 4px;
  padding: 6px;
  resize: vertical;
}
.progress-display {
  margin-top: 5px;
  font-size: 0.9rem;
  color: var(--vp-c-brand);
}

@media (max-width: 640px) {
  .stats { grid-template-columns: repeat(2, 1fr); }
  .toolbar { flex-direction: column; align-items: stretch; }
  .filters { flex-wrap: wrap; }
}
</style>