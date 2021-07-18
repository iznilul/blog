# sdut -okr管理系统开发日志（二）前端修改&部署

[TOC]

## 0x01前言

继上次的日志之后，发现ant-design这个框架打包时候问题太多，于是忍痛放弃之前的前端QvQ，重新找了一个更为轻便的开源轮子，这一回的开发日志还是基于vue前端的一些问题和感悟

采用大佬[谭光志](https://github.com/woai3c)的轮子 https://github.com/woai3c/vue-admin-template

ui框架换成了iView

## 0x02 记录

新的轮子里面原有的配置还有组件比较少，可以更方便的进行开发和部署

![http://image.radcircle.love/37e67f913a1247138af3c197d6bfe469](http://image.radcircle.love/37e67f913a1247138af3c197d6bfe469)

### axios设置

axios是一个基于promise的http包装接口

```javascript
"serve": "vue-cli-service serve --mode development",
"build": "vue-cli-service build --mode production",
```

在开发和打包命令中载入环境变量指定模式

```javascript
baseURL: {
    dev: 'http://127.0.0.1:9101',
    prod: 'http://xxx.xxx.xxx.xxx:9101'
}
```

defaultconfig配置中指定本地和远程服务器的后端接口

```javascript

const baseURL = process.env.NODE_ENV === 'development' ? dfaultSettings.baseURL.dev : dfaultSettings.baseURL.prod
//根据运行模式，决定请求的是哪个地址
const service = axios.create({
    baseURL: baseURL,
    timeout: 6000,
})
```

拦截器暂时原封不动OvO，后面权限认证应该会仔细记录

### vuex存储

```javascript
const store = new Vuex.Store({
    state: {

    },
    mutations: {

    },
    modules:{
        user,
        menu,
    },
    getters,
})
```

两个模块+getters，存储必要的公共数据OvO（认真脸

### 权限

permission.js  文件设置全局守卫，再每次路由请求之前拦截处理

```javascript

let hasMenus = false
if (localStorage.getItem('token')) {//检查有没有token
    if (to.path === '/login') {
        next({ path: '/' })//如果有token，则不需要登录，把login请求重定向为根目录
    } else if (hasMenus) {// 是否有菜单数据，有的话进入管理系统主界面
        //但凡涉及到有next参数的钩子，必须调用next() 才能继续往下执行下一个钩子，否则路由跳转等会停止。
        next()
    } else {
        try {
            const routes = createRoutes(store.getters.menuItems)
            // store获取菜单栏数据，动态添加路由
            router.addRoutes(routes)
            hasMenus = true
            next({ path: to.path || '/' })
        } catch (error) {
            resetTokenAndClearUser()
            next(`/login?redirect=${to.path}`)
        }
    }
} else {//没有token，则任何请求都重定向到登陆页面
    hasMenus = false
    if (to.path === '/login') {
        next()
    } else {
        next(`/login?redirect=${to.path}`)
    }
}
```

这样可以有效规范请求顺序，加上权限登录之后应该逻辑会更复杂。

### 路由

**commonroutes**是通用路由，在用户没有登录的情况下也可以访问

**asyncroutes**是异步路由，在用户登录之后再进行懒加载

异步添加路由的方法是createRoutes方法，执行时间在权限里写过

```javascript
export default function createRoutes(data) {
    const result = []
    const children = []
    //将主页组件加到路由表中
    result.push({
        path: '/',
        component: () => import('../components/Index.vue'),//根目录下的路径都包括Index组件
        children,
    })
    data.forEach(item => {
        generateRoutes(children, item)
    })//生成子路径，生成方法源码里有，不想讲了orz
    // 最后添加404页面 否则会在登陆成功后跳到404页面
    result.push(
        { path: '*', redirect: '/404' },
    )
    //路由优先级问题，输入一个url路径时，路由表会优先匹配commonroutes公共路由表，然后是刚刚异步加入的子路由，最后是404页面
    return result
}
```

### 登录

```javascript
this.$store.dispatch('Login',this.form)//通过调用store用axios封装的方法，返回一个promise对象
    .then(res=>{  //resolve回调返回res
        console.log(res)
        if(res===1) {
            localStorage.setItem('userImg', 'https://avatars3.githubusercontent.com/u/22117876?s=460&v=4')
            localStorage.setItem('userName', '小明')
            // 登陆成功 假设这里是后台返回的 token
            localStorage.setItem('token', 'i_am_token')
            this.loginSuccess()
        }
        else{
            this.loginFailed()
        }
    })
    .catch(error=>{ //reject回调返回error
        this.requestFailed()
        console.error(error)
    })
```

因为目前和后端交互比较简单，登录相对逻辑好懂一些

剩下的基本上是原封不动啦，接下来需要更好的了解这个轮子，去和后端完成逻辑更复杂的交互

## 0x03打包部署

### 后端

pom文件

```xml
<build>
    <!-- 目的是让mapper.xml也会打包进来 否则会异常-->
    <resources>
        <resource>
            <directory>src/main/java</directory>
            <includes>
                <include>**/*.xml</include>
            </includes>
        </resource>
        <resource>
            <directory>src/main/resources</directory>
            <includes>
                <include>**/*.*</include>
            </includes>
        </resource>
    </resources>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <configuration>
                <fork>true</fork>
                <mainClass>${start-class}</mainClass>
            </configuration>
            <executions>
                <execution>
                    <goals>
                        <goal>repackage</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

进入到项目目录下运行：**mvn clean package**

会在target下生成jar包

### 前端

package.json文件

```javascript
"build": "vue-cli-service build --mode production",
```

**npm run build**运行，生成dist文件夹

###   服务器部署

在部署的时候发现服务器中了挖矿病毒，具体解决可以看俺前一篇博文( ╯□╰ )

nginx配置

```xml

server {
        listen       xxx;
        listen       [::]:xxx;
        server_name  localhost;
        root         /dist;
		include /etc/nginx/default.d/*.conf;
    	location / {
       index index.html index.htm;
    }
}
```
**nginx -s reload** 重新加载

安装java环境之后运行 

**nohup java -jar -Xmx512M -Xms512M -Dspring.config.location=application.properties  okr-1.3.5-SNAPSHOT.jar &**

后台运行jar包

然后就可以访问端口展示了orz

## 0x04展示

![http://image.radcircle.love/9453f4e772e84de591d714803b975ae1](http://image.radcircle.love/9453f4e772e84de591d714803b975ae1)

目前还是很简陋的版本QvQ

## 0x05参考资料

https://blog.csdn.net/smilecall/article/details/56288972

## 

