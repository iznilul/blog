## sdut-okr开发日志（六）令牌过期+夜间模式+性能监控

[TOC]

## 0x01前言

github地址:https://github.com/iznilul/okr-app-service-dev

https://github.com/iznilul/okr-app-web-dev

架构进行ing，感觉写前端也挺有意思的OvO，这次增加一些比较有用的功能

 ## 0x02令牌过期

前面集成了springsecurity+jwt进行鉴权处理，登陆后把token存到本地，之后每次发送http请求的时候请求头带着这个token，判断有没有请求权限。

不过问题又来了，这个token是有期限的

```java
/**
 * 过期时间目前设置成2天，这个配置随业务需求而定
 */
private Duration expiration = Duration.ofDays(1);
```

如果token过期了，需要抛出异常，返回给用户过期提示并定向路由回登录页，后端还需要进行日志打印处理。

这里还有一个小问题，**springSecurity的过滤器filter类是在控制层上层，而项目里封装的全局异常处理注解@ControllerAdvice作用于控制层，也就是说请求在经过控制层之前的filter类的时候，所有throw出去的异常都不会被全局处理**

如何处理这样的过期异常呢，可以在filter捕获异常的时候封装一个servlet去请求控制层专门抛出异常的路径

```java
// 从请求头中获取token字符串并解析，判断token是不是合法的，并传入本次request参数
Claims claims = jwtManager.parse(request, response, request.getHeader("Authorization"));
```

调用解析方法时传入request参数

```java

// 解析失败了会抛出异常，捕捉一下。token过期、token非法都会导致解析失败
try {
    claims = Jwts.parser()
            .setSigningKey(secretKey)
            .parseClaimsJws(token)
            .getBody();
} catch (ExpiredJwtException e) {
    log.error("token过期或者不合法:{}", e
            .toString());
    request.setAttribute("filter.error", e);
    request.getRequestDispatcher("/error/throw").forward(request, response);
}
```

捕获异常，日志打印，并封装servlet请求

```java
@ResponseBody
@ExceptionHandler(value = ExpiredJwtException.class)
public Result ExpiredJwtExceptionHandler(
        Exception e) {
    log.error("用户Token已过期:" + e.toString());
    //定位打印抛出错误的地方
    log.error("定位:" + e.getStackTrace()[0].toString());
    return Result.failure(ResultCode.USER_TOKEN_EXPIRE);
}
```

全局异常处理类增加对令牌过期的处理

```java
public class ErrorController {

    @RequestMapping("/error/throw")
    @ApiOperation("抛出异常")
    public void rethrow(HttpServletRequest request) throws Exception {
        throw ((Exception) request.getAttribute("filter.error"));
    }
}
```

控制层增加请求路径，来抛出filter发来的请求参数中的异常类

```javascript
// 如果token已经过期，则进行重定向
if (res.code === 2004) {
  Notice.error({
    title: '登录过期，请重新登录',
  })
  localStorage.clear()
  router.push('/login')
} 
```

前端在全局response过滤里增加这些代码，如果返回码为令牌过期的错误，则通知用户，并清空本地storage，重定向处理

![http://image.radcircle.love/370182f81e8c416eb18cce32d77c4c50](http://image.radcircle.love/370182f81e8c416eb18cce32d77c4c50)

方便展示这里我把jwt设置成了立即过期( ╯□╰ )，可以看到效果，原地返回

##  0x03夜间模式

为了让前端更有交互性设计了夜间模式OvO

![http://image.radcircle.love/b1461eb21d3548ac92575d8dc8cb5404](http://image.radcircle.love/b1461eb21d3548ac92575d8dc8cb5404)

```html
<div id="switch">
  <span>夜间模式</span>
  <i-switch size="large" @on-change="changeTheme">
    <span slot="open">ON</span>
    <span slot="close">OFF</span>
  </i-switch>
</div>
```

```javascript
changeTheme(status) {
  // console.log(status)
  if (status) {
    this.$store.commit('setTheme', 1)
  } else {
    this.$store.commit('setTheme', 0)
  }
  this.$Message.info('模式已切换')
},
```

vuex维护一个theme变量，这里就不写了( ╯□╰ )，用iview的按钮组件设计切换时修改vue的theme的状态

```javascript
theme() {
  return this.$store.getters.theme
},
```

```javascript
<div :class="[theme === 1 ? 'body-theme-dark' : 'body-theme-light']">
```

全局路由，Acontent文件下的容器监听theme的变化，并选择不同的class

```less
.body-theme-light {
  .styleChange(light);
}
.body-theme-dark {
  .styleChange(dark);
}
//白天模式下色值
@color-main-text-light: #000;
@color-main-border-light: #000;
@color-main-background-light: #fff;

//夜间模式下色值
@color-main-text-dark: #fff;
@color-main-border-dark: #fff;
@color-main-background-dark: #000;

.styleChange(@theme) {
  @color-main-background: 'color-main-background-@{theme}';
  @color-main-border: 'color-main-border-@{theme}';
  @color-main-text: 'color-main-text-@{theme}';
  .view-c {
    background: @@color-main-background;
    .ivu-form-item-label {
      color: @@color-main-text;
    }
    .ivu-input {
      background: @@color-main-background;
      color: @@color-main-text;
      border: 2px solid @@color-main-border;
    }
    #upload {
      border: 2px solid @@color-main-border;
      color: @@color-main-text;
      background: @@color-main-background;
    }
 }
}
```

并在文件下方引入如上的样式，会根据div的class选择夜间或白天样式OvO，只是截取了部分，如果要让所有的页面支持夜间模式，要做的还是挺多的

## 0x04性能监控

### 后端封装

springboot结合oshi调取本地硬件信息，在后端封装需要监控的对象，并集成到一个Server类，用于后端请求返回

具体的封装可以看源码（太长了不放了

```xml
<!-- oshi获取系统信息 -->
<dependency>
    <groupId>com.github.oshi</groupId>
    <artifactId>oshi-core</artifactId>
    <version>3.9.1</version>
</dependency>
```

不过oshi可是一定要集成的

![http://image.radcircle.love/f5079ccb4e694dfd8e732761f8a5df25](http://image.radcircle.love/f5079ccb4e694dfd8e732761f8a5df25)

封装的pojo

```java
@GetMapping("/server")
@ApiOperation("服务器监控")
@Auth(id = 1, name = "服务器监控")
public Result server() throws Exception {
    Server server = new Server();
    server.copyTo();
    return Result.success(server);
}    
public class Server{
    /**
     * CPU相关信息
     */
    private Cpu cpu = new Cpu();
    /**
     * 內存相关信息
     */
    private Mem mem = new Mem();
    /**
     * JVM相关信息
     */
    private Jvm jvm = new Jvm();
    /**
     * 服务器相关信息
     */
    private Sys sys = new Sys();
    /**
     * 磁盘相关信息
     */
    private List<SysFile> sysFiles = new LinkedList<SysFile>();
    /**
     * 服务器环境信息
     */
    private ServerInfo serverInfo = new ServerInfo();
}
public void copyTo() throws Exception {
        SystemInfo si = new SystemInfo();
        HardwareAbstractionLayer hal = si.getHardware();
        setCpuInfo(hal.getProcessor());
        setMemInfo(hal.getMemory());
        setSysInfo();
        setJvmInfo();
        setSysFiles(si.getOperatingSystem());
        setServerInfo();
    }
```

以上代码是大概逻辑，请求接口，构造server实例并调用copyTo方法赋值成员变量，最后返回给前端

### 前端父组件

前端调用echart来展示，前端封装echart真的很麻烦( ╯□╰ )

```vue
<div id="home">
  <span id="title">服务器性能监控</span>
  <div id="pie">
    <Cpu :data="form.cpu"></Cpu>
    <Mem :data="form.mem"></Mem>
    <Jvm :data="form.jvm"></Jvm>
    <SysFiles :data="form.sysFiles"></SysFiles>
  </div>
  <div id="serverInfo">
    <server-info :data="form.serverInfo"></server-info>
  </div>
</div>
```

在父组件里预留好位置，每个echart图都是一个组件，每个子组件注册props来获取父组件的数据

```javascript
mounted() {
  this.getMonitorData()
  this.timer = setInterval(() => {
    this.getMonitorData()
  }, 20000)
},
methods: {
  getMonitorData() {
    this.$store
      .dispatch('getMonitorData', {})
      .then((res) => {
        console.log(res)
        this.form.cpu = res.cpu
        this.form.mem = res.mem
        this.form.jvm = res.jvm
        this.form.sysFiles = res.sysFiles[0]
        this.form.serverInfo = res.serverInfo
      })
      .catch((error) => {
        console.error(error)
      })
  },
```

在父组件里定时向后端请求方法，达到监控的效果，并保存数据，向子组件传值

### 子组件设置

接下来随便找个子组件来当例子，就内存组件Mem吧

```javascript
computed: {
    //节点
  memChart() {
    return this.$echarts.init(document.getElementById('mem'))
  },//数据长度，轮播会用到
  memLen() {
    return this.memOption.series[0].data.length
  },
  memOption() {
    return {
	//中间一些title，lengen图就不写了，太占地方，主要展示series，配合数据展示
      series: [
        {
          name: '主内存情况',
          type: 'pie',
          radius: ['60%', '75%'],
          left: '50px',
          avoidLabelOverlap: false,
            //在鼠标悬浮和调用api的情况下展示数据
          emphasis: {
            label: {
              show: true,
            },
          },
            //默认情况下不展示数据
          labelLine: {
            show: false,
          },
            //数据展示位置居中，在圆圈的中间
          label: {
            normal: {
              show: false,
              position: 'center',
                //回调函数入参，返回具体展示内容
              formatter: function (params) {
                return (
                  '{name|' +
                  params.data.name +
                  '}\n{value|' +
                  params.data.value +
                  ' %}\n{value|' +
                  params.data.num +
                  'GB}'
                )
              },
                //字体样式
              rich: {
                value: {
                  fontFamily: 'SFUDINEngschrift',
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#27D9C8',
                },
                name: {
                  fontFamily: 'Microsoft YaHei',
                  fontSize: 20,
                  color: '#808184',
                },
              },
            },
          },
            //数据
          data: [
            {
              value: '',
              name: '空闲',
              num: '',
            },
            {
              value: '',
              name: '使用中',
              num: '',
            },
          ],
        },
      ],
    }
  },
},
```

echart配置

```javascript
watch: {
  data(newVal) {
    // console.log(newVal)
    this.memOption.series[0].data[0].value = 100 - this.data.usage
    this.memOption.series[0].data[0].num = this.data.free
    this.memOption.series[0].data[1].value = this.data.usage
    this.memOption.series[0].data[1].num = this.data.used
    this.memChart.setOption(this.memOption)
    setTimeout(() => {
      this.slideShow()
    }, 1000)
  },
},
```

watch监听注册的props，监听到父组件的数据变化则修改配置并重新渲染echart图，达到定时监控展示的效果

### 轮询交互

```javascript
mounted() {
  this.timer = setInterval(() => {
    this.slideShow()
  }, 3000)
},
```

```javascript
slideShow() {
  this.memChart.dispatchAction({ type: 'downplay', seriesIndex: 0, dataIndex: this.memIndex })
  this.memIndex = (this.memIndex + 1) % this.memLen
  this.memChart.dispatchAction({
    type: 'highlight',
    seriesIndex: 0,
    dataIndex: this.memIndex,
  })
```

定义一个slideShow方法，每隔一段时间调用，这个方法会请求echart内置的api，根据数据长度模拟高亮渲染，到达轮播交互的效果

### 总体效果

![http://image.radcircle.love/e6c9623ce8c24da7ace8b8fee52ede6c](http://image.radcircle.love/e6c9623ce8c24da7ace8b8fee52ede6c)

## 0x05参考资料

https://blog.csdn.net/flyer5/article/details/103836207

https://blog.csdn.net/cnlovedudu/article/details/118673711

https://blog.csdn.net/qq_45155318/article/details/107983013

