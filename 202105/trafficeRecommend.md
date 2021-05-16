# TrafficeRecommendSystem交通推荐系统

交通出行推荐系统，基于Springboot+pySpark+Vue

这个项目其实很久之前就做好了，只是一直没有开源QvQ

为了让自己绿出强大，俺决定开源再写个md

 [TOC]

## 项目技术支持

>开发工具：IDEA2019.3 ，WebStorm2019.3 ，Pycharm2019.3
>
>数据库：mysql5.7
>
>浏览器：chrome
>
>其他技术
>
>>Springboot2.1
>>
>>Vue
>>
>>mybatis
>>
>>Pyspark
>>
>>ALS模型算法
>>
>>BaiduMap地图组件
>>
>>Maven
>>
>>
>
>

## 项目介绍

这就是一个很简单的，前后端分离的推荐系统

运用ALS算法模型计算数据，根据用户选择的推荐值后端从数据库取出传给前端，地图组件渲染呈现给用户

没了QvQ

## 项目架构

B/S架构，前后端分离

前端湿湿一大坨

![img](http://image.radcircle.love/9ea233bb11824c2c866916fd8f679254)




npm run serve启动



![img](http://image.radcircle.love/5e97e4b447ed41a28731cbdf49407902)



后端分三个模块，admin业务处理，common工具类，web保存配置

![img](http://image.radcircle.love/d97932017d8f4ab88e0e48e44fdf980e)

数据处理脚本，分析需要和虚拟机连接，爬虫需要百度地图api的ak值

![img](http://image.radcircle.love/7ef87f5f244f4d62b6cb8da3dc299c38)

## 项目展示

首页

![img](http://image.radcircle.love/826924ceb67444ada16ee3d4b9fdfd55)

在旅馆里搜索上海和浦东新区，返回

![img](http://image.radcircle.love/d6f07ca610bb450caa354c7bdc6ebd89)

广东省深圳市的景点


![img](http://image.radcircle.love/18b62789bffe417eb64d153e04f18ccf)

北京市到上海市的火车路线

![img](http://image.radcircle.love/dc041cd224b94e73a664fcf01ac271b2)

