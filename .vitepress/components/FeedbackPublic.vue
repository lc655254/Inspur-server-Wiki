<template>
  <div class="public-feedback">
    <!-- 列表视图 -->
    <div v-if="view === 'list'" class="list-view">
      <div class="top-bar">
        <h1>📢 公开反馈</h1>
        <AuthButton />
      </div>

      <div class="toolbar">
        <div class="left-actions">
          <!-- 使用 adminVisible 保证按钮出现 -->
          <a v-if="isAdmin" href="/admin" class="btn btn-admin">🔧 管理反馈</a>
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
        </div>
        <button class="btn btn-primary" @click="view = 'submit'">📝 提交新反馈</button>
      </div>

      <div class="feedback-list">
        <div v-if="loading" class="empty">加载中...</div>
        <div v-else-if="filteredList.length === 0" class="empty">📭 暂无公开反馈</div>
        <div v-for="fb in filteredList" :key="fb.id" class="fb-card" @click="openDetail(fb)">
          <div class="fb-header">
            <span class="status-badge" :class="fb.status">{{ statusText(fb.status) }}</span>
            <strong class="fb-title">{{ fb.feedback_title }}</strong>
            <span class="type-badge">{{ typeText(fb.feedback_type) }}</span>
            <span v-if="fb.hidden" class="hidden-badge">👁️‍🗨️</span>
          </div>
          <p class="fb-preview">{{ (fb.feedback_content || '').substring(0, 120) }}...</p>
          <div class="fb-meta">
            <span>👤 {{ fb.username || fb.player_name }}</span>
            <span>📅 {{ formatDate(fb.created_at) }}</span>
            <span class="vote-summary">
              <span class="vote-icon">👍</span> {{ fb.likes || 0 }}
              <span class="vote-icon">👎</span> {{ fb.dislikes || 0 }}
            </span>
            <span>💬 {{ fb.comment_count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 详情视图 -->
    <div v-else-if="view === 'detail'" class="detail-view">
      <button class="btn btn-back" @click="view = 'list'; selectedFeedback = null">← 返回列表</button>
      <div v-if="selectedFeedback" class="detail-card">
        <div class="detail-header">
          <h2 class="feedback-title">{{ selectedFeedback.feedback_title }}</h2>
          <div v-if="isAdmin" class="admin-actions">
            <button class="btn btn-sm" @click="toggleHide(selectedFeedback)">
              {{ selectedFeedback.hidden ? '👁️ 显示' : '🙈 隐藏' }}
            </button>
            <button class="btn btn-sm btn-danger" @click="deleteFeedback(selectedFeedback.id)">🗑️</button>
          </div>
        </div>

        <div class="detail-meta-row">
          <div class="detail-meta">
            <span class="status-badge" :class="selectedFeedback.status">{{ statusText(selectedFeedback.status) }}</span>
            <span class="type-badge">{{ typeText(selectedFeedback.feedback_type) }}</span>
            <span>👤 {{ selectedFeedback.username || selectedFeedback.player_name }}</span>
            <span>📅 {{ formatDate(selectedFeedback.created_at) }}</span>
          </div>
          <div class="feedback-votes">
            <button :class="['vote-btn', { active: selectedFeedback.user_vote === 1 }]" @click="voteFeedback(1)">
              👍 {{ selectedFeedback.likes || 0 }}
            </button>
            <button :class="['vote-btn', { active: selectedFeedback.user_vote === -1 }]" @click="voteFeedback(-1)">
              👎 {{ selectedFeedback.dislikes || 0 }}
            </button>
          </div>
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
          <h3 class="comments-title">💬 评论 ({{ comments.length }})</h3>
          <div v-if="comments.length === 0" class="empty-gap">暂无评论</div>
          <div v-for="c in sortedComments" :key="c.id" class="comment-item">
            <div class="comment-top">
              <div class="comment-user">
                <span class="comment-author">{{ c.username }}</span>
                <span class="comment-time">{{ formatDate(c.created_at) }}</span>
              </div>
              <div class="comment-votes">
                <button :class="['vote-btn', { active: c.user_vote === 1 }]" @click="voteComment(c, 1)">
                  👍 {{ c.likes }}
                </button>
                <button :class="['vote-btn', { active: c.user_vote === -1 }]" @click="voteComment(c, -1)">
                  👎 {{ c.dislikes }}
                </button>
              </div>
            </div>
            <p class="comment-content">{{ c.content }}</p>
            <div v-if="canDeleteComment(c)" class="comment-admin">
              <button class="btn btn-sm btn-danger" @click="deleteComment(c.id)">🗑️</button>
            </div>
          </div>

          <div v-if="loggedIn" class="add-comment">
            <div class="emoji-panel">
              <span v-for="emoji in quickEmojis" :key="emoji" @click="insertEmoji(emoji)">{{ emoji }}</span>
            </div>
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
      loggedIn: false,
      currentUser: null,
      quickEmojis: ['😀', '😂', '😢', '😡', '👍', '👎', '❤️', '🎉', '🤔', '🔥']
      
    }
  },
  computed: {
    filteredList() {
      return this.feedbacks.filter(f => {
        const ms = this.statusFilter === 'all' || f.status === this.statusFilter;
        const mt = this.typeFilter === 'all' || f.feedback_type === this.typeFilter;
        return ms && mt;
      });
    },
    isAdmin() {
        return localStorage.getItem('role') === 'admin';
    },
    sortedComments() {
      return [...this.comments].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  },
  mounted() {
    this.checkAuth();
    this.loadList();
},
  methods: {
    checkAuth() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    this.loggedIn = !!token;
    this.currentUser = {
        username: localStorage.getItem('username') || '',
        role: role || 'user'
    };
},
    async loadList() {
      this.loading = true;
      try {
        const token = localStorage.getItem('token');
        const headers = {};
        if (token) headers['Authorization'] = 'Bearer ' + token;
        const res = await fetch('http://api.inspurs.work/api/feedback/public/list', { headers });
        const data = await res.json();
        this.feedbacks = (data.data || []).map(f => ({
          ...f,
          likes: Math.max(0, f.vote_total || 0),
          dislikes: Math.max(0, -(f.vote_total || 0))
        }));
        if (data.user) this.currentUser = data.user;
      } catch (e) { console.error(e) }
      finally { this.loading = false }
    },
    async openDetail(fb) {
      this.selectedFeedback = fb;
      this.view = 'detail';
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) headers['Authorization'] = 'Bearer ' + token;
      try {
        const res = await fetch(`http://api.inspurs.work/api/feedback/public/${fb.id}`, { headers });
        const data = await res.json();
        if (data.code === 200) {
          this.selectedFeedback = data.data;
          this.comments = data.data.comments || [];
        }
      } catch (e) { console.error(e) }
    },
    async voteFeedback(dir) {
      if (!this.loggedIn) return alert('请先登录');
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`http://api.inspurs.work/api/feedback/${this.selectedFeedback.id}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
          body: JSON.stringify({ vote: dir })
        });
        const data = await res.json();
        if (data.code === 200) {
          this.selectedFeedback.likes = Math.max(0, data.total);
          this.selectedFeedback.dislikes = Math.max(0, -data.total);
          const vRes = await fetch(`http://api.inspurs.work/api/feedback/${this.selectedFeedback.id}/votes`, {
            headers: { 'Authorization': 'Bearer ' + token }
          });
          const vData = await vRes.json();
          this.selectedFeedback.user_vote = vData.user_vote;
        }
      } catch (e) { console.error(e) }
    },
    async voteComment(comment, dir) {
      if (!this.loggedIn) return alert('请先登录');
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`http://api.inspurs.work/api/comment/${comment.id}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
          body: JSON.stringify({ vote: dir })
        });
        const data = await res.json();
        if (data.code === 200) {
          comment.likes = Math.max(0, data.total);
          comment.dislikes = Math.max(0, -data.total);
          const vRes = await fetch(`http://api.inspurs.work/api/comment/${comment.id}/votes`, {
            headers: { 'Authorization': 'Bearer ' + token }
          });
          const vData = await vRes.json();
          comment.user_vote = vData.user_vote;
        }
      } catch (e) { console.error(e) }
    },
    async submitComment() {
      if (!this.newComment.trim()) return;
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`http://api.inspurs.work/api/feedback/${this.selectedFeedback.id}/comment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
          body: JSON.stringify({ content: this.newComment })
        });
        const data = await res.json();
        if (data.code === 200) {
          this.comments.unshift({
            id: data.comment_id,
            username: this.currentUser?.username || '我',
            content: this.newComment,
            created_at: new Date().toISOString(),
            likes: 0, dislikes: 0, user_vote: 0
          });
          this.newComment = '';
        } else {
          alert('评论失败：' + data.msg);
        }
      } catch (e) { alert('网络错误') }
    },
    insertEmoji(emoji) { this.newComment += emoji; },
    canDeleteComment(comment) {
      if (!this.currentUser) return false;
      if (this.currentUser.role === 'admin') return true;
      return comment.username === this.currentUser.username;
    },
    async deleteComment(commentId) {
      if (!confirm('确定删除该评论？')) return;
      const token = localStorage.getItem('token');
      try {
        await fetch(`http://api.inspurs.work/api/comment/${commentId}`, {
          method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token }
        });
        this.comments = this.comments.filter(c => c.id !== commentId);
      } catch (e) { alert('删除失败') }
    },
    async toggleHide(fb) {
      const token = localStorage.getItem('token');
      const newHidden = fb.hidden ? 0 : 1;
      try {
        await fetch(`http://api.inspurs.work/api/feedback/${fb.id}/hide`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
          body: JSON.stringify({ hidden: newHidden })
        });
        fb.hidden = newHidden;
      } catch (e) { alert('操作失败') }
    },
    async deleteFeedback(id) {
      if (!confirm('确定删除该反馈？')) return;
      const token = localStorage.getItem('token');
      try {
        await fetch(`http://api.inspurs.work/api/feedback/${id}`, {
          method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token }
        });
        this.view = 'list';
        this.loadList();
      } catch (e) { alert('删除失败') }
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
/* 样式保持之前的美化版，增加 .btn-admin 和 .left-actions 调整 */
.public-feedback { max-width: 1000px; margin: 0 auto; padding: 20px; color: var(--vp-c-text-1); }
.top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}
.left-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.filters { display: flex; gap: 10px; }
.filters select {
  background: var(--vp-c-bg-alt); color: var(--vp-c-text-1); border: 1px solid var(--vp-c-divider);
  border-radius: 6px; padding: 6px 30px 6px 10px; appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 8px center; background-size: 12px;
}
.btn-admin {
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-brand);
  border: 1px solid var(--vp-c-brand);
  border-radius: 6px;
  padding: 6px 16px;
  font-size: 0.9rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: 0.2s;
}
.btn-admin:hover {
  background: var(--vp-c-brand);
  color: white;
}
.fb-card {
  background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider);
  border-radius: 10px; padding: 15px; margin-bottom: 10px; cursor: pointer; transition: 0.2s;
}
.fb-card:hover { border-color: var(--vp-c-brand); }
.fb-header { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 8px; }
.fb-title { font-size: 1.1rem; font-weight: 600; flex: 1; }
.status-badge, .type-badge { padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; white-space: nowrap; }
.status-badge.open { background: #28a745; color: white; }
.status-badge.in_progress { background: #fd7e14; color: white; }
.status-badge.closed { background: #6c757d; color: white; }
.type-badge { background: var(--vp-c-bg-alt); color: var(--vp-c-text-2); }
.hidden-badge { background: #636e72; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; }
.fb-preview { margin: 0 0 10px; color: var(--vp-c-text-2); }
.fb-meta { display: flex; align-items: center; gap: 15px; flex-wrap: wrap; font-size: 0.85rem; color: var(--vp-c-text-2); }
.vote-summary { display: flex; align-items: center; gap: 6px; }
.vote-icon { font-size: 0.9rem; }

.detail-card { background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); border-radius: 12px; padding: 25px; }
.detail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
.feedback-title { font-size: 1.6rem; font-weight: 700; margin: 0; }
.admin-actions { display: flex; gap: 6px; }
.detail-meta-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 15px; }
.detail-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.feedback-votes { display: flex; gap: 8px; }
.vote-btn {
  background: transparent; border: 1px solid var(--vp-c-divider); border-radius: 4px;
  padding: 4px 12px; cursor: pointer; font-size: 0.9rem; color: var(--vp-c-text-1); transition: 0.1s;
}
.vote-btn.active { background: var(--vp-c-brand-light); color: white; border-color: var(--vp-c-brand); }
.detail-body p { white-space: pre-wrap; }
.progress-box { background: var(--vp-c-bg-alt); padding: 15px; border-radius: 8px; margin: 15px 0; }

.comments-section { margin-top: 30px; }
.comments-title { font-size: 1.2rem; margin-bottom: 16px; }
.empty-gap { text-align: center; padding: 30px; color: var(--vp-c-text-2); }
.comment-item {
  border: 1px solid var(--vp-c-divider); border-radius: 8px; padding: 12px; margin-bottom: 12px; background: var(--vp-c-bg);
}
.comment-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.comment-user { display: flex; flex-direction: column; }
.comment-author { font-weight: 600; }
.comment-time { color: var(--vp-c-text-2); font-size: 0.8rem; }
.comment-votes { display: flex; gap: 6px; }
.comment-content { white-space: pre-wrap; word-break: break-word; margin-top: 8px; }
.comment-admin { text-align: right; margin-top: 8px; }

.add-comment { margin-top: 25px; }
.emoji-panel { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
.emoji-panel span { cursor: pointer; font-size: 1.2rem; padding: 2px 4px; border-radius: 4px; transition: 0.2s; }
.emoji-panel span:hover { background: var(--vp-c-bg-soft); }
.add-comment textarea { width: 100%; padding: 10px; background: var(--vp-c-bg); border: 1px solid var(--vp-c-divider); border-radius: 6px; color: var(--vp-c-text-1); }
.login-hint { color: var(--vp-c-text-2); margin-top: 10px; }

.btn {
  display: inline-flex; align-items: center; gap: 6px; background: var(--vp-c-brand); color: white; border: none;
  border-radius: 8px; padding: 8px 16px; font-size: 0.9rem; font-weight: 500; cursor: pointer; transition: 0.2s;
}
.btn:hover { background: var(--vp-c-brand-dark); opacity: 0.9; }
.btn-sm { padding: 5px 10px; font-size: 0.8rem; }
.btn-back { background: transparent; color: var(--vp-c-brand); padding: 0; margin-bottom: 15px; font-size: 0.95rem; }
.btn-back:hover { text-decoration: underline; }
.btn-danger { background: #d63031; color: white; border: none; }
.empty { text-align: center; padding: 40px; color: var(--vp-c-text-2); }

@media (max-width: 640px) {
  .left-actions { width: 100%; flex-direction: column; align-items: flex-start; }
  .filters { width: 100%; }
  .filters select { width: 100%; }
}
</style>