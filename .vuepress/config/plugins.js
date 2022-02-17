const plugins = [
    ['@vuepress/last-updated',{
        transformer: (timestamp) => {
        const dayjs = require('dayjs')
        return dayjs(timestamp,).format('YYYY-MM-DD HH:mm')
        }
    }],
]

module.exports = plugins;