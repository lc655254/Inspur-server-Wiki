import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Inspur-server Wiki",
  description: "一个不错的基岩版插件生存服务器",
  base: '/',
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

    socialLinks: [
      {
        icon: {
        svg: '<img src="/tubiao.src" alt="SVG Image" width="21" height="21">'
      }, link: 'https://qm.qq.com/q/zTsUtxh876' }
    ]
  }
})
