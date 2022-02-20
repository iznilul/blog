# sdut-okr管理系统开发日志（三）整合全局异常+日志打印+swagger文档+很low的前端

[TOC]

## 0x01 前言

写一个能落地的系统真是一件让人崩溃又很有意思的事请( ╯□╰ )，说一下这一次的开发，加入了统一全局异常处理类，日志打印，swagger文档和前后端交互的一些基本功能

前端https://github.com/iznilul/okr-app-web-dev

后端https://github.com/iznilul/okr-app-service-dev



## 0x02 整合统一返回类

不同的接口返回的数据数据格式不一样，所以为了代码美观也为了格式，统一封装一个返回类，为了简洁省去一部分

```java
@Data
@ApiModel("Result 统一API响应结果封装")
public class Result {
    @ApiModelProperty(value = "成功失败的标志", required = true, example = "200")
    private Integer code;
    @ApiModelProperty(value = "成功失败的响应信息", required = true)
    private String msg;
    @ApiModelProperty(value = "成功失败的响应数据", required = false)
    private Object data;

    public static Result success(Object data) {
        Result result = new Result();
        result.setResultCode(ResultCode.SUCCESS);
        result.setData(data);
        return result;
    }

    public static Result failure(ResultCode resultCode, Object data) {
        Result result = new Result();
        result.setResultCode(resultCode);
        result.setData(data);
        return result;
    }
}
```

插件使用lombok（yyds！），省去了写getter和setter的重复代码，封装一些方法来根据业务需求进行调用正确或者错误方法

```java
public enum ResultCode {

    /* 成功状态码 */
    SUCCESS(200, "成功"),
    /* 参数错误：1001-1999 */
    PARAM_IS_INVALID(1001, "参数无效"),
    /* 用户错误：2001-2999*/
    USER_NOT_LOGGED_IN(2001, "用户未登录"),
    /* 未知错误：3001-3999 */
    UNKNOWN_ERROR(3001, "服务出错，请联系开发者"),
    /* 系统错误：4001-4999 */
    SYSTEM_INNER_ERROR(4001, "系统繁忙，请稍后重试"),

    /* 权限错误：7001-7999 */
    PERMISSION_NO_ACCESS(7001, "无访问权限");

    private Integer code;

    private String message;
}
```

封装一些常用的返回码供返回类调用

```java
public Result register(@RequestBody RegisterDto registerDto, HttpServletRequest req){
    return Result.success("注册成功");
    }
    }
```

这样就可以在控制层以固定的格式返回给前端了

![http://image.radcircle.love/4e171741f1b14e0fa8239d4a21eb6260](http://image.radcircle.love/4e171741f1b14e0fa8239d4a21eb6260)

前端接收数据格式

## 0x03 日志打印

日志打印采用logback的方式，因为springboot默认就是集成logback，所以不需要额外引入

```yaml
logging.file.path=logs
logging.config=classpath:logback/logback-spring.xml
logging.pattern.console=[%d{yyyy-MM-dd HH:mm:ss}] -- [%-5p]: [%c] -- %m%n
logging.pattern.file=[%d{yyyy-MM-dd HH:mm:ss}] -- [%-5p]: [%c] -- %m%n
```

在配置文件中定义logback的一些配置

```xml
<appender name="errorAppender" class="ch.qos.logback.core.rolling.RollingFileAppender">
   
    <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
        <!-- 文件名称 -->
        <!-- LOG_PATH是默认值，它的配置对应application.properties里的logging.file.path值 -->
        <fileNamePattern>${LOG_PATH}/error/error-%d{yyyy-MM-dd}.log
        </fileNamePattern>
        <!-- 文件最大保存历史数量 -->
        <MaxHistory>30</MaxHistory>
    </rollingPolicy>
    <encoder>
        <pattern>${FILE_LOG_PATTERN}</pattern>
    </encoder>
    <filter class="ch.qos.logback.classic.filter.LevelFilter">
        <level>ERROR</level>
        <onMatch>ACCEPT</onMatch>
        <onMismatch>DENY</onMismatch>
    </filter>
</appender>
```

logback-spring.xml文件，这里比如说我想打印error级别有关的日志，需要按照这样的格式进行配置,其他像是info，fatal也可以按照这种格式进行配置

```xml
<root level="INFO">
    <appender-ref ref="STDOUT"/>
    <appender-ref ref="infoAppender"/>
    <!-- debug因为日志量太大先关闭 -->
    <!-- <appender-ref ref="debugAppender"/> -->
    <appender-ref ref="warnAppender"/>
    <appender-ref ref="errorAppender"/>
    <appender-ref ref="fatalAppender"/>
</root>
```

最后在文件底部，将所有的appender引用加载进去

![http://image.radcircle.love/29878bade3b9433b9caf9165d0f6b8f9](http://image.radcircle.love/29878bade3b9433b9caf9165d0f6b8f9)

就可以在配置文件的路径下看到相关的日志级别打印啦

## 0x04 全局异常处理类

异常处理是一项很重要的功能，**对内可以快速定位bug，对外可以告诉用户出了什么问题**

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class BusinessException extends RuntimeException {
    private ResultCode resultCode;
}
```

先封装一个异常类，代表业务异常，属性只有一个返回码枚举

```java
@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    @ResponseBody
    @ExceptionHandler(value = Exception.class)
    public Result exceptionHandler(HttpServletRequest httpServletRequest,
                                   Exception e) {
        log.error("服务错误: " + e.toString());
        log.error("定位: " + e.getStackTrace()[0].toString());
        return Result.failure(ResultCode.UNKNOWN_ERROR);
    }

    /**
     * 处理 BusinessException 异常
     *
     * @param httpServletRequest httpServletRequest
     * @param e                  异常
     * @return
     */
    @ResponseBody
    @ExceptionHandler(value = BusinessException.class)
    public Result businessExceptionHandler(
            HttpServletRequest httpServletRequest, BusinessException e) {
        log.error("业务异常 code:" + e.getResultCode().toString());
        //定位打印抛出错误的地方
        log.error("定位:" + e.getStackTrace()[0].toString());
        return Result.failure(e.getResultCode());
    }
}
```

定义一个全局异常处理类，用来捕获抛出的异常，并进行日志打印和前端返回

```java
if (registerDto.getAccount().equals("") || registerDto.getRole().equals("")) {
    throw new BusinessException(ResultCode.PARAM_NOT_COMPLETE);
}
```

这样在遇到一些问题的时候可以根据状态设置返回码，直接抛出一个业务异常类

![http://image.radcircle.love/a3381c2f098543b3b05c261574285a2d](http://image.radcircle.love/a3381c2f098543b3b05c261574285a2d)

![http://image.radcircle.love/2bdc04e5e68e4eca888d2b418395a9af](http://image.radcircle.love/2bdc04e5e68e4eca888d2b418395a9af)

异常处理类处理之后，会返回给用户错误信息，并在日志进行记录

## 0x05  swagger文档集成

这个相对而言比较简单啦

```yaml
swagger.basePackage=com.softlab.okr.controller
swagger.title=sdut okr 后台接口文档
swagger.description=基于springboot+vue+mysql开发的管理系统
swagger.version=0.0.1-SNAPSHOT
swagger.enable=true
swagger.contactName=radcircle
swagger.contactEmail=1773950094@qq.com
swagger.contactUrl=radcircle.love
swagger.license=
swagger.licenseUrl=
```

```java
@Configuration
@ConfigurationProperties(prefix = "swagger")
@PropertySource(value = {"classpath:swagger/swagger.properties"}, encoding = "gbk")
@Data
public class SwaggerInfo {
    private String basePackage;
    private String title;
    private String description;
    private String version;
    private Boolean enable;
    private String contactName;
    private String contactEmail;
    private String contactUrl;
    private String license;
    private String licenseUrl;
}
```

首先定义一个配置文件和一个加载配置类

```java
@Configuration
@EnableSwagger2
public class SwaggerConfig {

    @Autowired
    SwaggerInfo swaggerInfo;

    @Bean
    public Docket createRestApi(Environment environment) {
        Profiles profiles = Profiles.of("dev");
        boolean flag = environment.acceptsProfiles(profiles);
        //System.out.println("swagger" + flag);
        return new Docket(DocumentationType.SWAGGER_2)
                .pathMapping("/")
                .select()
                .apis(RequestHandlerSelectors.basePackage("com.softlab.okr.controller"))
                .paths(PathSelectors.any())
                .build().apiInfo(
                        this.apiInfo()
                )
                .enable(flag);
    }

    private ApiInfo apiInfo() {
        return new ApiInfoBuilder()
                .title(swaggerInfo.getTitle())
                .description(swaggerInfo.getDescription())
                .version(swaggerInfo.getVersion())
                .contact(new Contact(swaggerInfo.getContactName(), swaggerInfo.getContactUrl(),
                        swaggerInfo.getContactEmail()))
                .license(swaggerInfo.getLicense())
                .licenseUrl(swaggerInfo.getLicenseUrl())
                .build();
    }
}
```

在写一个全局配置加载文件，进行配置的加载

需要尤其注意的是

1.自动加载类，需要用autowired注解进行容器注入，如果只是new出来的对象是无法加载的

2.最好根据开发情况设置多个配置文件，不用的开发情况使用不同的配置

![http://image.radcircle.love/b9be9593ea3f4d23acdda033e5459395](http://image.radcircle.love/b9be9593ea3f4d23acdda033e5459395)

```yaml
spring.profiles.active=dev
```

application.properties配置文件里默认使用dev配置

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
@ApiModel("LoginDto 登录接口传输类")
public class LoginDto {
    @ApiModelProperty(value = "账号", required = true, example = "123")
    private String account;
    @ApiModelProperty(value = "密码", required = true, example = "202cb962ac59075b964b07152d234b70")
    private String password;
}
```

```java
@ApiOperation("注册")
@PostMapping("register")
@ResponseBody
public Result register(@RequestBody RegisterDto registerDto, HttpServletRequest req)
        throws Exception {
    System.out.println(registerDto);
}
```

然后可以用API的一些注解进行方法和实体类的描述，具体方法就不说了，上网搜吧( ╯□╰ )

![http://image.radcircle.love/d55bc07468dc46418500d91d5fd2f9df](http://image.radcircle.love/d55bc07468dc46418500d91d5fd2f9df)

![http://image.radcircle.love/47917bc688d94bc4ae0161b7bd43ced4](http://image.radcircle.love/47917bc688d94bc4ae0161b7bd43ced4)

打开运行端口下的swagger-ui.html文件，可以看到接口文档，方便前后端对接

## 0x06 dto和bo等传输对象

```java
public Result register(@RequestBody RegisterDto registerDto, HttpServletRequest req)
```

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
@ApiModel("RegisterDto 注册接口传输类")
public class RegisterDto {
    @ApiModelProperty(value = "账号", required = true, example = "123")
    private String account;
    @ApiModelProperty(value = "身份", required = true, example = "老师")
    private String role;
}
```

这个完全是因为接口懒得用param挨个set对象，所以采取的方法，多写几个model，让controller和service层变瘦一些( ╯□╰ )

## 0x07分页

因为管理系统需要用表格之类的组件进行，分页是必不可少的，不然数据那么多不能用一页显示吧OvO？

这里多说一点，**分页的首要目的是为了减少数据库的压力，避免一次性将数据取出，其次才是分页展示**

如果是后台一次性取出到前端用数组保存，然后再切分数组，这是很不合适的

所以用到了mybatis分页插件

```java
@Configuration
public class PageHelperConfig {
    @Bean
    public PageHelper getPageHelper() {
        PageHelper pageHelper = new PageHelper();
        Properties properties = new Properties();
        properties.setProperty("helperDialect", "mysql");
        properties.setProperty("reasonable", "true");
        properties.setProperty("supportMethodsArguments", "true");
        properties.setProperty("params", "count=countSql");
        pageHelper.setProperties(properties);
        return pageHelper;
    }
}
```

配置类

```java
PageInfo<User> userList = userService.selectByCond(selectUserDto, pageSize);
```

在控制层用PageInfo对象请求Service层

```java
public PageInfo<User> selectByCond(SelectUserDto selectUserDto,
                                   int pageSize) {
    PageHelper.startPage(selectUserDto.getIndex(), pageSize);
    List<User> userList = userMapper.selectByCond(selectUserDto);
    return new PageInfo<>(userList);
}
```

Service层根据**当前页**和**每一页的对象数量**用pagehelper的方法进行数据库请求

![http://image.radcircle.love/2a06cc8619d84d57b6b23cf0ee3e6550](http://image.radcircle.love/2a06cc8619d84d57b6b23cf0ee3e6550)pic

可以看到返回对象包含了很多pagehelper封装的信息，方便进行前台分页

## 0x08 前端

前端因为技术水平有限所以写的很丑，还在中间遇到过分页的bug卡了很久

这个bug就是如果我在成员管理的第二页进行精确查询请求，比如说查找某个人，返回的数据应该只有一条，数量不够继续保持在第二页，那么应该跳转到第一页进行展示，可是因为组件当前页数的管理总是搞不定

具体就不讲了，这个bug总之很恶心，我在源代码里有一行注释，解决了这个问题

```java
if (userList.getSize() > 0) {
    return Result.success(userList);
} else {   //必须得这么写，不然分页查询有bug
    selectUserDto.setIndex(1);
    userList = userService.selectByCond(selectUserDto, pageSize);
    if (userList.getSize() > 0) {
        return Result.success(userList);
    } else {
        throw new BusinessException(ResultCode.RESULT_DATA_NONE);
    }
}
```

## 0x09 展示

![http://image.radcircle.love/838423daa4df4c51abaa960820003c8c](http://image.radcircle.love/838423daa4df4c51abaa960820003c8c)

## 0x10 参考资料

https://blog.csdn.net/qq_41646484/article/details/98455549

https://www.jianshu.com/p/64be4fda468e

https://blog.csdn.net/wohaqiyi/article/details/72853962