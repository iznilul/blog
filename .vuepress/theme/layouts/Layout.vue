<template>
  <Common :sidebarItems="sidebarItems" :recoShowModule="recoShowModule">
    <component v-if="$frontmatter.home" :is="homeCom"/>
    <Page v-else :sidebar-items="sidebarItems"/>
    <Footer v-if="$frontmatter.home" class="footer" />
  </Common>
</template>

<script>
import Home from '@theme/components/Home'
import HomePage from '@theme/components/HomePageOne'
import HomeBlog from '@theme/components/HomeBlog'
import Page from '@theme/components/Page'
import Footer from '@theme/components/Footer'
import Common from '@theme/components/Common'
import { resolveSidebarItems } from '@theme/helpers/utils'
import moduleTransitonMixin from '@theme/mixins/moduleTransiton'

export default {
  mixins: [moduleTransitonMixin],
  components: { HomeBlog, Home, HomePage, Page, Common, Footer },
  computed: {
    sidebarItems () {
      return resolveSidebarItems(
        this.$page,
        this.$page.regularPath,
        this.$site,
        this.$localePath
      )
    },
    homeCom () {
      const { type } = this.$themeConfig
      if (type !== undefined) {
        return type == 'blog' ? 'HomeBlog' : type
      }
      return 'Home'
    }
  }
}
</script>

<style src="../styles/theme.styl" lang="stylus"></style>
