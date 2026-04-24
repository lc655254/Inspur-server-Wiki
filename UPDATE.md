# 更新日志

<script setup>
import ChangelogList from './.vitepress/components/ChangelogList.vue'

const releaseData = [
  {
    version: "v3.5.0",
    isLatest: true,
    date: "2026-04-25",
    summary: "新增反馈社区、用户系统、点赞/踩、评论表情、管理员工具，修复多项问题",
    changes: [
      { type: 'feature', text: '全新反馈社区（公开反馈墙），支持列表、详情、评论、状态追踪' },
      { type: 'feature', text: '用户注册/登录系统，支持角色管理（普通用户与管理员）' },
      { type: 'feature', text: '反馈与评论支持点赞/踩功能，实时显示票数' },
      { type: 'feature', text: '评论区加入快捷表情面板，提升交流体验' },
      { type: 'feature', text: '管理员后台（/admin）可删除反馈、修改状态、填写处理进度' },
      { type: 'feature', text: '管理员可在公开反馈页一键跳转至管理后台' },
      { type: 'feature', text: '反馈提交表单优化「严重程度」UI，采用卡片式选项' },
      { type: 'feature', text: '登录/退出时强制刷新页面，确保权限状态即时生效' },
      { type: 'fix', text: '修复管理员角色识别问题：指定账号强制为管理员，无需手动修改数据库' },
      { type: 'fix', text: '修复旧反馈因 hidden 字段为 NULL 导致列表不可见的问题' },
      { type: 'fix', text: '修复评论删除权限：普通用户仅可删除自己评论，管理员可删除所有' },
      { type: 'fix', text: '修复管理后台 token 验证及删除反馈的 404 问题' },
      { type: 'refactor', text: '重构后端 API，新增反馈投票、评论投票、进度更新等接口' },
      { type: 'style', text: '统一前端组件与 VitePress 主题变量，完美适配亮/暗模式' },
      { type: 'style', text: '美化登录弹窗、按钮、下拉选框等组件，增强视觉一致性' }
    ]
  },
  {
    version: "v3.0.0",
    isLatest: false,
    date: "2026-04-19",
    summary: "本次更新优化刷石机机制并修复岛屿重叠问题",
    changes: [
      { type: 'feature', text: '刷石机新增机制：Y≤20 时生成的圆石/矿石变为深层变种' },
      { type: 'fix', text: '修复岛屿会重叠在一起的 BUG' },
      { type: 'fix', text: '修复部分可能出现的崩服 BUG' },
      { type: 'fix', text: '修复 TPA 异常报错' },
      { type: 'fix', text: '修复官网搜索功能无法正常使用' },
      { type: 'feature', text: '新增空岛服详细页面' },
      { type: 'feature', text: '新增如何进服详细页面' },
      { type: 'perf', text: '优化网页访问速度' }
    ]
  },
  {
    version: "v2.5.0",
    isLatest: false,
    date: "2026-04-04",
    summary: "本次更新修复诺干BUG",
    changes: [
      { type: 'fix', text: '修复群系功能无法正常使用' },
      { type: 'fix', text: '修复任务系统中人造村庄无法正常使用' },
      { type: 'fix', text: '修复一些可能出现的崩服BUG' },
      { type: 'fix', text: '修复FC灵魂出窍无法正常使用' },
      { type: 'fix', text: '修复任务完成之后末地无法正常前往' },
      { type: 'feature', text: '新增配方<br/><img src="/pf.png" style="max-width:100%; margin-top:8px;" />' }
    ]
  },
  {
    version: "v2.0.0",
    isLatest: false,
    date: "2026-03-30",
    summary: "本次更新重做空岛命令、新增实用科技模组、修复诺干BUG",
    changes: [
      { type: 'feature', text: '新增实用科技模组' },
      { type: 'feature', text: '新增横扫之刃机制' },
      { type: 'feature', text: '开放地狱、末地' },
      { type: 'feature', text: '任务系统全开放！' },
      { type: 'feature', text: '优化基岩版怪物刷新机制' },
      { type: 'perf', text: '重做空岛所有命令' },
      { type: 'fix', text: '修复传送系统未同意依然扣钱BUG' },
      { type: 'fix', text: '修复-59层方块低头无法选中BUG' },
      { type: 'docs', text: '还更新了不少，我不想写了....' }
    ]
  }
]
</script>

<ChangelogList :releases="releaseData" />
### [点我查看历史更新日志](/UPDATE_old.md)
