<template>
    <div class="sponsor-grid">
        <component :is="isValidLink(sponsor.link) ? 'a' : 'div'" v-for="(sponsor, index) in sponsors" :key="index"
            :href="isValidLink(sponsor.link) ? sponsor.link : undefined"
            :target="isValidLink(sponsor.link) ? '_blank' : undefined" class="sponsor-card"
            :class="{ 'is-clickable': isValidLink(sponsor.link) }">
            <img :src="sponsor.avatar" :alt="sponsor.name" class="sponsor-avatar" loading="lazy" />
            <div class="sponsor-info">
                <h4 class="sponsor-name">{{ sponsor.name }}</h4>
                <p class="sponsor-message">“{{ sponsor.message }}”</p>
            </div>
        </component>
    </div>
</template>

<script setup>
defineProps({
    sponsors: {
        type: Array,
        default: () => []
    }
});

// 辅助函数：判断是否为需要跳转的有效链接
const isValidLink = (link) => {
    return link && link !== '';
};
</script>

<style scoped>
.sponsor-grid {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    margin-top: 24px;
}

/* 基础卡片样式 */
.sponsor-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background-color: var(--vp-c-bg-soft);
    border: 1px solid transparent;
    border-radius: 12px;
    transition: all 0.25s ease;
    text-decoration: none !important;
    /* 防止 a 标签自带的下划线 */
    color: inherit;
    /* 防止 a 标签字体变蓝 */
}

/* 头像样式 */
.sponsor-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    border: 1px solid var(--vp-c-divider);
}

.sponsor-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
}

.sponsor-name {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--vp-c-text-1);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.sponsor-message {
    margin: 0;
    font-size: 13px;
    color: var(--vp-c-text-2);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-style: italic;
}

/* --- 新增：只有可点击的卡片才显示鼠标手型和悬浮动效 --- */
.sponsor-card.is-clickable {
    cursor: pointer;
}

.sponsor-card.is-clickable:hover {
    border-color: var(--vp-c-brand-1, var(--vp-c-brand));
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
</style>