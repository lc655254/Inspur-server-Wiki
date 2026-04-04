<template>
  <div class="feedback-admin" :class="{ dark: isDarkMode }">
    <!-- 密码输入模态框 -->
    <div v-if="!isAuthenticated" class="login-modal">
      <div class="login-container">
        <h2>🔐 管理员登录</h2>
        <div class="form-group">
          <label for="password">管理员密码</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            placeholder="请输入管理员密码"
            @keyup.enter="checkPassword"
          >
        </div>
        <button class="btn btn-primary" @click="checkPassword">🔑 登录</button>
      </div>
    </div>
    
    <!-- 主内容区域 -->
    <div v-if="isAuthenticated" class="container">
      <header class="admin-header">
        <div class="header-content">
          <div>
            <h1>🎮 玩家反馈管理</h1>
            <p class="subtitle">所有玩家反馈将实时显示在此处</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-theme" @click="toggleDarkMode">
              {{ isDarkMode ? '☀️ 亮色模式' : '🌙 深色模式' }}
            </button>
            <button class="btn btn-logout" @click="logout">🚪 退出登录</button>
          </div>
        </div>
        
        <!-- 自动刷新控制 -->
        <div class="auto-refresh-controls">
          <div class="refresh-toggle">
            <input type="checkbox" id="autoRefresh" v-model="autoRefresh">
            <label for="autoRefresh">🔄 自动刷新</label>
          </div>
          <div class="refresh-interval" v-if="autoRefresh">
            <label>刷新间隔:</label>
            <select v-model="refreshInterval">
              <option :value="10">10秒</option>
              <option :value="30">30秒</option>
              <option :value="60">1分钟</option>
            </select>
            <span class="last-refresh">最后刷新: {{ lastRefreshTime }}</span>
          </div>
        </div>
      </header>
      
      <!-- 统计信息 -->
      <div class="admin-stats">
        <div class="stat-card" @click="setFilter('all')" :class="{ active: currentFilter === 'all' }">
          <h3>{{ totalCount }}</h3>
          <p>📋 全部反馈</p>
        </div>
        <div class="stat-card" @click="setFilter('open')" :class="{ active: currentFilter === 'open' }">
          <h3>{{ openCount }}</h3>
          <p>🔓 待处理</p>
        </div>
        <div class="stat-card" @click="setFilter('closed')" :class="{ active: currentFilter === 'closed' }">
          <h3>{{ closedCount }}</h3>
          <p>✅ 已解决</p>
        </div>
        <div class="stat-card" @click="setFilter('bug')" :class="{ active: currentFilter === 'bug' }">
          <h3>{{ bugCount }}</h3>
          <p>🐛 BUG报告</p>
        </div>
      </div>
      
      <!-- 反馈列表 -->
      <div class="feedback-list-container">
        <div class="list-header">
          <div class="filters">
            <div class="filter-group">
              <label>状态:</label>
              <select v-model="statusFilter">
                <option value="all">全部状态</option>
                <option value="open">🔓 待处理</option>
                <option value="closed">✅ 已解决</option>
              </select>
            </div>
            <div class="filter-group">
              <label>类型:</label>
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
          </div>
          <div class="actions">
            <button class="btn btn-export" @click="exportToCSV">📊 导出CSV</button>
            <button class="btn btn-danger" @click="clearAllFeedback" v-if="feedbacks.length > 0">🗑️ 清空所有</button>
          </div>
        </div>
        
        <div class="feedback-list">
          <div v-if="filteredFeedbacks.length === 0" class="empty-state">
            <p>📭 暂无反馈数据</p>
          </div>
          <div v-else>
            <div class="feedback-item" v-for="feedback in filteredFeedbacks" :key="feedback.id" 
                 :class="['severity-' + feedback.severity, 'status-' + feedback.status]">
              <div class="feedback-main">
                <div class="feedback-header">
                  <h3 class="feedback-title">
                    <span class="status-indicator" :class="feedback.status"></span>
                    {{ feedback.feedback_title }}
                  </h3>
                  <div class="feedback-meta">
                    <span class="feedback-type">{{ getTypeLabel(feedback.feedback_type) }}</span>
                    <span class="severity-badge" :class="'severity-' + feedback.severity">
                      {{ getSeverityLabel(feedback.severity) }}
                    </span>
                  </div>
                </div>
                <div class="feedback-content">
                  <p>{{ feedback.feedback_content }}</p>
                </div>
                <div class="feedback-footer">
                  <div class="feedback-author">
                    <span class="player-name">👤 {{ feedback.player_name }}</span>
                    <span class="timestamp">📅 {{ formatDate(feedback.created_at) }}</span>
                  </div>
                  <div class="feedback-actions">
                    <button v-if="feedback.status === 'open'" 
                            class="btn btn-success btn-sm" 
                            @click="closeFeedback(feedback.id)">
                      ✅ 标记为已完成
                    </button>
                    <button v-else 
                            class="btn btn-secondary btn-sm" 
                            @click="reopenFeedback(feedback.id)">
                      🔓 重新打开
                    </button>
                    <button class="btn btn-danger btn-sm" @click="deleteFeedback(feedback.id)">🗑️ 删除</button>
                  </div>
                </div>
                <div class="feedback-details" v-if="feedback.player_email || feedback.game_version || feedback.device_info">
                  <div v-if="feedback.player_email"><strong>📧 联系方式:</strong> {{ feedback.player_email }}</div>
                  <div v-if="feedback.game_version"><strong>🎮 游戏版本:</strong> {{ feedback.game_version }}</div>
                  <div v-if="feedback.device_info"><strong>💻 设备信息:</strong> {{ feedback.device_info }}</div>
                </div>
              </div>
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
      autoRefresh: true,
      refreshInterval: 30,
      lastRefreshTime: '刚刚',
      refreshTimer: null,
      baseURL: "http://api.inspurs.work",
      currentFilter: 'all',
      statusFilter: 'all',
      typeFilter: 'all',
      severityFilter: 'all',
      isDarkMode: false
    }
  },
  computed: {
    filteredFeedbacks() {
      return this.feedbacks.filter(feedback => {
        const statusMatch = this.statusFilter === 'all' || feedback.status === this.statusFilter;
        const typeMatch = this.typeFilter === 'all' || feedback.feedback_type === this.typeFilter;
        const severityMatch = this.severityFilter === 'all' || feedback.severity === this.severityFilter;
        return statusMatch && typeMatch && severityMatch;
      }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },
    totalCount() { return this.feedbacks.length; },
    openCount() { return this.feedbacks.filter(f => f.status === 'open').length; },
    closedCount() { return this.feedbacks.filter(f => f.status === 'closed').length; },
    bugCount() { return this.feedbacks.filter(f => f.feedback_type === 'bug').length; }
  },
  mounted() {
    this.loadThemePreference();
    this.checkAuthStatus();
    if (this.isAuthenticated) {
      this.loadFeedbacks();
      this.startAutoRefresh();
    }
  },
  beforeUnmount() { this.stopAutoRefresh(); },
  watch: {
    autoRefresh(newVal) { newVal ? this.startAutoRefresh() : this.stopAutoRefresh(); },
    refreshInterval() { this.stopAutoRefresh(); if (this.autoRefresh) this.startAutoRefresh(); }
  },
  methods: {
    // 主题相关
    loadThemePreference() {
      const saved = localStorage.getItem('feedbackAdminTheme');
      if (saved !== null) {
        this.isDarkMode = saved === 'dark';
      } else {
        this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    },
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      localStorage.setItem('feedbackAdminTheme', this.isDarkMode ? 'dark' : 'light');
    },
    // 原有方法
    checkAuthStatus() {
      const auth = localStorage.getItem('feedbackAdminAuth');
      this.isAuthenticated = auth === '655254';
    },
    checkPassword() {
      if (this.password === '655254') {
        this.isAuthenticated = true;
        localStorage.setItem('feedbackAdminAuth', '655254');
        this.loadFeedbacks();
        this.startAutoRefresh();
      } else {
        alert('密码错误！');
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
      } catch (e) {
        console.error("加载失败", e);
      }
    },
    async closeFeedback(id) {
      await this.updateFeedback(id, { status: "closed" });
    },
    async reopenFeedback(id) {
      await this.updateFeedback(id, { status: "open" });
    },
    async updateFeedback(id, data) {
      try {
        await fetch(this.baseURL + `/api/feedback/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        this.loadFeedbacks();
      } catch (e) { alert("操作失败"); }
    },
    async deleteFeedback(id) {
      if (!confirm("确定删除？")) return;
      try {
        await fetch(this.baseURL + `/api/feedback/${id}`, { method: "DELETE" });
        this.loadFeedbacks();
      } catch (e) { alert("删除失败"); }
    },
    async clearAllFeedback() {
      if (!confirm("确定清空所有？不可恢复！")) return;
      try {
        await fetch(this.baseURL + "/api/feedback/clear", { method: "DELETE" });
        this.feedbacks = [];
      } catch (e) { alert("清空失败"); }
    },
    startAutoRefresh() {
      this.stopAutoRefresh();
      if (this.autoRefresh) {
        this.refreshTimer = setInterval(() => this.loadFeedbacks(), this.refreshInterval * 1000);
      }
    },
    stopAutoRefresh() {
      clearInterval(this.refreshTimer);
    },
    setFilter(filter) {
      this.currentFilter = filter;
      if (filter === "open") this.statusFilter = "open";
      else if (filter === "closed") this.statusFilter = "closed";
      else if (filter === "bug") this.typeFilter = "bug";
      else { this.statusFilter = "all"; this.typeFilter = "all"; }
    },
    getTypeLabel(type) {
      const map = { bug:'🐛 BUG报告', suggestion:'💡 功能建议', balance:'⚖️ 游戏平衡性', ui:'🎨 界面/用户体验', performance:'🚀 性能问题', other:'❓ 其他' };
      return map[type] || type;
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
/* 亮色主题变量（默认） */
.feedback-admin {
  --bg-primary: #f6f8fa;
  --bg-card: #ffffff;
  --bg-modal: #ffffff;
  --text-primary: #24292e;
  --text-secondary: #586069;
  --border-color: #e1e4e8;
  --shadow: 0 2px 10px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 30px rgba(0,0,0,0.2);
  --stat-hover-bg: #f0f3ff;
  --stat-active-border: #6c5ce7;
  --list-bg: #ffffff;
  --empty-text: #6a737d;
  
  min-height: 100vh;
  background-color: var(--bg-primary);
  transition: background-color 0.3s, color 0.2s;
}

/* 深色主题变量 */
.feedback-admin.dark {
  --bg-primary: #0d1117;
  --bg-card: #161b22;
  --bg-modal: #1f242f;
  --text-primary: #c9d1d9;
  --text-secondary: #8b949e;
  --border-color: #30363d;
  --shadow: 0 2px 10px rgba(0,0,0,0.3);
  --shadow-lg: 0 10px 30px rgba(0,0,0,0.5);
  --stat-hover-bg: #1f242e;
  --stat-active-border: #8b5cf6;
  --list-bg: #161b22;
  --empty-text: #8b949e;
}

/* ========== 所有组件样式使用 CSS 变量 ========== */
.login-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.login-container {
  background: var(--bg-modal);
  padding: 30px;
  border-radius: 10px;
  box-shadow: var(--shadow-lg);
  width: 90%;
  max-width: 400px;
}

.login-container h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #6c5ce7;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.admin-header {
  background: var(--bg-card);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: var(--shadow);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

h1 {
  color: #6c5ce7;
  margin-bottom: 5px;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.auto-refresh-controls {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.refresh-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
}

.refresh-interval {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
}

.last-refresh {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-left: 10px;
}

.btn {
  padding: 10px 15px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.btn-primary {
  background-color: #6c5ce7;
  color: white;
}
.btn-primary:hover {
  background-color: #5b4bd4;
}
.btn-success {
  background-color: #00b894;
  color: white;
}
.btn-success:hover {
  background-color: #00a085;
}
.btn-secondary {
  background-color: #636e72;
  color: white;
}
.btn-secondary:hover {
  background-color: #2d3436;
}
.btn-danger {
  background-color: #d63031;
  color: white;
}
.btn-danger:hover {
  background-color: #c23636;
}
.btn-export {
  background-color: #0984e3;
  color: white;
}
.btn-export:hover {
  background-color: #0770c4;
}
.btn-logout {
  background-color: #fd79a8;
  color: white;
}
.btn-logout:hover {
  background-color: #e84393;
}
.btn-theme {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}
.btn-theme:hover {
  background-color: var(--stat-hover-bg);
}
.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.admin-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.stat-card {
  background: var(--bg-card);
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
  box-shadow: var(--shadow);
}
.stat-card:hover {
  transform: translateY(-2px);
  background-color: var(--stat-hover-bg);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}
.stat-card.active {
  border-color: var(--stat-active-border);
  background-color: var(--stat-hover-bg);
}
.stat-card h3 {
  font-size: 1.8rem;
  margin-bottom: 5px;
  color: #6c5ce7;
}
.stat-card p {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.feedback-list-container {
  background: var(--list-bg);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: var(--shadow);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  flex-wrap: wrap;
  gap: 15px;
}
.filters {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}
.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.filter-group label {
  margin-bottom: 0;
  white-space: nowrap;
  font-size: 14px;
  color: var(--text-primary);
}
.filter-group select {
  width: auto;
  min-width: 120px;
  padding: 8px 12px;
  font-size: 14px;
  background-color: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
}
.actions {
  display: flex;
  gap: 10px;
}

.feedback-list {
  padding: 0;
}
.feedback-item {
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.3s;
}
.feedback-item:hover {
  background-color: var(--stat-hover-bg);
}
.feedback-item.status-closed {
  opacity: 0.7;
}
.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 10px;
}
.feedback-title {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}
.status-indicator {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.status-indicator.open {
  background-color: #28a745;
}
.status-indicator.closed {
  background-color: #6c757d;
}
.feedback-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.feedback-type {
  background-color: var(--border-color);
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  color: var(--text-primary);
}
.severity-badge {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  color: white;
  font-weight: bold;
}
.severity-badge.severity-critical { background-color: #d63031; }
.severity-badge.severity-high { background-color: #e17055; }
.severity-badge.severity-medium { background-color: #fdcb6e; color: #2d3436; }
.severity-badge.severity-low { background-color: #00b894; }

.feedback-content {
  margin-bottom: 15px;
  line-height: 1.5;
  color: var(--text-primary);
}
.feedback-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}
.feedback-author {
  display: flex;
  gap: 15px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}
.player-name {
  font-weight: 600;
}
.timestamp {
  color: var(--text-secondary);
}
.feedback-actions {
  display: flex;
  gap: 8px;
}
.feedback-details {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid var(--border-color);
  font-size: 0.9rem;
  color: var(--text-secondary);
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--empty-text);
}
.empty-state p {
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  .admin-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  .list-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .filters {
    width: 100%;
  }
  .filter-group {
    flex: 1;
    min-width: 120px;
  }
  .filter-group select {
    width: 100%;
  }
  .actions {
    width: 100%;
    justify-content: flex-end;
  }
  .feedback-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .feedback-footer {
    flex-direction: column;
    align-items: flex-start;
  }
  .feedback-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>