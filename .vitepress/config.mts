import { defineConfig } from 'vitepress'
import { pagefindPlugin } from 'vitepress-plugin-pagefind'


// https://vitepress.dev/reference/site-config
export default defineConfig({
  head:[['link', { rel: 'icon', href: '/logo.ico' }]],
  title: "Inspur server",
  description: "浪潮的MEBE插件生存服务器",
  base: '/',
  vite: {
    plugins: [pagefindPlugin({
      btnPlaceholder: '搜索',
      placeholder: '搜索文档',
      emptyText: '空空如也',
      heading: '共: {{searchResult}} 条结果',
      toSelect: '选择',
      toNavigate: '切换',
      toClose: '关闭',
      // searchBy: '',
    })],
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '主页面', link: '/' },
      { text: '服务器介绍', link: '/README.md' },
      { text: '插件列表', link: '/plugins/README.md' }
    ],

    sidebar: [
      {
        text: '服务器介绍',
        items: [
          { text: '服务器介绍', link: '/README.md' }
        ]
      },
      {
        text: '插件介绍',
        items: [
          { text: '插件列表', link: '/plugins/README.md' },
          { text: '传送系统', link: '/plugins/1.md' },
          { text: '自动整理', link: '/plugins/2.md' },
          { text: '兑换码', link: '/plugins/3.md' },
          { text: '发射器破坏方块', link: '/plugins/4.md' },
          { text: '钱包', link: '/plugins/7.md' },
          { text: '突破下界高度', link: '/plugins/8.md' },
          { text: '侧边栏信息', link: '/plugins/10.md' },
          { text: '无敌时间', link: '/plugins/13.md' },
          { text: '统计玩家数据', link: '/plugins/14.md' },
          { text: '签到系统', link: '/plugins/15.md' },
          { text: '假人系统', link: '/plugins/17.md' },
          { text: '通过精灵球捕捉生物', link: '/plugins/poke.md' },
          { text: '宝石强化', link: '/plugins/0504-1-zbqh.md' },
          { text: '强化卷轴', link: '/plugins/0504-2-juanzhou.md' },
          { text: '可投掷的烈焰弹', link: '/plugins/0504-3-lieyandan.md' },
          { text: '生电功能插件', link: 'https://coralfans-dev.github.io/CoralFans-doc/#/MainDoc' },
          { text: '灵魂出窍', link: '/plugins/fc.md' },
          { text: '领地系统', link: '/plugins/Pland.md' },
        ]
      }
    ],
    footer: {
      message: '此服务器与 Mojang Studio、网易、Microsoft 没有从属关系。',
      copyright: 'Copyright © 2023-2024 Inspur server All Rights Reserved.'
    },
    socialLinks: [
      {
        icon: {
        svg: '<img src="/tubiao.svg" alt="SVG Image" width="21" height="21">'
      }, link: 'https://qm.qq.com/q/zTsUtxh876' }
    ]
  }
})
