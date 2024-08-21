import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Inspur-server Wiki",
  description: "一个不错的基岩版插件生存服务器",
  base: '/Inspur-server-Wiki',
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
          { text: 'Auto-Cleaner - 自动清理', link: '/plugins/3.md' },
          { text: 'BackupHelper - 自动备份', link: '/plugins/4.md' },
          { text: 'BanPl - 封禁系统', link: '/plugins/5.md' },
          { text: 'BDSLM_JS - 卫星地图', link: '/plugins/6.md' },
          { text: 'BehaviorLog - 行为记录', link: '/plugins/7.md' },
          { text: 'BETweakerPro - 生存辅助', link: '/plugins/8.md' },
          { text: 'call - 创世神', link: '/plugins/9.md' },
          { text: 'CDK - 兑换系统', link: '/plugins/10.md' },
          { text: 'Changeweather - 玩家付费控制天气', link: '/plugins/11.md' },
          { text: 'CleanerUnknownBlock - 清理未知方块', link: '/plugins/12.md' },
          { text: 'CloneItem - 复制手上方块', link: '/plugins/13.md' },
          { text: 'CMENU -菜单', link: '/plugins/14.md' },
          { text: 'ContentLogBlocker - 屏蔽 BDS 的 addon 报错', link: '/plugins/15.md' },
          { text: 'CustomGetMap - 地图画辅助', link: '/plugins/16.md' },
          { text: 'CustomMap - 地图画', link: '/plugins/17.md' },
          { text: 'DailyOrder - 每日委托', link: '/plugins/18.md' },
          { text: 'BackupHelper - 自动备份', link: '/plugins/4.md' },
          { text: 'BackupHelper - 自动备份', link: '/plugins/4.md' },
          { text: 'BackupHelper - 自动备份', link: '/plugins/4.md' },
          { text: 'BackupHelper - 自动备份', link: '/plugins/4.md' },
          { text: 'BackupHelper - 自动备份', link: '/plugins/4.md' },
          { text: 'BackupHelper - 自动备份', link: '/plugins/4.md' },
          { text: 'BackupHelper - 自动备份', link: '/plugins/4.md' },
          { text: 'BackupHelper - 自动备份', link: '/plugins/4.md' },
          { text: 'BackupHelper - 自动备份', link: '/plugins/4.md' },
          { text: 'BackupHelper - 自动备份', link: '/plugins/4.md' },
          { text: 'BackupHelper - 自动备份', link: '/plugins/4.md' },
          { text: 'BackupHelper - 自动备份', link: '/plugins/4.md' },
          { text: 'BackupHelper - 自动备份', link: '/plugins/4.md' },
          { text: 'BackupHelper - 自动备份', link: '/plugins/4.md' },
          { text: 'BackupHelper - 自动备份', link: '/plugins/4.md' },
          { text: 'BackupHelper - 自动备份', link: '/plugins/4.md' },
          { text: 'BackupHelper - 自动备份', link: '/plugins/4.md' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://qm.qq.com/q/zTsUtxh876' }
    ]
  }
})