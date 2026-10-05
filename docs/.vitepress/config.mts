import { defineConfig } from 'vitepress'
import { entryCardPlugin } from './entry-card-plugin'

// 34 章标题与路径（内容来自上游 eternity4719/HowToLiveBetter，未改动正文）
const chapters = [
  ['01-不要早死', '不要早死'],
  ['02-不要慢慢死', '不要慢慢死'],
  ['03-不要浪费精力', '不要浪费精力'],
  ['04-不要浪费时间', '不要浪费时间'],
  ['05-不要浪费钱', '不要浪费钱'],
  ['06-反面清单', '反面清单'],
  ['07-没钱的时候怎么活', '没钱的时候怎么活'],
  ['08-别把自己搭进去', '别把自己搭进去'],
  ['09-普通人容易踩的法律红线', '普通人容易踩的法律红线'],
  ['10-恋爱和结婚划不划算', '恋爱和结婚划不划算'],
  ['11-程序员和技术人容易踩的红线', '程序员和技术人容易踩的红线'],
  ['12-创业与做生意', '创业与做生意'],
  ['13-紧急情况', '紧急情况'],
  ['14-账号与信息安全', '账号与信息安全'],
  ['15-租房与买房', '租房与买房'],
  ['16-得了慢性病之后怎么活', '得了慢性病之后怎么活'],
  ['17-家里有老人', '家里有老人'],
  ['18-养孩子划不划算', '养孩子划不划算'],
  ['19-在职离职和工伤', '在职离职和工伤'],
  ['20-刚出生的孩子怎么带', '刚出生的孩子怎么带'],
  ['21-出国旅行与境外安全', '出国旅行与境外安全'],
  ['22-怎么放松', '怎么放松'],
  ['23-学什么技能划算', '学什么技能划算'],
  ['24-看病', '看病'],
  ['25-人走了以后要办什么', '人走了以后要办什么'],
  ['26-做一个网站或平台', '做一个网站或平台'],
  ['27-怀孕和生产', '怀孕和生产'],
  ['28-别为了外形把身体搞坏', '别为了外形把身体搞坏'],
  ['29-遭遇重大打击之后', '遭遇重大打击之后'],
  ['30-上学以后的孩子', '上学以后的孩子'],
  ['31-十八岁之后有哪几条路', '十八岁之后有哪几条路'],
  ['32-出国留学', '出国留学'],
  ['33-残疾之后怎么活', '残疾之后怎么活'],
  ['34-家里的常备药别吃出事', '家里的常备药别吃出事'],
]

export default defineConfig({
  lang: 'zh-CN',
  title: '高性价比人生指南',
  description: '开源书《高性价比人生指南》在线阅读站：34 节、600+ 条建议，每条标注成本、收益、证据等级与原始文献。',

  lastUpdated: true,
  cleanUrls: true,

  markdown: {
    config(md) {
      md.use(entryCardPlugin)
    },
  },

  head: [
    ['meta', { name: 'theme-color', content: '#3451b2' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
  ],

  themeConfig: {
    logo: { light: '/logo-light.svg', dark: '/logo-dark.svg', alt: '指南' },
    nav: [
      { text: '阅读指南', link: '/01-不要早死' },
      { text: '关于本书', link: '/about' },
      { text: '上游仓库', link: 'https://github.com/eternity4719/HowToLiveBetter' },
    ],

    sidebar: [
      {
        text: '全书 34 节',
        items: chapters.map(([path, title]) => ({ text: title, link: `/${path}` })),
      },
      {
        text: '专题与补充',
        items: [
          { text: '家庭应急装备清单', link: '/家庭应急装备清单' },
          { text: '生物钟和夜班', link: '/生物钟和夜班' },
          { text: '遇到陌生人出事该不该停', link: '/遇到陌生人出事该不该停' },
          { text: '结婚划不划算', link: '/结婚划不划算' },
          { text: '做平台要办哪些证', link: '/做平台要办哪些证' },
          { text: '刚确诊慢性病之后', link: '/刚确诊慢性病之后' },
          { text: '孩子出生前后要办的事', link: '/孩子出生前后要办的事' },
          { text: '被裁了之后先做什么', link: '/被裁了之后先做什么' },
        ],
      },
      {
        text: '附录',
        items: [
          { text: '引用对照', link: '/引用对照' },
          { text: '关于本书', link: '/about' },
        ],
      },
    ],

    outline: {
      level: [2, 3],
      label: '本节目录',
    },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索全书', buttonAriaLabel: '搜索全书' },
          modal: {
            noResultsText: '没有找到相关内容',
            resetButtonTitle: '清除查询',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' },
          },
        },
      },
    },

    docFooter: {
      prev: '上一节',
      next: '下一节',
    },

    darkModeSwitchLabel: '明暗模式',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    sidebarMenuLabel: '目录',
    returnToTopLabel: '回到顶部',
    lastUpdated: { text: '更新于', format: 'YYYY-MM-DD' },
    externalLinkIcon: true,

    footer: {
      message: '内容来自 eternity4719/HowToLiveBetter（Unlicense，公有领域）· 构建脚本同作公有领域',
      copyright: '高性价比人生指南',
    },
  },
})
