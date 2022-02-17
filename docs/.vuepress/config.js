const path = require('path')
const utilsRoot = path.join()
module.exports = {
    // 页面标题
    title: '半径圆小站',
    // 网页描述
    description: '闲人野站，欢迎光临',
    head: [
        // 页面icon
        ['link', {rel: 'icon', href: '/icon.png'}]
    ],
    // 端口号
    port: 3000,
    markdown: {
        // 代码块行号
        lineNumbers: true
    },
    themeConfig: {
        // 最后更新时间
        lastUpdated: '最后更新时间',

        //查找
        searchMaxSuggestions: 10,

        // 导航
        nav: [
            {text: '主页', link: '/'},
            {
                text: '技术笔记', items: [
                    {text: "java", link: "/notes/java/"},
                    {text: "javascript", link: "/notes/javascript/"},
                    {text: "python", link: "/notes/python/"}
                ]
            },
            {text:"开源项目",link:"/projects/"},
            {text:"生活随笔",link:"/essay"}
        ],

        // 所有页面自动生成侧边栏
        sidebar: 'auto',

        // 仓库地址
        repo: 'https://github.com/iznilul',
        // 仓库链接label
        repoLabel: 'Github主页',

    },
    configureWebpack: {
        resolve: {
            // 静态资源的别名
            alias: {
                // '@vuepress': '../images/vuepress',
                // '@vue': '../images/vue'
            }
        }
    }
}
