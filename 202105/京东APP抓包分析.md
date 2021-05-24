# 京东APP长连接抓包分析-基于Charles

[TOC]

## 前言

最近实习组长给的任务，分析一下jd的连接请求，因为移动端app所以用charles进行抓包的分析

## 工具准备

charles的下载https://www.cnblogs.com/peng-lan/p/11242954.html

试用三十天，可以下载补丁进行破解

### 安装电脑端证书

/Help/SSL Proxying/install charles root certificates

![img](http://image.radcircle.love/1abb1979485c448e94964e7a95ce85a0)

一直点确定就行

![img](http://image.radcircle.love/890d798dfe6942479136fe977afabda4)

然后在浏览器的证书页里导入

### 手机端安装证书

这里以android的小米手机为例

![img](http://image.radcircle.love/a40c7528d9d14779a0706562de83578c)

首先/Help/SSL Proxying/saveroot certificates下载证书，**cer格式**

上传到手机，记住上传目录

然后在手机的设置里进行安装

![img](http://image.radcircle.love/cf7d51d6cee346a79fae80a3e7ecd9f8)

![img](http://image.radcircle.love/8c86eb1a8dd74ddfbbf7e482b31331f2)

去小米手机**信任的凭证**里勾选对证书的信任

![img](http://image.radcircle.love/570689c4b4534d38adada73039b3fa9d)

/proxy/proxy settings电脑端开启8888端口代理

![img](http://image.radcircle.love/1a1cb3e58db64cbfa3787a53917851f6)

手机和电脑处在同一个wifi下，输入电脑的ip和端口

![img](http://image.radcircle.love/62d7070b8cf947879330a671dfda7b34)

好的，然后就可以进行抓包了

## 简要分析

这是请求一次jd，到进入主页面全部加载完毕抓到的包（所有的请求都是基于https的，如果返回结果显示unknown，则说明电脑端和手机端证书还没有搞定）

![img](http://image.radcircle.love/5f07387481c2424e9180eb66988a3581)

这一次分析除了搞清楚基本的网络请求，主要的任务是分析京东里面的**长连接**

先科普一下**TCP长连接和HTTP长连接**：

app和网页返回的内容通过**http**协议，http是无状态协议，HTTP协议永远都是客户端发起请求，服务器回送响应。每次连接只处理一个请求，当服务器返回本次请求的应答后便立即关闭连接，下次请求客户端再重新建立连接。也就无法实现在客户端没有发起请求的时候，服务器主动将消息推送给客户端。

HTTP协议运行在TCP协议之上，无状态会导致客户端的每次请求都需要重新建立TCP连接，接受到服务端响应后，断开TCP连接

http1.0默认使用短连接，http1.1默认使用长连接，二者的区别在于1.1的响应头里有

```
Connection:keep-alive
```

这个报头能让两者进行长久连接，不是永久的，会有一个连接最大时长，这个时长由服务器确定

简单分析长连接后，我们应该找找有哪些连接有这个返回头，划一个分析范围





参考资料:

https://juejin.cn/post/6844903775337971725

https://zhuanlan.zhihu.com/p/224595048

https://juejin.cn/post/6844903775337971725



