<template>
  <div class="feedback-admin">
    <!-- 登录弹窗 -->
    <div v-if="!isAuthenticated" class="login-overlay">
      <div class="login-card">
        <div class="login-icon">🔐</div>
        <h2>管理员登录</h2>
        <p class="login-desc">输入密码以管理玩家反馈</p>
        <div class="form-group">
          <input
            type="password"
            v-model="password"
            placeholder="请输入管理员密码"
            @keyup.enter="checkPassword"
            class="login-input"
          />
        </div>
        <button class="btn btn-login" @click="checkPassword">登 录</button>
        <p v-if="loginError" class="login-error">{{ loginError }}</p>
      </div>
    </div>

    <!-- 主内容区 -->
    <div v-if="isAuthenticated" class="container">
      <header class="admin-header">
        <div>
          <h1>🎮 玩家反馈管理</h1>
          <p class="subtitle">所有玩家反馈实时显示</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-logout" @click="logout">🚪 退出</button>
        </div>

        <!-- 自动刷新 -->
        <div class="auto-refresh">
          <label>
            <input type="checkbox" v-model="autoRefresh" />
            🔄 自动刷新
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
          <span class="stat-num">{{ totalCount }}</span>
          <span class="stat-label">📋 全部</span>
        </div>
        <div class="stat-card" :class="{ active: currentFilter === 'open' }" @click="setFilter('open')">
          <span class="stat-num">{{ openCount }}</span>
          <span class="stat-label">🔓 待处理</span>
        </div>
        <div class="stat-card" :class="{ active: currentFilter === 'closed' }" @click="setFilter('closed')">
          <span class="stat-num">{{ closedCount }}</span>
          <span class="stat-label">✅ 已解决</span>
        </div>
        <div class="stat-card" :class="{ active: currentFilter === 'bug' }" @click="setFilter('bug')">
          <span class="stat-num">{{ bugCount }}</span>
          <span class="stat-label">🐛 BUG</span>
        </div>
      </div>

      <!-- 筛选与导出 -->
      <div class="toolbar">
        <div class="filters">
          <select v-model="statusFilter">
            <option value="all">全部状态</option>
            <option value="open">待处理</option>
            <option value="closed">已解决</option>
          </select>
          <select v-model="typeFilter">
            <option value="all">全部类型</option>
            <option value="bug">🐛 BUG报告</option>
            <option value="suggestion">💡 功能建议</option>
            <option value="balance">⚖️ 游戏平衡性</option>
            <option value="ui">🎨 界面/用户体验</option>
            <option value="performance">🚀 性能问题</option>
            <option value="other">❓ 其他</option>
          </select>
        </div>
        <div class="toolbar-actions">
          <button class="btn btn-export" @click="exportToCSV">📊 导出CSV</button>
          <button class="btn btn-danger" @click="clearAllFeedback" v-if="feedbacks.length">🗑️ 清空</button>
        </div>
      </div>

      <!-- 反馈列表 -->
      <div class="feedback-list">
        <div v-if="filteredFeedbacks.length === 0" class="empty">📭 暂无反馈</div>
        <div v-else class="list">
          <div
            v-for="fb in filteredFeedbacks"
            :key="fb.id"
            class="feedback-item"
            :class="'severity-' + fb.severity"
          >
            <div class="item-header">
              <span class="status-dot" :class="fb.status"></span>
              <strong>{{ fb.feedback_title }}</strong>
              <span class="type-badge">{{ getTypeLabel(fb.feedback_type) }}</span>
              <span class="severity-badge" :class="'sev-' + fb.severity">
                {{ getSeverityLabel(fb.severity) }}
              </span>
            </div>
            <div class="item-body">{{ fb.feedback_content }}</div>
            <div class="item-meta">
              <span>👤 {{ fb.player_name }}</span>
              <span>📅 {{ formatDate(fb.created_at) }}</span>
              <div class="item-actions">
                <button v-if="fb.status === 'open'" class="btn btn-success btn-sm" @click="closeFeedback(fb.id)">✅ 标记完成</button>
                <button v-else class="btn btn-secondary btn-sm" @click="reopenFeedback(fb.id)">🔓 重新打开</button>
                <button class="btn btn-danger btn-sm" @click="deleteFeedback(fb.id)">🗑️ 删除</button>
              </div>
            </div>
            <div class="item-details" v-if="fb.player_email || fb.game_version || fb.device_info">
              <span v-if="fb.player_email">📧 {{ fb.player_email }}</span>
              <span v-if="fb.game_version">🎮 {{ fb.game_version }}</span>
              <span v-if="fb.device_info">💻 {{ fb.device_info }}</span>
            </div>
          </div>
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
      lastRefreshTime: '刚刚',
      refreshTimer: null,
      baseURL: "http://api.inspurs.work",
      currentFilter: 'all',
      statusFilter: 'all',
      typeFilter: 'all',
    }
  },
  computed: {
    filteredFeedbacks() {
      return this.feedbacks.filter(f => {
        const matchStatus = this.statusFilter === 'all' || f.status === this.statusFilter;
        const matchType = this.typeFilter === 'all' || f.feedback_type === this.typeFilter;
        return matchStatus && matchType;
      }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },
    totalCount() { return this.feedbacks.length },
    openCount() { return this.feedbacks.filter(f => f.status === 'open').length },
    closedCount() { return this.feedbacks.filter(f => f.status === 'closed').length },
    bugCount() { return this.feedbacks.filter(f => f.feedback_type === 'bug').length },
  },
  mounted() {
    this.checkAuthStatus();
    if (this.isAuthenticated) {
      this.loadFeedbacks();
      this.startAutoRefresh();
    }
  },
  beforeUnmount() { this.stopAutoRefresh() },
  watch: {
    autoRefresh(val) { val ? this.startAutoRefresh() : this.stopAutoRefresh() },
    refreshInterval() { this.stopAutoRefresh(); if (this.autoRefresh) this.startAutoRefresh() }
  },
  methods: {
    checkAuthStatus() {
      this.isAuthenticated = localStorage.getItem('feedbackAdminAuth') === '655254';
    },
    checkPassword() {
      if (this.password === '655254') {
        this.isAuthenticated = true;
        localStorage.setItem('feedbackAdminAuth', '655254');
        this.loginError = '';
        this.loadFeedbacks();
        this.startAutoRefresh();
      } else {
        this.loginError = '密码错误，请重试';
      }
    },
    logout() {
      this.isAuthenticated = false;
      localStorage.removeItem('feedbackAdminAuth');
      this.stopAutoRefresh();
    },
    async loadFeedbacks() {
      try {
        const res = await fetch(this.baseURL + "/api/feedback/list");
        const result = await res.json();
        this.feedbacks = result.data || [];
        this.lastRefreshTime = new Date().toLocaleTimeString();
      } catch (e) { console.error("加载失败", e) }
    },
    async closeFeedback(id) { await this.updateFeedback(id, { status: "closed" }) },
    async reopenFeedback(id) { await this.updateFeedback(id, { status: "open" }) },
    async updateFeedback(id, data) {
      try {
        await fetch(this.baseURL + `/api/feedback/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        this.loadFeedbacks();
      } catch (e) { alert("操作失败") }
    },
    async deleteFeedback(id) {
      if (!confirm("确定删除？")) return;
      try {
        await fetch(this.baseURL + `/api/feedback/${id}`, { method: "DELETE" });
        this.loadFeedbacks();
      } catch (e) { alert("删除失败") }
    },
    async clearAllFeedback() {
      if (!confirm("确定清空所有反馈？此操作不可恢复！")) return;
      try {
        await fetch(this.baseURL + "/api/feedback/clear", { method: "DELETE" });
        this.feedbacks = [];
      } catch (e) { alert("清空失败") }
    },
    startAutoRefresh() {
      this.stopAutoRefresh();
      if (this.autoRefresh) this.refreshTimer = setInterval(() => this.loadFeedbacks(), this.refreshInterval * 1000);
    },
    stopAutoRefresh() { clearInterval(this.refreshTimer) },
    setFilter(filter) {
      this.currentFilter = filter;
      if (filter === "open") this.statusFilter = "open";
      else if (filter === "closed") this.statusFilter = "closed";
      else if (filter === "bug") this.typeFilter = "bug";
      else { this.statusFilter = "all"; this.typeFilter = "all"; }
    },
    getTypeLabel(t) {
      const map = { bug:'🐛 BUG报告', suggestion:'💡 功能建议', balance:'⚖️ 游戏平衡性', ui:'🎨 界面/用户体验', performance:'🚀 性能问题', other:'❓ 其他' };
      return map[t] || t;
    },
    getSeverityLabel(s) {
      const m = { low:'🔵 低', medium:'🟡 中', high:'🟠 高', critical:'🔴 严重' };
      return m[s] || s;
    },
    formatDate(t) {
      const d = new Date(t);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    },
    exportToCSV() {
      if (!this.feedbacks.length) return alert("无数据");
      const headers = ["时间","玩家","邮箱","标题","类型","版本","设备","内容","等级","状态"];
      const rows = this.feedbacks.map(f => [
        this.formatDate(f.created_at), f.player_name, f.player_email||'',
        f.feedback_title, this.getTypeLabel(f.feedback_type), f.game_version||'',
        f.device_info||'', `"${(f.feedback_content||'').replace(/"/g, '""')}"`,
        this.getSeverityLabel(f.severity), f.status==="open"?"待处理":"已解决"
      ]);
      const csv = "\uFEFF" + [headers,...rows].map(i=>i.join(',')).join('\n');
      const blob = new Blob([csv], { type:"text/csv;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `玩家反馈_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
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

/* ========== 登录弹窗美化 ========== */
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
.admin-header h1 {
  margin: 0;
  font-size: 1.6rem;
  color: var(--vp-c-brand);
}
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
  /* 基础外观 */
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 8px 32px 8px 12px; /* 右侧留出箭头空间 */
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  appearance: none; /* 移除默认箭头 */
  -webkit-appearance: none;
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 14px;
  /* 使用内联 SVG 作为自定义箭头，颜色跟随文字 */
  background-image: url("data:image/svg+xml,%3Csvg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  transition: border-color 0.2s, box-shadow 0.2s;
}



.filters select:hover {
  border-color: var(--vp-c-brand);
}

.filters select:focus {
  outline: none;
  border-color: var(--vp-c-brand);
  box-shadow: 0 0 0 2px var(--vp-c-brand-light);
}

/* 选项样式（在下拉列表中） */
.filters select option {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  padding: 8px;
}

/* 针对 Windows 高对比度或某些浏览器，确保 option 背景不为白色 */
@media (prefers-color-scheme: dark) {
  .filters select option {
    background: #1e1e1e;
    color: #e0e0e0;
  }
  
  /* 新增：暗色下的浅色箭头 */
  .filters select {
    background-image: url("data:image/svg+xml,%3Csvg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23cccccc' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  }
}

.toolbar-actions { display: flex; gap: 10px; }

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
.item-body { margin-bottom: 10px; line-height: 1.5; }
.item-meta {
  display: flex; align-items: center; flex-wrap: wrap; gap: 15px;
  font-size: 0.85rem; color: var(--vp-c-text-2);
}
.item-actions { margin-left: auto; display: flex; gap: 6px; }
.item-details {
  margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--vp-c-divider);
  font-size: 0.8rem; color: var(--vp-c-text-2); display: flex; gap: 15px; flex-wrap: wrap;
}

@media (max-width: 640px) {
  .stats { grid-template-columns: repeat(2, 1fr); }
  .toolbar { flex-direction: column; align-items: stretch; }
  .filters { flex-wrap: wrap; }
}
</style>