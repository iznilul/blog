const path = require('path'); // 路径模块
const utilsRoot = path.join(__dirname, '..', 'utils');
const docsRoot = path.join(__dirname, '..', '..');
const readFile = require(utilsRoot + '/readFile');

const java = [{
    title: 'Java',
    collapsable: true,
    children: readFile(docsRoot + '/notes/java')
}]

const javascript = [{
    title: 'JavaScript',
    collapsable: true,
    children: readFile(docsRoot + '/notes/javascript')
}]

const projects = [{
    title: '开源项目',
    collapsable: true,
    children: readFile(docsRoot + '/projects')
}]

const essay = [{
    title: '日常随笔',
    collapsable: true,
    children: readFile(docsRoot + '/essay')
}]

const me = [{
    title: '关于我',
    collapsable: false,
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
          text:"首页",
          link:"/",
          icon:"reco-home"
        },
        {
            text: '笔记',
            icon:'reco-category',
            items: [
                {
                    text: "java",
                    link:"/notes/java/1.about"
                },
                {
                    text: "javascript",
                    link:"/notes/javascript/1.about"
                }
            ]
        }, {
            text: '开源项目',
            link: '/projects/1.about',
            icon:'reco-coding'
        },
        {
            text: '随笔',
            link: '/essay/1.about',
            icon:'reco-document'
        },
        {
            text: '关于我',
            link: '/me/1.about',
            icon:'reco-eye'
        },

    ],

    sidebar: {
        '/notes/java/': java,
        '/notes/javascript/': javascript,
        '/projects/':projects,
        '/essay/':essay,
        '/me/':me
    },
};

module.exports = themeConfig;
