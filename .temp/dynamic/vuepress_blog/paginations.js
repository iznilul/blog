/**
 * Generated by "@vuepress/plugin-blog"
 */

import sorters from './pageSorters'
import filters from './pageFilters'

export default [{
  pid: "tags",
  id: "vue",
  filter: filters.tags,
  sorter: sorters.tags,
  pages: [{"path":"/tag/vue/","interval":[0,9]}],
  prevText: "Prev",
  nextText: "Next",
},
{
  pid: "tags",
  id: "webpack",
  filter: filters.tags,
  sorter: sorters.tags,
  pages: [{"path":"/tag/webpack/","interval":[0,9]}],
  prevText: "Prev",
  nextText: "Next",
}]