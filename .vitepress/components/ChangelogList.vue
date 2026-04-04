<template>
    <div class="changelog-container">
        <div v-for="(release, index) in releases" :key="index" class="release-item">
            <div class="timeline-dot"></div>

            <div class="release-header">
                <h2 class="release-version">
                    {{ release.version }}
                    <span v-if="release.isLatest" class="tag-latest">LATEST</span>
                </h2>
                <div class="release-meta">
                    <span class="meta-date">{{ release.date }}</span>
                    <span class="meta-badge core">Core v{{ release.coreVersion }}</span>
                    <span class="meta-badge web">Web v{{ release.webVersion }}</span>
                </div>
            </div>

            <p v-if="release.summary" class="release-summary">{{ release.summary }}</p>

            <div v-if="release.changes && release.changes.length > 0" class="changes-list">
                <div v-for="(change, idx) in release.changes" :key="idx" class="change-item">
                    <span class="change-type" :class="'type-' + change.type">
                        {{ getTypeLabel(change.type) }}
                    </span>
                    <span class="change-desc" v-html="change.text"></span>
                </div>
            </div>

            <div v-if="release.apiDiff && release.apiDiff.length > 0" class="api-diff-box">
                <div class="diff-header">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="diff-icon">
                        <polyline points="16 18 22 12 16 6"></polyline>
                        <polyline points="8 6 2 12 8 18"></polyline>
                    </svg>
                    API 签名变更
                </div>
                <div class="diff-content">
                    <div v-for="(line, lineIdx) in release.apiDiff" :key="lineIdx" class="diff-line" :class="line.type">
                        <span class="diff-prefix">{{ getDiffPrefix(line.type) }}</span>
                        <span class="diff-code">{{ line.code }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    releases: {
        type: Array,
        required: true,
        default: () => []
    }
});

// 转换变更类型的显示文案
const getTypeLabel = (type) => {
    const map = {
        feature: '✨ 新特性',
        fix: '🐛 修复',
        breaking: '⚠️ 破坏性变更',
        perf: '🚀 性能优化',
        docs: '📝 文档'
    };
    return map[type] || '✨ 变更';
};

// 获取 Diff 的前缀符号
const getDiffPrefix = (type) => {
    if (type === 'add') return '+';
    if (type === 'remove') return '-';
    if (type === 'modify') return '~';
    return ' ';
};
</script>

<style scoped>
/* 容器与时间轴基础线 */
.changelog-container {
    position: relative;
    margin-top: 32px;
    padding-left: 24px;
    border-left: 2px solid var(--vp-c-divider);
}

/* 时间轴节点与卡片整体 */
.release-item {
    position: relative;
    margin-bottom: 48px;
}

.timeline-dot {
    position: absolute;
    left: -31px;
    /* 对齐左侧线条 */
    top: 6px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: var(--vp-c-brand);
    border: 3px solid var(--vp-c-bg);
    /* 用背景色做遮罩产生镂空感 */
    box-shadow: 0 0 0 2px var(--vp-c-divider);
    z-index: 2;
}

/* 头部样式 */
.release-header {
    margin-bottom: 16px;
}

.release-version {
    margin: 0 0 8px 0 !important;
    font-size: 24px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 12px;
    border: none !important;
    /* 覆盖 VitePress 默认的 h2 底部边框 */
    padding: 0 !important;
}

.tag-latest {
    font-size: 12px;
    background-color: var(--vp-c-brand);
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: 600;
}

.release-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    font-family: var(--vp-font-family-mono);
}

.meta-date {
    color: var(--vp-c-text-2);
    font-weight: 500;
}

.meta-badge {
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid var(--vp-c-divider);
    background-color: var(--vp-c-bg-soft);
    color: var(--vp-c-text-2);
}

.meta-badge.core {
    border-color: var(--vp-c-indigo-soft);
    color: var(--vp-c-indigo-1);
    background: var(--vp-c-indigo-dimm-1);
}

.meta-badge.web {
    border-color: var(--vp-c-green-soft);
    color: var(--vp-c-green-1);
    background: var(--vp-c-green-dimm-1);
}

/* 摘要说明 */
.release-summary {
    color: var(--vp-c-text-1);
    font-size: 15px;
    line-height: 1.6;
    margin-bottom: 20px;
}

/* 变更列表 */
.changes-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
}

.change-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    font-size: 14px;
    line-height: 1.5;
    color: var(--vp-c-text-1);
}

.change-type {
    flex-shrink: 0;
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 6px;
    font-weight: 600;
}

.type-feature {
    background-color: var(--vp-c-brand-soft);
    color: var(--vp-c-brand-1);
}

.type-fix {
    background-color: var(--vp-c-yellow-soft);
    color: var(--vp-c-yellow-darker);
}

.type-breaking {
    background-color: var(--vp-c-red-soft);
    color: var(--vp-c-red-1);
    border: 1px solid var(--vp-c-red-dimm-1);
}

.type-perf {
    background-color: var(--vp-c-green-soft);
    color: var(--vp-c-green-1);
}

/* 暗色模式下修复黄色的对比度 */
:global(.dark) .type-fix {
    color: var(--vp-c-yellow-1);
}

/* API Diff 差异对比区域 */
.api-diff-box {
    background-color: var(--vp-c-bg-alt);
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
    overflow: hidden;
}

.diff-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background-color: var(--vp-c-bg-soft);
    border-bottom: 1px solid var(--vp-c-divider);
    font-size: 13px;
    font-weight: 600;
    color: var(--vp-c-text-2);
}

.diff-icon {
    width: 16px;
    height: 16px;
}

.diff-content {
    font-family: var(--vp-font-family-mono);
    font-size: 13px;
    padding: 8px 0;
    overflow-x: auto;
}

.diff-line {
    display: flex;
    padding: 2px 16px;
    white-space: pre;
}

.diff-prefix {
    width: 24px;
    flex-shrink: 0;
    user-select: none;
    opacity: 0.7;
}

/* Diff 颜色逻辑：添加为绿，删除为红，未修改为普通颜色 */
.diff-line.add {
    background-color: rgba(16, 185, 129, 0.1);
    color: var(--vp-c-green-1);
}

.diff-line.remove {
    background-color: rgba(239, 68, 68, 0.1);
    color: var(--vp-c-red-1);
    text-decoration: line-through;
    opacity: 0.8;
}

.diff-line.normal {
    color: var(--vp-c-text-2);
}
</style>