---
date: 2022-02-20
tags:
- linux
---
# Linux服务器部署/测试常用命令（更新ing）

[TOC]

## 0x01 前言 

从搭建博客到现在使用博客，学习到了很多linux命令的使用，实践出真知，与其观看linux的课程和数据，不如自己真正部署一个项目学得快，学的深，在这里更一个博客就linux的常用命令进行总结（本菜鸡只是根据自己的一些实践体会做的总结所以会显得不全，没有用过的命令暂时不写，总不能去网上复制吧( ╯□╰ )，会慢慢更新）

## 0x02 修改查看

### vim

vim是常用的修改配置文件用的命令

`vim xxx` 进入浏览模式

![](https://cdn.jsdelivr.net/gh/iznilul/img/1645446697669.png)

i:来回切换insert/浏览模式，insert模式可以修改内容，

修改完成后进入到浏览模式按**:**

`:q`正常退出，用于光浏览没有修改过内容后的退出

`:q!`强制退出，用于不保存修改内容

`:wq`，保存退出，用户保存修改内容

然后是一些常用的查看文件命令

### cat

`cat xxx` 查看文件下的所有内容，会直接把所有内容打在屏幕上 目前只会这一种用法QvQ参数有空再写

### grep

`grep  s xxx` 查找xxx下面的所有s字符

参数：

-i 忽略大小写

![](https://cdn.jsdelivr.net/gh/iznilul/img/1645446698354.png)

### more

不同于cat，more 会把文件内容用缩略的方式打印出来，enter下一行，空格下一屏，Q退出

`more xxx`

### tail

tail会直接访问文件的尾部，常用来查看更新的日志

`tail xxx`

## 0x03 常用操作

`cd,ls,mkdir,rm`这些暂时就不说啦,注意别用 **rm -rf / **就行

## 0x04 进程

### ps

`ps` 查看系统正在运行的进程

-a 显示所有终端下执行的进程，包含其他用户的进程

-u 显示用户相关的进程或者与用户相关的属性

-x 显示所有进程，无论是否运行在终端上

-e  显示所有进程

-f 全格式显示进程

![](https://cdn.jsdelivr.net/gh/iznilul/img/1645446700328.png)

USER，用户名称；

PID，进程号；

%CPU，该进程所占用CPU百分比；

%MEM，该进程所占用内存百分比；

VSZ，进程所占用的虚拟内存大小；

RSS，进程所占用的实际内存大小；

TTY，该进程运行在哪个终端上面，若与终端无关，则显示 ?；

STAT，进程状态；

START，进程启动时间；

TIME，进程实际占用CPU的时间；

## 0x05 性能

### netstat

netstat显示网络连接，路由表和网络接口信息

-a 显示所有连线中的Socket,包括未监听的

-n 直接使用IP地址，而不通过域名服务器。

-l  显示监控中的服务器的Socket。

-t 显示TCP传输协议的连线状况。

-u  显示UDP传输协议的连线状况。

-p 显示正在使用Socket的程序识别码和程序名称。


### df

df命令查看磁盘使用情况

-h 用MB/GB为单位显示

![](https://cdn.jsdelivr.net/gh/iznilul/img/1645446704931.png)

### free

free 用来查看内存使用情况

-h 用MB/GB为单位显示

![](https://cdn.jsdelivr.net/gh/iznilul/img/1645446706519.png)![img](http://image.radcircle.love/2bc790f9a6294381bbcf7423ac0e239f)

### top

top命令用来综合查看服务器的性能问题

![](https://cdn.jsdelivr.net/gh/iznilul/img/1645446702163.png)

**第一行**，**任务队列信息**

xx:xx:xx — 当前系统时间

up xx days, xx:xx — 系统已经运行了xx天xx小时xx分钟（期间系统没有重启）

x users — 当前有x个用户登录系统

load average: xx, xx, xx — 1分钟、5分钟、15分钟的负载情况。

load average数据是每隔5秒钟检查一次活跃的进程数，然后按特定算法计算出的数值。如果这个数除以逻辑CPU的数量，结果高于5的时候就表明系统在超负荷运转了。

**第二行**，**Tasks — 任务（进程）**

系统现在共有信息26个进程，其中处于运行中的有1个，25个在休眠（sleep），stoped状态的有0个，zombie状态（僵尸）的有0个。

**第三行，** **cpu状态**

us — 用户空间占用CPU的百分比。

 sy — 内核空间占用CPU的百分比。

ni — 改变过优先级的进程占用CPU的百分比

 id — 空闲CPU百分比

wa — IO等待占用CPU的百分比

hi — 硬中断（Hardware IRQ）占用CPU的百分比

si — 软中断（Software Interrupts）占用CPU的百分比

**第四行**,**内存状态**，

total — 物理内存总量

used — 使用中的内存总量

free — 空闲内存总量

buffers — 缓存的内存量

**第五行 ** **swap交换分区**

 total — 交换区总量

used — 使用的交换区总量

 free — 空闲交换区总量

 cached — 缓冲的交换区总量

PID — 进程id

USER — 进程所有者

PR — 进程优先级

NI — nice值。负值表示高优先级，正值表示低优先级

VIRT — 进程使用的虚拟内存总量，单位kb。VIRT=SWAP+RES

RES — 进程使用的、未被换出的物理内存大小，单位kb。RES=CODE+DATA

SHR — 共享内存大小，单位kb

S — 进程状态。D=不可中断的睡眠状态 R=运行 S=睡眠 T=跟踪/停止 Z=僵尸进程

%CPU — 上次更新到现在的CPU时间占用百分比

%MEM — 进程使用的物理内存百分比

TIME+ — 进程使用的CPU时间总计，单位1/100秒

COMMAND — 进程名称（命令名/命令行）

## 0x06 其他

### alias

可以用alias 自定义命令存入环境变量

![](https://cdn.jsdelivr.net/gh/iznilul/img/1645446697669.png)





