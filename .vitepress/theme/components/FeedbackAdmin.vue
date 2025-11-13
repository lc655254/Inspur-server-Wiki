<template>
  <div class="feedback-admin">
    <div class="container">
      <header>
        <h1>玩家反馈管理</h1>
        <p class="subtitle">查看和分析玩家提交的反馈与建议</p>
        
        <div class="admin-stats">
          <div class="stat-card">
            <h3>{{ feedbacks.length }}</h3>
            <p>总反馈数</p>
          </div>
          <div class="stat-card">
            <h3>{{ bugCount }}</h3>
            <p>BUG报告</p>
          </div>
          <div class="stat-card">
            <h3>{{ highSeverityCount }}</h3>
            <p>高优先级</p>
          </div>
        </div>
      </header>
      
      <div class="card">
        <div class="filters">
          <div class="filter-group">
            <label>反馈类型:</label>
            <select v-model="filterType">
              <option value="all">全部</option>
              <option value="bug">游戏BUG</option>
              <option value="suggestion">改进建议</option>
              <option value="balance">游戏平衡性</option>
              <option value="ui">界面/用户体验</option>
              <option value="performance">性能问题</option>
              <option value="other">其他</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>严重程度:</label>
            <select v-model="filterSeverity">
              <option value="all">全部</option>
              <option value="critical">严重</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
          
          <button class="btn btn-export" @click="exportToCSV">导出CSV</button>
          <button class="btn btn-danger" @click="clearAllFeedback" v-if="feedbacks.length > 0">清空所有反馈</button>
        </div>
        
        <div class="feedback-list" v-if="filteredFeedbacks.length > 0">
          <div class="feedback-item" v-for="feedback in filteredFeedbacks" :key="feedback.id" 
               :class="'severity-' + feedback.severity">
            <div class="feedback-header">
              <div class="feedback-meta">
                <span class="player-name">{{ feedback.playerName }}</span>
                <span class="feedback-type">{{ getTypeLabel(feedback.feedbackType) }}</span>
                <span class="severity-badge" :class="'severity-' + feedback.severity">
                  {{ getSeverityLabel(feedback.severity) }}
                </span>
                <span class="timestamp">{{ formatDate(feedback.timestamp) }}</span>
              </div>
              <button class="btn-delete" @click="deleteFeedback(feedback.id)">删除</button>
            </div>
            
            <div class="feedback-content">
              <p>{{ feedback.feedbackContent }}</p>
            </div>
            
            <div class="feedback-details" v-if="feedback.playerEmail || feedback.gameVersion || feedback.deviceInfo">
              <div v-if="feedback.playerEmail">
                <strong>联系方式:</strong> {{ feedback.playerEmail }}
              </div>
              <div v-if="feedback.gameVersion">
                <strong>游戏版本:</strong> {{ feedback.gameVersion }}
              </div>
              <div v-if="feedback.deviceInfo">
                <strong>设备信息:</strong> {{ feedback.deviceInfo }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="empty-state" v-else>
          <p>暂无反馈数据</p>
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
      filterType: 'all',
      filterSeverity: 'all'
    }
  },
  computed: {
    filteredFeedbacks() {
      return this.feedbacks.filter(feedback => {
        const typeMatch = this.filterType === 'all' || feedback.feedbackType === this.filterType;
        const severityMatch = this.filterSeverity === 'all' || feedback.severity === this.filterSeverity;
        return typeMatch && severityMatch;
      }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },
    
    bugCount() {
      return this.feedbacks.filter(f => f.feedbackType === 'bug').length;
    },
    
    highSeverityCount() {
      return this.feedbacks.filter(f => f.severity === 'high' || f.severity === 'critical').length;
    }
  },
  mounted() {
    this.loadFeedbacks();
  },
  methods: {
    loadFeedbacks() {
      const stored = localStorage.getItem('playerFeedbacks');
      this.feedbacks = stored ? JSON.parse(stored) : [];
    },
    
    getTypeLabel(type) {
      const typeMap = {
        'bug': '游戏BUG',
        'suggestion': '改进建议',
        'balance': '游戏平衡性',
        'ui': '界面/用户体验',
        'performance': '性能问题',
        'other': '其他'
      };
      return typeMap[type] || type;
    },
    
    getSeverityLabel(severity) {
      const severityMap = {
        'low': '低',
        'medium': '中',
        'high': '高',
        'critical': '严重'
      };
      return severityMap[severity] || severity;
    },
    
    formatDate(timestamp) {
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    },
    
    deleteFeedback(id) {
      if (confirm('确定要删除这条反馈吗？')) {
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
      
      const headers = ['时间', '玩家名称', '邮箱', '反馈类型', '游戏版本', '设备信息', '反馈内容', '严重程度'];
      const csvData = this.feedbacks.map(feedback => [
        this.formatDate(feedback.timestamp),
        feedback.playerName,
        feedback.playerEmail || '',
        this.getTypeLabel(feedback.feedbackType),
        feedback.gameVersion || '',
        feedback.deviceInfo || '',
        `"${feedback.feedbackContent.replace(/"/g, '""')}"`,
        this.getSeverityLabel(feedback.severity)
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
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #6c5ce7;
  margin-bottom: 10px;
}

.subtitle {
  color: #2d3436;
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.admin-stats {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.stat-card {
  background: white;
  padding: 15px 25px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
  min-width: 120px;
}

.stat-card h3 {
  font-size: 2rem;
  color: #6c5ce7;
  margin-bottom: 5px;
}

.stat-card p {
  color: #636e72;
  font-size: 0.9rem;
}

.card {
  background-color: white;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  margin-bottom: 0;
  white-space: nowrap;
}

.filter-group select {
  width: auto;
  min-width: 120px;
}

.btn {
  background-color: #6c5ce7;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  white-space: nowrap;
}

.btn:hover {
  background-color: #a29bfe;
}

.btn-export {
  background-color: #00b894;
}

.btn-export:hover {
  background-color: #00a085;
}

.btn-danger {
  background-color: #d63031;
}

.btn-danger:hover {
  background-color: #c23636;
}

.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.feedback-item {
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 15px;
  transition: all 0.3s;
}

.feedback-item:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.feedback-item.severity-critical {
  border-left: 5px solid #d63031;
}

.feedback-item.severity-high {
  border-left: 5px solid #e17055;
}

.feedback-item.severity-medium {
  border-left: 5px solid #fdcb6e;
}

.feedback-item.severity-low {
  border-left: 5px solid #00b894;
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.feedback-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.player-name {
  font-weight: bold;
  color: #2d3436;
}

.feedback-type {
  background-color: #dfe6e9;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
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

.timestamp {
  color: #636e72;
  font-size: 0.8rem;
}

.btn-delete {
  background: none;
  border: none;
  color: #d63031;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-delete:hover {
  text-decoration: underline;
}

.feedback-content {
  margin-bottom: 10px;
  line-height: 1.5;
}

.feedback-details {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 0.9rem;
  color: #636e72;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #636e72;
}

@media (max-width: 768px) {
  .admin-stats {
    flex-direction: column;
    align-items: center;
  }
  
  .stat-card {
    width: 100%;
    max-width: 200px;
  }
  
  .filters {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .filter-group select {
    width: 100%;
  }
  
  .feedback-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .feedback-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>