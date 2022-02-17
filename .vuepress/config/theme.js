const path = require('path'); // 路径模块
const utilsRoot = path.join(__dirname, '..', 'utils');
const docsRoot = path.join(__dirname, '..', '..');
const readFile = require(utilsRoot + '/readFile');

const java = readFile(docsRoot + '/notes/java');
const javascript = readFile(docsRoot + '/notes/javascript');

const projects = [{
    title: '开源项目',
    collapsable: false,
    children: readFile(docsRoot + '/projects')
}]

const essay = [{
    title: '日常随笔',
    collapsable: false,
    children: readFile(docsRoot + '/essay')
}]

const about = [{
    title: '关于我',
    collapsable: false,
    children: readFile(docsRoot + '/about')
}]

const themeConfig = {
    editLinks: true,
    smoothScroll: true,
    lastUpdated: '最后更新时间',
    nav: [
        {
            text: '文章',
            items: [
                {
                    text: "java",
                    link:"/notes/java/README"
                },
                {
                    text: "javascript",
                    link:"/notes/javascript/README"
                }
            ]
        }, {
            text: '开源项目',
            link: '/projects/README',
        },
        {
            text: '随笔',
            link: '/essay/README',
        },
        {
            text: '关于我',
            link: '/about/README',
        },

    ],

    sidebar: {
        '/notes/java/': java,
        '/notes/javascript/': javascript,
        '/projects/':projects,
        '/essay/':essay,
        '/about/':about
    },
};

module.exports = themeConfig;
