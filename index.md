---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Inspurs"
  text: "更新更好的MC服务器"
  tagline: ✨全新的服务器火热运营中✨
  image:
    src: /logo0.png
  actions:
    - theme: brand
      text: 服务器介绍
      link: /README.md
    - theme: alt
      text: 建议反馈
      link: /FK.html
    - theme: alt
      text: 更新日志
      link: /UPDATE.md
    - theme: alt
      text: 点我加入群聊
      link: https://qm.qq.com/q/46c2WQlMG4

features:
  - title: 机制丰富优良
    details: 多样化的各种机制等待你的开发挖掘
    link: https://www.bing.com/search?q=MC%E6%9C%BA%E5%88%B6%E5%A4%A7%E5%85%A8&qs=ds&form=QBRE
  - title: 多样玩法自由
    details: 生电、建筑、养老等等各种玩法
    link: https://cn.bing.com/search?q=MC%E7%8E%A9%E6%B3%95%E5%A4%A7%E5%85%A8&qs=n&form=QBRE&sp=-1&lq=0&pq=mc%E7%8E%A9%E6%B3%95da%27q&sc=8-8&sk=&cvid=FCB5F07C85DC4210BE5B0364A3D153CD&ghsh=0&ghacc=0&ghpl=
  - title: 问题及时修复
    details: 做到当天反馈当天修复 一切都为玩家的良好体验
    link: https://bugs.mojang.com/projects/MCPE/summary
  - title: 服主和谐友善
    details: 有问必答 随便问我
    link: https://www.doubao.com/
---

## 如何游玩

```
生存服
mc.inspurs.work
52700

空岛服
mc.inspurs.work
41055
```

<script setup>
import SponsorList from '/.vitepress/components/SponsorList.vue'

const mySponsors = [
  {
    name: '蓝苺不是莓',
    avatar: 'https://s41.ax1x.com/2026/04/06/peN2ORf.jpg',
    message: '大好兽',
    link: 'https://api.mmp.cc/api/qqhome?text=2567207093'
  },
  {
    name: '清纯稳重大哥哥',
    avatar: 'https://s41.ax1x.com/2026/04/05/pet4zTJ.jpg',
    message: '不处',
    link: 'https://api.mmp.cc/api/qqhome?text=3766404362'
  },
  {
    name: '小圆',
    avatar: 'https://s41.ax1x.com/2026/04/05/pet5vgP.jpg',
    message: '知度，稳行',
    link: 'https://b23.tv/lE7lBRV'
  },
  {
    name: '言旭',
    avatar: 'https://s41.ax1x.com/2026/04/05/petIZvV.jpg',
    message: '蘸豆！',
    link: 'https://www.mps.gov.cn/index.html'
  },
  {
    name: '莱幸',
    avatar: 'https://s41.ax1x.com/2026/04/05/petIDPA.jpg',
    message: '旅行家',
    link: 'https://b23.tv/F2U8ZtL'
  },
  {
    name: 'crz1997',
    avatar: 'https://s41.ax1x.com/2026/04/05/petIHMV.jpg',
    message: '小李',
    link: 'https://api.mmp.cc/api/qqhome?text=754579830'
  },
  {
    name: '叶落长安',
    avatar: 'https://s41.ax1x.com/2026/04/05/petoro4.jpg',
    message: '叶落长安',
    link: 'https://www.chinamartyrs.gov.cn/'
  },
  {
    name: '乐',
    avatar: 'https://s41.ax1x.com/2026/04/05/petoITe.jpg',
    message: '乐',
    link: 'https://api.mmp.cc/api/qqhome?text=3565303342'
  },
  {
    name: '猫猫',
    avatar: 'https://s41.ax1x.com/2026/04/06/peN7htg.jpg',
    message: '猫猫老糖了',
    link: 'https://api.mmp.cc/api/qqhome?text=1585783905'
  },
  {
    name: '如梭',
    avatar: 'https://s41.ax1x.com/2026/04/06/peN74hQ.jpg',
    message: '你随便',
    link: 'https://api.mmp.cc/api/qqhome?text=3367094820'
  }
]
</script>

## Inspurs的赞助者

<SponsorList :sponsors="mySponsors" />
