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
          { text: '自动替换工具与补充物品', link: '/plugins/4.md' },
          { text: '预览无法打开的容器', link: '/plugins/5.md' },
          { text: '死亡掉落箱', link: '/plugins/6.md' },
          { text: '灵魂出窍', link: '/plugins/7.md' },
          { text: '突破下界高度', link: '/plugins/8.md' },
          { text: '禁用猪人塔', link: '/plugins/9.md' },
          { text: '侧边栏信息', link: '/plugins/10.md' },
          { text: '攻击显示血量', link: '/plugins/11.md' },
          { text: '铁块电梯', link: '/plugins/12.md' },
          { text: '无敌时间', link: '/plugins/13.md' },
          { text: '统计玩家数据', link: '/plugins/14.md' },
          { text: '签到系统', link: '/plugins/15.md' },
          { text: '展示手中物品', link: '/plugins/16.md' },
          { text: '假人系统', link: '/plugins/17.md' },
          { text: '付费更换天气/时间', link: '/plugins/18.md' },
          { text: '修仙系统', link: '/plugins/19.md' },
          { text: '生电地毯', link: 'https://coralfans-dev.github.io/CoralFans-doc/#/MainDoc' },
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
