const path = require('path'); // 路径模块
const utilsRoot = path.join(__dirname, '..', 'utils');
const docsRoot = path.join(__dirname, '..', '..');
const readFile = require(utilsRoot + '/readFile');

const java = readFile(docsRoot + '/notes/java')
const algorithm = readFile(docsRoot + '/notes/algorithm')
const books = readFile(docsRoot + '/notes/books')
const mq = readFile(docsRoot + '/notes/mq')
const network = readFile(docsRoot + '/notes/network')
const os = readFile(docsRoot + '/notes/os')
const web = readFile(docsRoot + '/notes/web')

const projects = readFile(docsRoot + '/projects')

const essay = [{
    title: '日常随笔',
    collapsible: true,
    children: readFile(docsRoot + '/essay')
}]

const me = [{
    title: '关于我',
    collapsible: false,
    children: readFile(docsRoot + '/me')
}]

const themeConfig = {
    type: 'HomePage',

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
    // 项目开始时间
    startYear: '2022',
    // 简体中文
    locales: {
        '/': {
            lang: 'zh-CN',
        },
    },

    // noFoundPageByTencent: false,

    repo: 'https://github.com/iznilul',
    repoLabel: 'Github',

    smoothScroll: true,
    markdown: {
        lineNumbers: true
    },
    blogConfig: {
        tag: {
            location: 3,     // 在导航栏菜单中所占的位置，默认3
            text: '标签'      // 默认文案 “标签”
        },
    },
    nav: [
        {
            text: "首页",
            link: "/",
            icon: "reco-home"
        },
        {
            text: '笔记',
            icon: 'reco-category',
            items: [
                {
                    text: "Java",
                    link: "/notes/java/1.about"
                },
                {
                    text: "web开发",
                    link: "/notes/web/1.about"
                },
                {
                    text: "网络",
                    link: "/notes/network/1.about"
                },
                {
                    text: "数据结构与算法",
                    link: "/notes/algorithm/1.about"
                },
                {
                    text: "消息队列",
                    link: "/notes/mq/1.about"
                },
                {
                    text: "操作系统",
                    link: "/notes/os/1.about"
                },
                {
                    text: "书籍分享",
                    link: "/notes/books/1.about"
                },
            ]
        }, {
            text: '开源项目',
            link: '/projects/1.about',
            icon: 'reco-coding'
        },
        {
            text: '随笔',
            link: '/essay/1.about',
            icon: 'reco-document'
        },
        {
            text: '关于我',
            link: '/me/1.about',
            icon: 'reco-eye'
        },

    ],

    sidebar: {
        '/notes/java/': java,
        '/notes/web/': web,
        '/notes/network/': network,
        '/notes/algorithm/': algorithm,
        '/notes/mq/': mq,
        '/notes/os/': os,
        '/notes/books/': books,
        '/projects/': projects,
        '/essay/': essay,
        '/me/': me
    },
};

module.exports = themeConfig;
