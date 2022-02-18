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
    repo: 'https://github.com/iznilul',
    repoLabel: 'Github',
    editLinks: true,
    smoothScroll: true,
    lastUpdated: '最后更新时间',
    nav: [
        {
          text:"首页",
          link:"/",
          icon:"reco-home"
        },
        {
            text: '笔记',
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
        },
        {
            text: '随笔',
            link: '/essay/1.about',
        },
        {
            text: '关于我',
            link: '/me/1.about',
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
