const plugins = require('./config/plugins');
const themeConfig = require('./config/theme');
module.exports = {
  theme: 'reco',
  title: '半径圆の小站',
  description: '野站闲人，欢迎光临',
  head: [
    ['link', { rel: 'icon', href: 'https://cdn.jsdelivr.net/gh/qqlcx5/figure-bed@v1.0.0/image/polar_bear.jpg' }],
    ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1,user-scalable=no' }],
    ['meta', {
        name: 'keywords',
        content: '前端博客,个人技术博客,前端,前端开发,前端框架,web前端,前端面试题,技术文档,学习,面试,JavaScript,js,ES6,TypeScript,vue,python,css3,html5,Node,git,github,markdown'},
    ],
    ['meta', { name: 'theme-color', content: '#11a8cd' }],
    ['script', { async: 'async', src: 'https://hm.baidu.com/hm.js?27c61fbfe7c9201c97b53d619459c89d' }],
  ],
  themeConfig: {
    type: 'HomePage',
    // 导航栏图标
    logo: 'https://cdn.jsdelivr.net/gh/qqlcx5/figure-bed@v1.0.0/image/star-field.png',
    // 搜索设置
    search: true,
    searchMaxSuggestions: 10,
    sidebarDepth: 3,
    //在所有页面中启用自动生成子侧边栏，原 sidebar 仍然兼容
    subSidebar: 'auto',
    //代码主题
    codeTheme: 'tomorrow',
    // 最后更新时间
    lastUpdated: 'Last Updated',
    // 作者
    author: '半径圆',
    // 作者头像
    authorAvatar: 'https://cdn.jsdelivr.net/gh/qqlcx5/figure-bed@v1.0.0/image/star-field.png',
    // 项目开始时间
    startYear: '2022',
    // 简体中文
    locales: {
      '/': {
        lang: 'zh-CN',
      },
    },
    /**
     * valine 设置 (if you need valine comment )
     */
    // 使用valine的访问量检查
    // valineConfig: {
    //   appId: '8anL6vW9QmMARyRYyxcp6JvF-gzGzoHsz', // your appId
    //   appKey: 'PcK0E98cWGojnD9uVe43fev7', // your appKey
    //   // 全局关闭评论
    //   showComment: true,
    // },
    noFoundPageByTencent: false,
  },
  themeConfig,
  plugins
};