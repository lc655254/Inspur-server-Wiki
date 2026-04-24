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
            <span v-if="fb.hidden" class="hidden-badge">👁️‍🗨️ 已隐藏</span>
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
        <div class="detail-header">
          <h2>{{ selectedFeedback.feedback_title }}</h2>
          <div v-if="isAdmin" class="admin-actions">
            <button class="btn btn-sm" @click="toggleHide(selectedFeedback)">
              {{ selectedFeedback.hidden ? '👁️ 显示' : '🙈 隐藏' }}
            </button>
            <button class="btn btn-sm btn-danger" @click="deleteFeedback(selectedFeedback.id)">🗑️</button>
          </div>
        </div>
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

          <!-- 添加评论 -->
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
      return this.currentUser && this.currentUser.role === 'admin';
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
      if (role) {
        this.currentUser = {
          username: localStorage.getItem('username'),
          role: role
        };
      }
    },
    async loadList() {
      this.loading = true;
      try {
        const token = localStorage.getItem('token');
        const headers = {};
        if (token) headers['Authorization'] = 'Bearer ' + token;
        const res = await fetch('http://api.inspurs.work/api/feedback/public/list', { headers });
        const data = await res.json();
        this.feedbacks = data.data || [];
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
    async voteComment(comment, dir) {
      const token = localStorage.getItem('token');
      if (!token) return alert('请先登录');
      try {
        const res = await fetch(`http://api.inspurs.work/api/comment/${comment.id}/vote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ vote: dir })
        });
        const data = await res.json();
        if (data.code === 200) {
          // 更新本地显示
          comment.likes = Math.max(0, data.total);
          comment.dislikes = Math.max(0, -data.total);
          // 重新获取当前用户投票状态
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
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ content: this.newComment })
        });
        const data = await res.json();
        if (data.code === 200) {
          this.comments.push({
            id: data.comment_id,
            username: this.currentUser?.username || '我',
            content: this.newComment,
            created_at: new Date().toISOString(),
            likes: 0,
            dislikes: 0,
            user_vote: 0
          });
          this.newComment = '';
        } else {
          alert('评论失败：' + data.msg);
        }
      } catch (e) { alert('网络错误') }
    },
    insertEmoji(emoji) {
      this.newComment += emoji;
    },
    canDeleteComment(comment) {
      if (!this.currentUser) return false;
      if (this.isAdmin) return true;
      // 普通用户只能删除自己的评论（需要后端返回 user_id，这里简化）
      return comment.username === this.currentUser.username;
    },
    async deleteComment(commentId) {
      if (!confirm('确定删除该评论？')) return;
      const token = localStorage.getItem('token');
      try {
        await fetch(`http://api.inspurs.work/api/comment/${commentId}`, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + token }
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
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
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
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + token }
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
.public-feedback { max-width: 1000px; margin: 0 auto; padding: 20px; color: var(--vp-c-text-1); }
.top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
.filters { display: flex; gap: 10px; }
.filters select {
  background: var(--vp-c-bg-alt); color: var(--vp-c-text-1); border: 1px solid var(--vp-c-divider);
  border-radius: 6px; padding: 6px 30px 6px 10px; appearance: none;
  background-image: url("data:image/svg+xml,..."); /* 箭头，见之前代码 */
  background-repeat: no-repeat; background-position: right 8px center; background-size: 12px;
}
.fb-card {
  background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider);
  border-radius: 10px; padding: 15px; margin-bottom: 10px; cursor: pointer; transition: 0.2s;
}
.fb-card:hover { border-color: var(--vp-c-brand); }
.fb-header { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.status-badge, .type-badge { padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; }
.status-badge.open { background: #28a745; color: white; }
.status-badge.in_progress { background: #fd7e14; color: white; }
.status-badge.closed { background: #6c757d; color: white; }
.type-badge { background: var(--vp-c-bg-alt); color: var(--vp-c-text-2); }
.hidden-badge { background: #636e72; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; }
.fb-meta { display: flex; gap: 15px; margin-top: 10px; font-size: 0.85rem; color: var(--vp-c-text-2); }
.detail-card { background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); border-radius: 12px; padding: 25px; }
.detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.admin-actions { display: flex; gap: 6px; }
.progress-box { background: var(--vp-c-bg-alt); padding: 15px; border-radius: 8px; margin: 15px 0; }
.comments-section { margin-top: 30px; }
.comment-item {
  border: 1px solid var(--vp-c-divider); border-radius: 8px; padding: 12px; margin-bottom: 12px; background: var(--vp-c-bg);
}
.comment-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.comment-user { display: flex; flex-direction: column; }
.comment-author { font-weight: 600; }
.comment-time { color: var(--vp-c-text-2); font-size: 0.8rem; }
.comment-votes { display: flex; gap: 6px; }
.vote-btn {
  background: transparent; border: 1px solid var(--vp-c-divider); border-radius: 4px;
  padding: 2px 8px; cursor: pointer; font-size: 0.85rem; color: var(--vp-c-text-1); transition: 0.1s;
}
.vote-btn.active { background: var(--vp-c-brand-light); color: white; border-color: var(--vp-c-brand); }
.comment-content { white-space: pre-wrap; word-break: break-word; }
.comment-admin { text-align: right; margin-top: 6px; }
.add-comment { margin-top: 20px; }
.emoji-panel { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
.emoji-panel span { cursor: pointer; font-size: 1.2rem; padding: 2px 4px; border-radius: 4px; transition: 0.2s; }
.emoji-panel span:hover { background: var(--vp-c-bg-soft); }
.add-comment textarea { width: 100%; padding: 10px; background: var(--vp-c-bg); border: 1px solid var(--vp-c-divider); border-radius: 6px; color: var(--vp-c-text-1); }
.login-hint { color: var(--vp-c-text-2); margin-top: 10px; }
.btn {
  display: inline-flex; align-items: center; gap: 6px; background: var(--vp-c-brand); color: white; border: none;
  border-radius: 8px; padding: 8px 18px; font-size: 0.9rem; font-weight: 500; cursor: pointer; transition: 0.2s;
}
.btn:hover { background: var(--vp-c-brand-dark); opacity: 0.9; }
.btn-sm { padding: 5px 12px; font-size: 0.8rem; }
.btn-back { background: transparent; color: var(--vp-c-brand); padding: 0; margin-bottom: 15px; font-size: 0.95rem; }
.btn-back:hover { text-decoration: underline; }
.btn-danger { background: #d63031; color: white; border: none; }
.empty { text-align: center; padding: 40px; color: var(--vp-c-text-2); }
</style>