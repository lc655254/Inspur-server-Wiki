<template>
  <div class="public-feedback">
    <!-- 列表视图 -->
    <div v-if="view === 'list'" class="list-view">
      <div class="top-bar">
        <h1>📢 公开反馈</h1>
        <AuthButton />
      </div>

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
        <button class="btn btn-primary" @click="view = 'submit'">📝 提交新反馈</button>
      </div>

      <div class="feedback-list">
        <div v-if="loading" class="empty">加载中...</div>
        <div v-else-if="filteredList.length === 0" class="empty">📭 暂无公开反馈</div>
        <div v-for="fb in filteredList" :key="fb.id" class="fb-card" @click="openDetail(fb)">
          <div class="fb-header">
            <span class="status-badge" :class="fb.status">{{ statusText(fb.status) }}</span>
            <strong>{{ fb.feedback_title }}</strong>
            <span class="type-badge">{{ typeText(fb.feedback_type) }}</span>
          </div>
          <p class="fb-preview">{{ (fb.feedback_content || '').substring(0, 150) }}...</p>
          <div class="fb-meta">
            <span>👤 {{ fb.username || fb.player_name }}</span>
            <span>💬 {{ fb.comment_count }} 评论</span>
            <span>📅 {{ formatDate(fb.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 详情视图 -->
    <div v-else-if="view === 'detail'" class="detail-view">
      <button class="btn btn-back" @click="view = 'list'; selectedFeedback = null">← 返回列表</button>
      <div v-if="selectedFeedback" class="detail-card">
        <h2>{{ selectedFeedback.feedback_title }}</h2>
        <div class="detail-meta">
          <span class="status-badge" :class="selectedFeedback.status">{{ statusText(selectedFeedback.status) }}</span>
          <span class="type-badge">{{ typeText(selectedFeedback.feedback_type) }}</span>
          <span>👤 {{ selectedFeedback.username || selectedFeedback.player_name }}</span>
          <span>📅 {{ formatDate(selectedFeedback.created_at) }}</span>
        </div>
        <div class="detail-body">
          <p>{{ selectedFeedback.feedback_content }}</p>
          <div v-if="selectedFeedback.progress" class="progress-box">
            <h4>🔧 处理进度</h4>
            <p>{{ selectedFeedback.progress }}</p>
          </div>
        </div>

        <!-- 评论区 -->
        <div class="comments-section">
          <h3>💬 评论 ({{ comments.length }})</h3>
          <div v-if="comments.length === 0" class="empty">暂无评论</div>
          <div v-for="c in comments" :key="c.id" class="comment-item">
            <span class="comment-author">{{ c.username }}</span>
            <span class="comment-time">{{ formatDate(c.created_at) }}</span>
            <p>{{ c.content }}</p>
          </div>

          <!-- 添加评论 -->
          <div v-if="loggedIn" class="add-comment">
            <textarea v-model="newComment" rows="3" placeholder="写下你的评论..."></textarea>
            <button class="btn btn-primary btn-sm" @click="submitComment" :disabled="!newComment.trim()">发表评论</button>
          </div>
          <div v-else class="login-hint">请登录后参与评论</div>
        </div>
      </div>
    </div>

    <!-- 提交反馈视图 -->
    <div v-else-if="view === 'submit'" class="submit-view">
      <button class="btn btn-back" @click="view = 'list'">← 返回列表</button>
      <FeedbackForm />
    </div>
  </div>
</template>

<script>
import AuthButton from './AuthButton.vue'
import FeedbackForm from './FeedbackForm.vue'

export default {
  name: 'FeedbackPublic',
  components: { AuthButton, FeedbackForm },
  data() {
    return {
      view: 'list',
      feedbacks: [],
      selectedFeedback: null,
      comments: [],
      newComment: '',
      statusFilter: 'all',
      typeFilter: 'all',
      loading: true,
      loggedIn: false
    }
  },
  computed: {
    filteredList() {
      return this.feedbacks.filter(f => {
        const ms = this.statusFilter === 'all' || f.status === this.statusFilter;
        const mt = this.typeFilter === 'all' || f.feedback_type === this.typeFilter;
        return ms && mt;
      });
    }
  },
  mounted() {
    this.loggedIn = !!localStorage.getItem('token');
    this.loadList();
  },
  methods: {
    async loadList() {
      this.loading = true;
      try {
        const res = await fetch('http://api.inspurs.work/api/feedback/public/list');
        const data = await res.json();
        this.feedbacks = data.data || [];
      } catch (e) { console.error(e) }
      finally { this.loading = false }
    },
    async openDetail(fb) {
      this.selectedFeedback = fb;
      this.view = 'detail';
      try {
        const res = await fetch(`http://api.inspurs.work/api/feedback/public/${fb.id}`);
        const data = await res.json();
        if (data.code === 200) {
          this.selectedFeedback = data.data;
          this.comments = data.data.comments || [];
        }
      } catch (e) { console.error(e) }
    },
    async submitComment() {
      if (!this.newComment.trim()) return;
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`http://api.inspurs.work/api/feedback/${this.selectedFeedback.id}/comment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ content: this.newComment })
        });
        const data = await res.json();
        if (data.code === 200) {
          // 手动添加评论到列表（实际可从接口重新获取）
          this.comments.push({
            id: Date.now(),
            username: this.getUsername(),
            content: this.newComment,
            created_at: new Date().toISOString()
          });
          this.newComment = '';
        } else {
          alert('评论失败：' + data.msg);
        }
      } catch (e) { alert('网络错误') }
    },
    getUsername() {
      // 从 token 解析用户名（临时方案，实际应通过接口获取）
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return payload.username || '未知用户';
        }
      } catch (e) { return '用户'; }
      return '用户';
    },
    statusText(s) {
      const map = { open:'🔓 待处理', in_progress:'⏳ 处理中', closed:'✅ 已解决' };
      return map[s] || s;
    },
    typeText(t) {
      const map = { bug:'🐛 BUG', suggestion:'💡 建议', balance:'⚖️ 平衡', ui:'🎨 UI', performance:'🚀 性能', other:'❓ 其他' };
      return map[t] || t;
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
.public-feedback {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  color: var(--vp-c-text-1);
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.top-bar h1 {
  margin: 0;
  font-size: 1.8rem;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.filters {
  display: flex;
  gap: 10px;
}

.filters select {
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 6px 30px 6px 10px;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 12px;
}

.fb-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: 0.2s;
}
.fb-card:hover {
  border-color: var(--vp-c-brand);
}
.fb-header {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.status-badge, .type-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
}
.status-badge.open { background: #28a745; color: white; }
.status-badge.in_progress { background: #fd7e14; color: white; }
.status-badge.closed { background: #6c757d; color: white; }
.type-badge { background: var(--vp-c-bg-alt); color: var(--vp-c-text-2); }
.fb-meta {
  display: flex;
  gap: 15px;
  margin-top: 10px;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.detail-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 25px;
}
.progress-box {
  background: var(--vp-c-bg-alt);
  padding: 15px;
  border-radius: 8px;
  margin: 15px 0;
}
.comment-item {
  padding: 10px 0;
  border-bottom: 1px solid var(--vp-c-divider);
}
.comment-author {
  font-weight: 600;
  margin-right: 10px;
}
.comment-time {
  color: var(--vp-c-text-2);
  font-size: 0.8rem;
}
.add-comment {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.add-comment textarea {
  width: 100%;
  padding: 10px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  color: var(--vp-c-text-1);
}
.login-hint {
  color: var(--vp-c-text-2);
  margin-top: 10px;
}

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
.btn-back {
  background: transparent;
  color: var(--vp-c-brand);
  padding: 0;
  margin-bottom: 15px;
  font-size: 0.95rem;
}
.btn-back:hover {
  text-decoration: underline;
}
.empty {
  text-align: center;
  padding: 40px;
  color: var(--vp-c-text-2);
}
</style>