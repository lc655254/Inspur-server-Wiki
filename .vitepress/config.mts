import { defineConfig } from 'vitepress'
import { pagefindPlugin } from 'vitepress-plugin-pagefind'


// https://vitepress.dev/reference/site-config
export default defineConfig({
  head:[['link', { rel: 'icon', href: '/logo.ico' }]],
  title: "Inspurs",
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
    server: {
      allowedHosts: ['www.inspurs.work', 'inspurs.work']
    }
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '主页面', link: '/' },
      { text: '服务器介绍', link: '/README.md' },
    ],

    sidebar: {
      '/': [
        {
          text: '服务器介绍',
          items: [
          { text: '生存服介绍', link: '/Survival.md' },
          { text: '空岛服介绍', link: '/Sky.md' },
          { text: '更新日志', link: '/UPDATE.md' },
          ]
       }
      ]
    },
    footer: {
      message: '此服务器与 Mojang Studio、网易、Microsoft 没有从属关系。<br><a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">苏ICP备2026019959号-1</a>',
      copyright: 'Copyright © 2023-2026 Inspur server All Rights Reserved.'
    },
    socialLinks: [
      {
        icon: {
        svg: '<img src="/tubiao.svg" alt="SVG Image" width="21" height="21">'
      }, link: 'https://qm.qq.com/q/zTsUtxh876' }
    ]
  }
}
)
