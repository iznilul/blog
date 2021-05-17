# 京东APP抓包分析-基于Charles

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

大概分析一下每一部分都干了什么