<template>
  <div class="feedback-admin">
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
        <p class="hint">提示: 登录后刷新页面不需要重新输入密码</p>
      </div>
    </div>
    
    <!-- 主内容区域 -->
    <div v-if="isAuthenticated" class="container">
      <!-- 头部区域 -->
      <header class="admin-header">
        <div class="header-content">
          <h1>🎮 玩家反馈管理</h1>
          <p class="subtitle">类似GitHub Issue的反馈管理系统</p>
          
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
                <option :value="300">5分钟</option>
              </select>
              <span class="last-refresh">最后刷新: {{ lastRefreshTime }}</span>
            </div>
            <button class="btn btn-logout" @click="logout">🚪 退出登录</button>
          </div>
        </div>
        
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
      </header>
      
      <!-- 反馈列表 -->
      <div class="feedback-list-container">
        <!-- 筛选和操作栏 -->
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
            
            <div class="filter-group">
              <label>严重程度:</label>
              <select v-model="severityFilter">
                <option value="all">全部等级</option>
                <option value="critical">🔴 严重</option>
                <option value="high">🟠 高</option>
                <option value="medium">🟡 中</option>
                <option value="low">🔵 低</option>
              </select>
            </div>
          </div>
          
          <div class="actions">
            <button class="btn btn-export" @click="exportToCSV">📊 导出CSV</button>
            <button class="btn btn-danger" @click="clearAllFeedback" v-if="feedbacks.length > 0">🗑️ 清空所有</button>
          </div>
        </div>
        
        <!-- 反馈列表 -->
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
                    {{ feedback.feedbackTitle }}
                  </h3>
                  <div class="feedback-meta">
                    <span class="feedback-type">{{ getTypeLabel(feedback.feedbackType) }}</span>
                    <span class="severity-badge" :class="'severity-' + feedback.severity">
                      {{ getSeverityLabel(feedback.severity) }}
                    </span>
                  </div>
                </div>
                
                <div class="feedback-content">
                  <p>{{ feedback.feedbackContent }}</p>
                </div>
                
                <div class="feedback-footer">
                  <div class="feedback-author">
                    <span class="player-name">👤 {{ feedback.playerName }}</span>
                    <span class="timestamp">📅 {{ formatDate(feedback.timestamp) }}</span>
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
                
                <div class="feedback-details" v-if="feedback.playerEmail || feedback.gameVersion || feedback.deviceInfo">
                  <div v-if="feedback.playerEmail">
                    <strong>📧 联系方式:</strong> {{ feedback.playerEmail }}
                  </div>
                  <div v-if="feedback.gameVersion">
                    <strong>🎮 游戏版本:</strong> {{ feedback.gameVersion }}
                  </div>
                  <div v-if="feedback.deviceInfo">
                    <strong>💻 设备信息:</strong> {{ feedback.deviceInfo }}
                  </div>
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
      
      // 筛选条件
      currentFilter: 'all',
      statusFilter: 'all',
      typeFilter: 'all',
      severityFilter: 'all'
    }
  },
  computed: {
    filteredFeedbacks() {
      return this.feedbacks.filter(feedback => {
        const statusMatch = this.statusFilter === 'all' || feedback.status === this.statusFilter;
        const typeMatch = this.typeFilter === 'all' || feedback.feedbackType === this.typeFilter;
        const severityMatch = this.severityFilter === 'all' || feedback.severity === this.severityFilter;
        
        return statusMatch && typeMatch && severityMatch;
      }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },
    
    totalCount() {
      return this.feedbacks.length;
    },
    
    openCount() {
      return this.feedbacks.filter(f => f.status === 'open').length;
    },
    
    closedCount() {
      return this.feedbacks.filter(f => f.status === 'closed').length;
    },
    
    bugCount() {
      return this.feedbacks.filter(f => f.feedbackType === 'bug').length;
    }
  },
  mounted() {
    this.checkAuthStatus();
    if (this.isAuthenticated) {
      this.loadFeedbacks();
      this.startAutoRefresh();
    }
  },
  beforeUnmount() {
    this.stopAutoRefresh();
  },
  watch: {
    autoRefresh(newVal) {
      if (newVal) {
        this.startAutoRefresh();
      } else {
        this.stopAutoRefresh();
      }
    },
    refreshInterval() {
      this.stopAutoRefresh();
      if (this.autoRefresh) {
        this.startAutoRefresh();
      }
    }
  },
  methods: {
    checkAuthStatus() {
      const auth = localStorage.getItem('feedbackAdminAuth');
      if (auth && auth === '655254') {
        this.isAuthenticated = true;
      }
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
    
    loadFeedbacks() {
      const stored = localStorage.getItem('playerFeedbacks');
      this.feedbacks = stored ? JSON.parse(stored) : [];
      this.lastRefreshTime = new Date().toLocaleTimeString();
    },
    
    startAutoRefresh() {
      this.stopAutoRefresh();
      if (this.autoRefresh) {
        this.refreshTimer = setInterval(() => {
          this.loadFeedbacks();
        }, this.refreshInterval * 1000);
      }
    },
    
    stopAutoRefresh() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
        this.refreshTimer = null;
      }
    },
    
    setFilter(filter) {
      this.currentFilter = filter;
      switch(filter) {
        case 'open':
          this.statusFilter = 'open';
          break;
        case 'closed':
          this.statusFilter = 'closed';
          break;
        case 'bug':
          this.typeFilter = 'bug';
          break;
        default:
          this.statusFilter = 'all';
          this.typeFilter = 'all';
      }
    },
    
    getTypeLabel(type) {
      const typeMap = {
        'bug': '🐛 BUG报告',
        'suggestion': '💡 功能建议',
        'balance': '⚖️ 游戏平衡性',
        'ui': '🎨 界面/用户体验',
        'performance': '🚀 性能问题',
        'other': '❓ 其他'
      };
      return typeMap[type] || type;
    },
    
    getSeverityLabel(severity) {
      const severityMap = {
        'low': '🔵 低',
        'medium': '🟡 中',
        'high': '🟠 高',
        'critical': '🔴 严重'
      };
      return severityMap[severity] || severity;
    },
    
    formatDate(timestamp) {
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    },
    
    closeFeedback(id) {
      const feedback = this.feedbacks.find(f => f.id === id);
      if (feedback) {
        feedback.status = 'closed';
        this.saveFeedbacks();
      }
    },
    
    reopenFeedback(id) {
      const feedback = this.feedbacks.find(f => f.id === id);
      if (feedback) {
        feedback.status = 'open';
        this.saveFeedbacks();
      }
    },
    
    deleteFeedback(id) {
      if (confirm('确定要删除这条反馈吗？此操作不可恢复！')) {
        this.feedbacks = this.feedbacks.filter(f => f.id !== id);
        this.saveFeedbacks();
      }
    },
    
    clearAllFeedback() {
      if (confirm('确定要清空所有反馈吗？此操作不可恢复！')) {
        this.feedbacks = [];
        this.saveFeedbacks();
      }
    },
    
    saveFeedbacks() {
      localStorage.setItem('playerFeedbacks', JSON.stringify(this.feedbacks));
    },
    
    exportToCSV() {
      if (this.feedbacks.length === 0) {
        alert('没有数据可导出');
        return;
      }
      
      const headers = ['时间', '玩家名称', '邮箱', '反馈标题', '反馈类型', '游戏版本', '设备信息', '反馈内容', '严重程度', '状态'];
      const csvData = this.feedbacks.map(feedback => [
        this.formatDate(feedback.timestamp),
        feedback.playerName,
        feedback.playerEmail || '',
        feedback.feedbackTitle,
        this.getTypeLabel(feedback.feedbackType),
        feedback.gameVersion || '',
        feedback.deviceInfo || '',
        `"${feedback.feedbackContent.replace(/"/g, '""')}"`,
        this.getSeverityLabel(feedback.severity),
        feedback.status === 'open' ? '待处理' : '已解决'
      ]);
      
      const csvContent = [headers, ...csvData]
        .map(row => row.join(','))
        .join('\n');
      
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `玩家反馈_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
</script>

<style scoped>
.feedback-admin {
  min-height: 100vh;
  background-color: #f6f8fa;
}

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
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 400px;
}

.login-container h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #6c5ce7;
}

.hint {
  text-align: center;
  margin-top: 15px;
  font-size: 0.9rem;
  color: #666;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.admin-header {
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

h1 {
  color: #6c5ce7;
  margin-bottom: 5px;
}

.subtitle {
  color: #666;
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
}

.refresh-interval {
  display: flex;
  align-items: center;
  gap: 8px;
}

.last-refresh {
  font-size: 0.9rem;
  color: #666;
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
  background: white;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.stat-card.active {
  border-color: #6c5ce7;
  background-color: #f0f3ff;
}

.stat-card h3 {
  font-size: 1.8rem;
  margin-bottom: 5px;
  color: #6c5ce7;
}

.stat-card p {
  color: #666;
  font-size: 0.9rem;
}

.feedback-list-container {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e1e4e8;
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
}

.filter-group select {
  width: auto;
  min-width: 120px;
  padding: 8px 12px;
  font-size: 14px;
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
  border-bottom: 1px solid #e1e4e8;
  transition: background-color 0.3s;
}

.feedback-item:hover {
  background-color: #f6f8fa;
}

.feedback-item.status-closed {
  opacity: 0.7;
  background-color: #f8f9fa;
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
  color: #24292e;
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
  background-color: #e1e4e8;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #586069;
}

.severity-badge {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  color: white;
  font-weight: bold;
}

.severity-badge.severity-critical {
  background-color: #d63031;
}

.severity-badge.severity-high {
  background-color: #e17055;
}

.severity-badge.severity-medium {
  background-color: #fdcb6e;
  color: #2d3436;
}

.severity-badge.severity-low {
  background-color: #00b894;
}

.feedback-content {
  margin-bottom: 15px;
  line-height: 1.5;
  color: #24292e;
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
  color: #586069;
}

.player-name {
  font-weight: 600;
}

.timestamp {
  color: #6a737d;
}

.feedback-actions {
  display: flex;
  gap: 8px;
}

.feedback-details {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eaecef;
  font-size: 0.9rem;
  color: #586069;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6a737d;
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