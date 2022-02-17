const path = require('path'); // 路径模块
const utilsRoot = path.join(__dirname, '..', 'utils');
const docsRoot = path.join(__dirname,'..', '..');
const readFile = require(utilsRoot + '/readFile');

const 多目录 = readFile(docsRoot + '/多目录');
const 单目录 = [{
    title: '单目录标题',
    collapsable: false,
    children: readFile(docsRoot + '/单目录')
}]
const 指南 = [{
    title: '基础',
    collapsable: false,
    children: readFile(docsRoot + '/指南')
}]


const themeConfig = {
  editLinks: true,
  smoothScroll: true,
  lastUpdated: '最后更新时间',
  nav: [{
        text: '指南',
        link: '/指南/01.介绍',
      },
      {
        text: '单目录',
        link: '/单目录/01.文章一',
      },{
        text: '多目录',
        link: '/多目录/01.章节1/01.章节1-1',
      },
      
  ],
  
  sidebar: {
    '/指南/': 指南,
    '/单目录/': 单目录,
    '/多目录/': 多目录,
  },
};

module.exports = themeConfig;
