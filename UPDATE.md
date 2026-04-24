# 更新日志

<script setup>
import ChangelogList from './.vitepress/components/ChangelogList.vue'

const releaseData = [
  {
    version: "v3.0.0",
    isLatest: true,
    date: "2026-04-19",
    summary: "本次更新优化刷石机机制并修复岛屿重叠问题",
    changes: [
      { type: 'feature', text: '刷石机新增机制：Y≤20 时生成的圆石/矿石变为深层变种' },
      { type: 'fix', text: '修复岛屿会重叠在一起的 BUG' },
      { type: 'fix', text: '修复部分可能出现的崩服 BUG' },
      { type: 'fix', text: '修复 TPA 异常报错' }
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
