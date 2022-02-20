# sdut-okr开发日志（五）前端动画+特效插件+拆分

[TOC]

## 0x01 前言

github地址：https://github.com/iznilul/okr-app-web-dev

这次开发针对前端看起来特别low的问题做了一些处理orz，毕竟系统是给人用的嘛，总得整好看点。包括less样式优化，组件拆分，特效插件和其他功能等，所有参考的源代码回放到最下面的参考资料处

## 0x02 采用less样式

vue中可以在一个组件的<style></style>标签里设计样式，不过如果样式过长就不好管理了，为此，可以采取less/sass的预处理语言来进行css优化

```javascript
css: {
  loaderOptions: {
    less: {
      javascriptEnabled: true,
    },
  },
},
```

vue.config.js添加配置

![http://image.radcircle.love/c056c2ad73dc47a5b8abae183fc5f6db](http://image.radcircle.love/c056c2ad73dc47a5b8abae183fc5f6db)

把所有的样式文件放一个文件夹

```vue
<style lang="less">
@import '../style/views/Login';
@import '../style/animation/Fade';
</style>
```

这样每个vue组件只需要引入即可，节省空间还易于维护

## 0x03 特效插件

#### 登陆界面

![http://image.radcircle.love/111d196f4d6343b59aa452e2403c39d7](http://image.radcircle.love/111d196f4d6343b59aa452e2403c39d7)

登录界面采用了particles插件，源代码和安装步骤放在参考资料部分

```
import particles from 'particles.js'
import config from '../config/particlesConfig'

particlesJS('login', config)
```

引入依赖和配置文件后，把根容器的id和传进particlesJS函数即可看到效果

#### 主页

![http://image.radcircle.love/120bf6b3caab41ecb4630b33581c7d87](http://image.radcircle.love/120bf6b3caab41ecb4630b33581c7d87)

```vue
<vue-particles
  color="#1FD8DE"
  :particleOpacity="0.7"
  :particlesNumber="75"
  shapeType="circle"
  :particleSize="4"
  linesColor="#198BDE"
  :linesWidth="1"
  :lineLinked="true"
  :lineOpacity="0.4"
  :linesDistance="150"
  :moveSpeed="2"
  :hoverEffect="true"
  hoverMode="grab"
  :clickEffect="true"
  clickMode="push"
  class="lizi"
></vue-particles>
```

直接npm install   vue-particles 插件，使用根据需要再进行参数的修改就可以

## 0x04 验证码 & 轮播标签栏

#### 验证码

```vue
import Verify from 'vue2-verify'
```

```vue
<Modal v-model="visible" title="验证码" @on-success="change" @on-cancel="change">
  <verify type="slide" @success="onVerifySuccess" @error="onVerifyError" :show-button="false"></verify>
</Modal>
```

验证码组件采用的是vue2-verify，在组件进行引用

```js
change() {
    this.visible = !this.visible
  },

  onVerifySuccess(obj) {
    //验证码正确回调
    console.log('验证成功')
    this.$parent.submit('form')
    obj.refresh()
  },

  onVerifyError(obj) {
    //验证码错误回调
    console.log('验证失败')
    this.$Notice.error({
      title: '验证失败',
      desc: '请重新验证',
    })
    //错误刷新验证码
    obj.refresh()
    this.change()
  },
```

封装好成功和失败的回调函数，然后就可以在主页引用了

#### 轮播标签栏

```vue
<Tabs class="tabs" type="card" :value="currentTab">
  <TabPane label="CSDN" name="tab0">https://www.csdn.net/</TabPane>
  <TabPane label="掘金" name="tab1">https://juejin.cn/?sort=three_days_hottest</TabPane>
  <TabPane label="博客园" name="tab2">https://www.cnblogs.com/pick/</TabPane>
  <TabPane label="思否" name="tab3">https://segmentfault.com/blogs</TabPane>
</Tabs>
```

首先封装一个四个标签的标签栏，每个标签有一个独一无二的name作为标识，可以理解为key，然后给标签栏绑定value

，代表当前激活的标签

```js
this.timer = setInterval(() => {
  if (this.mouse === false) {
    this.currentTab = 'tab' + (this.tabNum++ % 4)
  }
  console.log(this.currentTab)
}, 3000)
```

然后在mounted里设置一个定时间隔函数，每过一定的时间就切换绑定的value值，达到轮播的效果

```html
<div class="news" @mouseenter="mouseChange" @mouseleave="mouseChange">
```

```javascript
mouseChange() {
  this.mouse = !this.mouse
},
```

而且可以给容器绑定一个监听函数，如果鼠标在标签栏上则停止轮播

## 0x05 css动画

这里采用了vue的<transition></transition>配合less样式文件进行css动画

```html
<transition appear name="move">
  <!-- 子页面 -->
  <router-view v-if="isShowRouter" @setAvatar="setAvatar" />
</transition>
```

在需要进行动画的地方引入transition标签，并声明name和appear（加载就渲染）

```less
@keyframes animationIn {
  0% {
    transform: translate(-100%, 0);
  }
  100% {
    transform: translate(0, 0);
  }
}
@keyframes animationOut {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(100%, 0);
  }
}

.move-enter {
  transform: translate(-100%, 0);
  position: absolute !important;
  z-index: 999;
  top: 0;
  left: 0;
  width: 100%;
}
.move-enter-active {
  animation: animationIn 0.5s;
  position: absolute !important;
  z-index: 999;
  top: 0;
  left: 0;
  width: 100%;
}
.move-leave {
  transform: translate(0, 0);
}
.move-leave-active {
  animation: animationOut 0.5s;
}
```

然后在相应的less文件下进行动画效果的编写，注意enter-active和leave-active等变量前要加上transition标签name属性，这样才能进行定位

![http://image.radcircle.love/c671ee58ec364eb1bd57254c39a8f314](http://image.radcircle.love/c671ee58ec364eb1bd57254c39a8f314)

查看动画效果，这里是主页路由路径变化后有个跳入的动画

## 0x06 拆分组件 & vuex全局存储

这里是比较困难的一部分，因为之前项目的主页部分是用的一个Index组件，里面代码和属性太多不易于维护，所以这次拆成了多个小组件，解代码耦合和提高扩展性

因为代码太多，就不一一详细说了，**核心就是活用组件通信方式，父组件传值callback回调，vuex全局数据管理，computed监听等等**

```html
<a-side ref="aside" @gotoPage="gotoPage" @changeMain="changeMain"> </a-side>
<section class="sec-right">
  <AHeader
    ref="aHeader"
    @triggerShrinkIcon="triggerShrinkIcon"
    @triggerUpdateMenu="triggerUpdateMenu"
    @gotoPage="gotoPage"
    @changeMain="changeMain"
  ></AHeader>
  <ATag @getNameToTitle="getNameToTitle" @gotoPage="gotoPage"> </ATag>
  <AContent @setAvatar="setAvatar"></AContent>
  <AFooter></AFooter>
</section>
```

主页面组件只需要引入子组件，注册会用到的父组件调用方法

```js
const getters = {
  menuItems: (state) => state.menu.menuItems,
  isShowAsideTitle: (state) => state.aside.isShowAsideTitle,
  isShowRouter: (state) => state.aside.isShowRouter,
  tagsArray: (state) => state.aside.tagsArray,
}
```

```js
state: {
  asideClassName: 'aside-big', // 控制侧边栏宽度变化
  isShowAsideTitle: true, // 是否展示侧边栏内容
  isShowRouter: true, //是否展示路由内容
},

mutations: {
  setIsShowAsideTitles(state, item) {
    state.isShowAsideTitle = item
  },
  setIsShowRouter(state, item) {
    state.isShowRouter = item
  },
  setAsideClassName(state, item) {
    state.asideClassName = item
  },
  },
```

使用vuex进行组件之间的共享数据的通信

```js
computed: {
  menuItems() {
    return this.$store.getters.menuItems
  },
  // 需要缓存的路由
  keepAliveData() {
    return this.$store.getters.tagsArray.map((item) => item.name)
  },
},
```

computed监听vuex里的数据变化

```js
getNameToTitle(name, callback) {
  let res = this.nameToTitle[name]
  callback(res)
},
```

```js
getNameToTitle(name) {
  let res = null
  this.$emit('getNameToTitle', name, (val) => {
    res = val
  })
  return res
},
```

使用回调函数调用父组件的方法，并获取返回值

过程是一个很蛋疼的过程，不停的看vue-devtools，出问题了看源代码，如此反复( ╯□╰ )

## 0x07 总结&参考资料

争取下次把个人信息页面和用户列表也整好看点orz

下雪特效codepen： https://codepen.io/n-sayenko/pen/qOXKVr

particles 在vue的使用：https://juejin.cn/post/6844904038706708488

vue搭配less过渡动画 ：https://juejin.cn/post/6844903682727772173

vue粒子组件：https://segmentfault.com/a/1190000021151133