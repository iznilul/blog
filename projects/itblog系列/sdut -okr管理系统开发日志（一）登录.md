# sdut -okr管理系统开发日志（一）登录

[TOC]



## 0x01 前言

作为还有一年就毕业的老学长，从实验室正式跑路之前想开发一套系统用于日后实验室的维护和宣传，就联合了在学校的两个实验室合作开发，完成之后可以一起使用这套系统。(不过俺得先负责架构，springboot和vue学的太烂，所以进度缓慢( ╯□╰ ))

## 0x02 系统设计

![http://image.radcircle.love/488b4d433bf34fc1bebf736025ce8cd9](http://image.radcircle.love/488b4d433bf34fc1bebf736025ce8cd9)

![http://image.radcircle.love/25674de31a0b4dd1b5628dd5e13b4719](http://image.radcircle.love/25674de31a0b4dd1b5628dd5e13b4719)

![http://image.radcircle.love/325c3a7191c24889b82aa62e49d7dca0](http://image.radcircle.love/325c3a7191c24889b82aa62e49d7dca0)

前端轮子：大佬“[fwing1987](https://github.com/fwing1987)/”的项目“KKING”：https://github.com/fwing1987/KKing ant-design-vue-pro部分

后端轮子：准备用实验室同学的项目，一个考勤系统整合

服务器是阿里云的学生机( ╯□╰ )，目前还没有部署

## 0x03  记录&踩坑

刚开始开发，所以免不了踩坑，由于前后端有很多不明原因不兼容，所以干脆删了后端重新开始orz，目前只保留了一个登录功能

下面集中总结一下这次开发遇到的问题

### 跨域

![http://image.radcircle.love/c4be4e5ef8304b1db24898c1fa645efb](http://image.radcircle.love/c4be4e5ef8304b1db24898c1fa645efb)

由于是前后端分离的项目，**前端和后端运行在不同的端**上，现代浏览器的特性决定了这种前端发往后端的请求属于跨域

也就是**跨域资源共享(CORS)**

**非简单的CORS请求**（请求是PUT或者DELETE，或者Content-Type为application/json），会在正式通信前，**增加一次HTTP查询请求，称之为预检请求(OPTIONS)**

需要在后端配置上加入

```java
@Configuration
public class CorsConfiguration implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedMethods("*")
                .allowedOrigins("*")
                .allowedHeaders("*");
    }
}
```

### vuex状态管理

写vue可以一大痛点，因为我一直主要写后端多，前端像是vue和js都是浅尝辄止，这个机会学习一下

vuex可以说是vue的辅助功能，可以集中管理一些状态变量和方法，我个人用java的理解是

**各个vue文件里保存的都是private方法，vuex就像java里的public类，里面集成了一些vue模块可以共用的public方法和public变量**

这样开发中单个vue文件中只需要保存一些仅此vue文件使用的方法和变量，公用的变量和方法放vuex中

![http://image.radcircle.love/21525c94a7f147d197f768155f248063](http://image.radcircle.love/21525c94a7f147d197f768155f248063)

### ES6扩展运算符...

说实话，一开始这三个点我现在也不完全明白是怎么用的，应该是和钩子函数配合使用OvO？

```javascript
console.log(...[1,2,3])
console.log([1,2,3])
```

![http://image.radcircle.love/fa8caa4432b74c2495e27ffe7faa7cb8](http://image.radcircle.love/fa8caa4432b74c2495e27ffe7faa7cb8)

### 异步函数，箭头函数和Promise

这个部分学到的还是蛮多的

#### 异步函数：

在浏览器工作过程中，JavaScript只有一个主线程负责解释和执行js代码，当主线程遇到IO时间比较长的函数，就需要考虑用到异步函数来提高性能了

（套用思否大佬的博客）

- 异步AJAX：

> - **主线程：**“你好，AJAX线程。请你帮我发个HTTP请求吧，我把请求地址和参数都给你了。”
> - **AJAX线程：**“好的，主线程。我马上去发，但可能要花点儿时间呢，你可以先去忙别的。”
> - **主线程：**：“谢谢，你拿到响应后告诉我一声啊。”
> - (接着，主线程做其他事情去了。一顿饭的时间后，它收到了响应到达的通知。)

- 同步AJAX：

> - **主线程：**“你好，AJAX线程。请你帮我发个HTTP请求吧，我把请求地址和参数都给你了。”
> - **AJAX线程：**“......”
> - **主线程：**：“喂，AJAX线程，你怎么不说话？”
> - **AJAX线程：**“......”
> - **主线程：**：“喂！喂喂喂！”
> - **AJAX线程：**“......”
> - (一炷香的时间后)
> - **主线程：**：“喂！求你说句话吧！”
> - **AJAX线程：**“主线程，不好意思，我在工作的时候不能说话。你的请求已经发完了，拿到响应

```javascript
setTimeout(() => 
{
  this.$notification.success({
    message: '欢迎',
    description: `${timeFix()}，欢迎回来`
  })
},
1000)
```

这个就是个异步函数,setTimeout是发起函数，第二行到倒数第二行封装了一个callback回调函数，1000是这个发起函数需要的参数

异步函数的执行流程

![http://image.radcircle.love/80c86a8545554c0c8935716305436a10](http://image.radcircle.love/80c86a8545554c0c8935716305436a10)

消息队列中放的**消息**具体是什么东西？消息的具体结构当然跟具体的实现有关，但是为了简单起见，我们可以认为：

> 消息就是注册异步任务时添加的回调函数。



#### 箭头函数

箭头函数是ES6的一种函数格式，还是拿这个函数举例子

```javascript
setTimeout(() => {
  this.$notification.success({
    message: '欢迎',
    description: `${timeFix()}，欢迎回来`
  })
}, 1000)
```

这个是箭头函数的版本，如果是普通版本

```javascript
setTimeout( async function() {
  this.$notification.success({
    message: '欢迎',
    description: `${timeFix()}，欢迎回来`
  })
}, 1000)
```

### import 花括号

在进行api模块的import是发现死活import不进来，发现在vue中import也是有讲究的

```javascript
import { userLogin } from '@/api/login'
```

像这种带着花括号的import，对应模块里的变量是需要export 类型 name 这个格式的

```javascript
export function userLogin(parameter) {
```

而这种常见类型的的，是因为引入的文件里有export default 语句

```javascript
import api  from '@/api/index'
export default api
```



## 0x04 总结&参考资料

目前效果图

![http://image.radcircle.love/6c9f7bf4123d41a8806235fc11a38f3a](http://image.radcircle.love/6c9f7bf4123d41a8806235fc11a38f3a)

![http://image.radcircle.love/d7d82180ab3a4e4e9b6301f494beb23e](http://image.radcircle.love/d7d82180ab3a4e4e9b6301f494beb23e)

目前只是完成了登录功能，而且功能很简单，就是route路由的配置有点麻烦，就不详细介绍了（主要是俺也不知道原理，还需要多看看书orz），后面会应该会先部署到线上再持续优化QvQ

参考资料

https://blog.csdn.net/socct_yj/article/details/107233627

https://segmentfault.com/a/1190000018559465

https://blog.csdn.net/qq_30100043/article/details/53391308