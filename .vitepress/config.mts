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
        text: '插件介绍介绍',
        items: [
          { text: 'plugins 介绍', link: '/plugins/README.md' },
          { text: 'LeviTPSystem - 传送系统', link: '/plugins/1.md' },
          { text: 'Auto-organizing - 自动整理', link: '/plugins/2.md' },
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
