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
// 引入Supabase客户端
import { createClient } from '@supabase/supabase-js'

// 初始化Supabase客户端，使用你提供的凭证
const supabaseUrl = 'https://wamzxvpctmihuovhulhf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhbXp4dnBjdG1paHVvdmh1bGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMDQ0MzQsImV4cCI6MjA3ODU4MDQzNH0.sewGA3tnyrSjBrxE8_oHTDWRB_oNApFhGtLvLPhG5_A'
const supabase = createClient(supabaseUrl, supabaseKey)

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
    
    async loadFeedbacks() {
      try {
        // 从 Supabase 数据库读取反馈数据[citation:1]
        const { data, error } = await supabase
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
      try {
        // 更新数据库中的反馈状态[citation:1]
        const { error } = await supabase
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
      try {
        const { error } = await supabase
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
/* 这里的CSS样式与之前提供的FeedbackAdmin.vue样式相同 */
/* 由于篇幅限制，此处省略，请直接使用前面提供的完整CSS样式 */
</style>