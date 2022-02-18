const plugins = require('./config/plugins');
const themeConfig = require('./config/theme');
module.exports = {
    theme: 'reco',
    title: 'RadCircle|半径圆站点',
    description: '半径积分成圆，互联网编织世界',
    head: [
        ['meta', {name: 'viewport', content: 'width=device-width,initial-scale=1,user-scalable=no'}],
        ['meta', {
            name: 'keywords',
            content: '半径圆,博客,前端,后端,Java,RadCircle'
        },
        ],
        ['link',{rel:'icon',href: 'icon.png'}]
        // ['script', {async: 'async', src: 'https://hm.baidu.com/hm.js?27c61fbfe7c9201c97b53d619459c89d'}],
    ],
    themeConfig,
    plugins
};