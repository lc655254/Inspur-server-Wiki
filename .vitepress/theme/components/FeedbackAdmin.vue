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
      </div>
    </div>
    
    <!-- 主内容区域 -->
    <div v-if="isAuthenticated" class="container">
      <header class="admin-header">
        <div class="header-content">
          <h1>🎮 玩家反馈管理</h1>
          <p class="subtitle">所有玩家反馈将实时显示在此处</p>
          
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
          </div>
          
          <div class="actions">
            <button class="btn btn-export" @click="exportToCSV">📊 导出CSV</button>
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
                  </div>
                </div>
                
                <div class="feedback-details" v-if="feedback.player_email || feedback.game_version || feedback.device_info">
                  <div v-if="feedback.player_email">
                    <strong>📧 联系方式:</strong> {{ feedback.player_email }}
                  </div>
                  <div v-if="feedback.game_version">
                    <strong>🎮 游戏版本:</strong> {{ feedback.game_version }}
                  </div>
                  <div v-if="feedback.device_info">
                    <strong>💻 设备信息:</strong> {{ feedback.device_info }}
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
// 使用 CDN 方式引入 Supabase
const supabaseUrl = 'https://wamzxvpctmihuovhulhf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhbXp4dnBjdG1paHVvdmh1bGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMDQ0MzQsImV4cCI6MjA3ODU4MDQzNH0.sewGA3tnyrSjBrxE8_oHTDWRB_oNApFhGtLvLPhG5_A'

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
      supabase: null,
      
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
        const typeMatch = this.typeFilter === 'all' || feedback.feedback_type === this.typeFilter;
        const severityMatch = this.severityFilter === 'all' || feedback.severity === this.severityFilter;
        
        return statusMatch && typeMatch && severityMatch;
      }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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
      return this.feedbacks.filter(f => f.feedback_type === 'bug').length;
    }
  },
  mounted() {
    this.loadSupabase()
    this.checkAuthStatus();
    if (this.isAuthenticated) {
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
    async loadSupabase() {
      if (typeof window !== 'undefined') {
        // 检查是否已经加载了 Supabase
        if (window.supabase) {
          this.supabase = window.supabase.createClient(supabaseUrl, supabaseKey)
          if (this.isAuthenticated) {
            this.loadFeedbacks()
          }
          return
        }
        
        // 动态加载 Supabase CDN
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
        script.onload = () => {
          this.supabase = window.supabase.createClient(supabaseUrl, supabaseKey)
          if (this.isAuthenticated) {
            this.loadFeedbacks()
          }
        }
        document.head.appendChild(script)
      }
    },
    
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
        if (this.supabase) {
          this.loadFeedbacks();
        }
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
      if (!this.supabase) {
        console.log('Supabase 尚未加载完成')
        return
      }
      
      try {
        // 从 Supabase 数据库读取反馈数据
        const { data, error } = await this.supabase
          .from('feedbacks')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error;

        this.feedbacks = data || [];
        this.lastRefreshTime = new Date().toLocaleTimeString();
      } catch (error) {
        console.error('加载反馈失败:', error);
      }
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
    
    async closeFeedback(id) {
      if (!this.supabase) {
        alert('系统正在初始化，请稍后重试')
        return
      }
      
      try {
        // 更新数据库中的反馈状态
        const { error } = await this.supabase
          .from('feedbacks')
          .update({ status: 'closed' })
          .eq('id', id)

        if (error) throw error;

        // 更新本地数据
        const feedback = this.feedbacks.find(f => f.id === id);
        if (feedback) {
          feedback.status = 'closed';
        }
      } catch (error) {
        console.error('关闭反馈失败:', error);
        alert('操作失败，请稍后重试');
      }
    },
    
    async reopenFeedback(id) {
      if (!this.supabase) {
        alert('系统正在初始化，请稍后重试')
        return
      }
      
      try {
        const { error } = await this.supabase
          .from('feedbacks')
          .update({ status: 'open' })
          .eq('id', id)

        if (error) throw error;

        const feedback = this.feedbacks.find(f => f.id === id);
        if (feedback) {
          feedback.status = 'open';
        }
      } catch (error) {
        console.error('重新打开反馈失败:', error);
        alert('操作失败，请稍后重试');
      }
    },
    
    exportToCSV() {
      if (this.feedbacks.length === 0) {
        alert('没有数据可导出');
        return;
      }
      
      const headers = ['时间', '玩家名称', '邮箱', '反馈标题', '反馈类型', '游戏版本', '设备信息', '反馈内容', '严重程度', '状态'];
      const csvData = this.feedbacks.map(feedback => [
        this.formatDate(feedback.created_at),
        feedback.player_name,
        feedback.player_email || '',
        feedback.feedback_title,
        this.getTypeLabel(feedback.feedback_type),
        feedback.game_version || '',
        feedback.device_info || '',
        `"${feedback.feedback_content.replace(/"/g, '""')}"`,
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