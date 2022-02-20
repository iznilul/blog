# sdut-okr开发日志（四）springsecurity+jwt集成用户鉴权

[TOC]

## 0x01关于鉴权的前言

先上github :https://github.com/iznilul/okr-app-service-dev

管理系统中比较重要的一个功能就是根据登录用户的身份确定用户可以访问的资源和接口，管理员开放所有的接口和菜单权限，一般用户开放部分接口，没有权限的情况下进行访问会被拦截。

**不过基础http协议是无状态的，就算一开始客户端登录进行了权限的认证，用户之后每一次的http请求之间互相不认识，服务器自然也无法识别哪些是认证过权限的请求**

为了解决这个客户端和服务器互相不认识的问题，现代web技术采取了很多**会话追踪**方法，其中最为常见的就是cookie+session和token，这两种方式也有所不同

### cookie和session

- 首先，客户端会发送一个http请求到服务器端。
- 服务器端接受客户端请求后，建立一个session，并发送一个http响应到客户端，这个响应头，其中就包含Set-Cookie头部。该头部包含了sessionId。Set-Cookie格式如下，具体请看[Cookie详解](https://link.segmentfault.com/?url=http%3A%2F%2Fbubkoo.com%2F2014%2F04%2F21%2Fhttp-cookies-explained%2F)
  `Set-Cookie: value[; expires=date][; domain=domain][; path=path][; secure]`
- 在客户端发起的第二次请求，假如服务器给了set-Cookie，浏览器会自动在请求头中添加cookie
- 服务器接收请求，分解cookie，验证信息，核对成功后返回response给客户端

![请求流程](https://segmentfault.com/img/bVbmYbQ?w=400&h=200)

这里拿leetcode当例子，为什么拿leetcode？因为leetcode不知道为啥总是需要重新登录，我怀疑他家的的cookie有效期很短( ╯□╰ )

![http://image.radcircle.love/d253c5310bc84020a553b006af8ed27c](http://image.radcircle.love/d253c5310bc84020a553b006af8ed27c)

登录时返回头有个set-cookies

![http://image.radcircle.love/6b0daa9565a049e99da57618a744c4e3](http://image.radcircle.love/6b0daa9565a049e99da57618a744c4e3)

![http://image.radcircle.love/1076af684d3842068783d6891befa36d](http://image.radcircle.love/1076af684d3842068783d6891befa36d)

后来的请求都会带cookie这个请求头

- cookie只是实现session的其中一种方案。虽然是最常用的，但并不是唯一的方法。禁用cookie后还有其他方法存储，比如放在url中
- 现在大多都是Session + Cookie，但是只用session不用cookie，或是只用cookie，不用session在理论上都可以保持会话状态。可是实际中因为多种原因，一般不会单独使用
- 用session只需要在客户端保存一个id，实际上大量数据都是保存在服务端。如果全部用cookie，数据量大的时候客户端是没有那么多空间的。
- 如果只用cookie不用session，那么账户信息全部保存在客户端，一旦被劫持，全部信息都会泄露。并且客户端数据量变大，网络传输的数据量也会变大



**简而言之, session 有如用户信息档案表, 里面包含了用户的认证信息和登录状态等信息. 而 cookie 就是用户通行证**，这种方式好比让百姓（客户端）携带自己身份证(cookie,用户标识）去派出所（服务器）查档案(session,里面保存了用户信息)，当然这个身份证也是有有效期的

### token

token 也称作令牌，由uid+time+sign[+固定参数]
token 的认证方式类似于**临时的证书签名**, 并且是一种服务端无状态的认证方式, 非常适合于 REST API 的场景. 所谓无状态就是服务端并不会保存身份认证相关的数据，这样只需要在每次访问服务器的时候进行令牌的认证。



- uid: 用户唯一身份标识
- time: 当前时间的时间戳
- sign: 签名, 使用 hash/encrypt 压缩成定长的十六进制字符串，以防止第三方恶意拼接
- 固定参数(可选): 将一些常用的固定参数加入到 token 中是为了避免重复查库



token在客户端一般存放于localStorage，cookie，或sessionStorage中。在服务器一般存于数据库中



token 的认证流程与cookie很相似

- 用户登录，成功后服务器返回Token给客户端。
- 客户端收到数据后保存在客户端
- 客户端再次访问服务器，将token放入headers中
- 服务器端采用filter过滤器校验。校验成功则返回请求数据，校验失败则返回错误码

因为本次就是用的token进行身份认证，会在下面详细介绍配置和例子

### cookie+session和token的区别

- session存储于服务器，可以理解为一个状态列表，拥有一个唯一识别符号sessionId，通常存放于cookie中。服务器收到cookie后解析出sessionId，再去session列表中查找，才能找到相应session。依赖cookie
- cookie类似一个令牌，装有sessionId，存储在客户端，浏览器通常会自动添加。
- token也类似一个令牌，无状态，用户信息都被加密到token中，服务器收到token后解密就可知道是哪个用户。需要开发者手动添加。
- jwt是一个跨域认证的方案，一种token的实现方案

## 0x02 springSecurity+jwt实现鉴权功能

### 准备工具和代码

```xml
<!--spring-security-->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
    <optional>true</optional>
</dependency>
<!-- jjwt -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt</artifactId>
            <version>0.9.0</version>
        </dependency>
```

maven

![http://image.radcircle.love/744959c406ef4063ad4cf45ce2b0b2a1](http://image.radcircle.love/744959c406ef4063ad4cf45ce2b0b2a1)

![http://image.radcircle.love/e635f654aa3b41639a5a1b7cc36ed71c](http://image.radcircle.love/e635f654aa3b41639a5a1b7cc36ed71c)

![http://image.radcircle.love/d6d3c68567024efdbd5113997199a4fe](http://image.radcircle.love/d6d3c68567024efdbd5113997199a4fe)

![http://image.radcircle.love/4e8b84c7ff02405a95a3632a943a6582](http://image.radcircle.love/4e8b84c7ff02405a95a3632a943a6582)

![http://image.radcircle.love/b550f2e2458c4969853d4e986b611570](http://image.radcircle.love/b550f2e2458c4969853d4e986b611570)

数据表，resource表再后面认证时会讲

```java
@ApiModel("LoginDto 登录接口传输类")
public class LoginDTO {
    @ApiModelProperty(value = "账号/用户名", required = true, example = "123")
    private String username;
    @ApiModelProperty(value = "密码", required = true, example = "202cb962ac59075b964b07152d234b70")
    private String password;
}
```

```java
public class UserEntity {
    private Integer userId;
    private String username;
    private String password;
}
```

```java
public class Role {
    private Integer roleId;
    private String code;
    private String name;
}
```

```java
public class Resource {
    private Integer resourceId;
    /**
     * 路径
     */
    private String path;
    /**
     * 名称
     */
    private String name;
    /**
     * 类型。0为菜单，1为接口
     */
    private Integer type;
}
```

```java
public class UserVO {
    /**
     * 主键
     */
    private Integer userId;
    /**
     * 用户名
     */
    private String username;
    /**
     * 登录认证token
     */
    private String token;
    /**
     * 当前用户的权限资源id集合
     */
    private Set<Integer> resourceIds;
}
```

实体类，也有封装的dto和vo

```java
public class MyPasswordEncoder implements PasswordEncoder {

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        String password = MD5Util.string2MD5((String) rawPassword);
        boolean flag = encodedPassword.equals(password);
        return flag;
    }

    @Override
    public String encode(CharSequence rawPassword) {
        return MD5Util.string2MD5((String) rawPassword);
    }
}
```

自定义密码类

### 鉴权流程

这里套用一下参考资料里的图，如图所示

![img](https://pic1.zhimg.com/80/v2-2efe140f0ff0425acca8819122fa9418_720w.jpg)

当客户端发起一次请求之后，会按照如图的顺序进行服务器的接口调用

登录认证过滤器是对**用户的身份**进行确认，授权过滤器（Authorization）是对**用户能否访问某个资源**进行确认，授权发生都认证之后。 认证一样，这种通用逻辑都是放在过滤器里进行的统一操作：

`LoginFilter`先进行登录认证判断，判断这次请求有没有携带令牌，认证通过后再由`AuthFilter`进行权限授权判断，判断用户有没有对这个资源的访问权限，一层一层没问题后才会执行我们真正的业务逻辑。

也就是说接下来我们需要实现这两个过滤器，才能实现鉴权的功能

### 用户首次登录得到令牌

```java
@Slf4j
@RestController
@RequestMapping("/api")
public class LoginController {
    @Autowired
    private UserEntityService userEntityService;

    @Autowired
    private AuthenticationManager authenticationManager;

    //将登录后的用户信息包括token返回给前端页面
    @PostMapping("/login")
    public Result login(@RequestBody LoginDTO loginDTO) {
        return Result.success(userEntityService.login(loginDTO));
    }
}
```

先从controller层开始讲解，用户登录操作，访问接口 /api/login 调用了userEntityService的login方法，返回一个UserVO给用户，里面包括了token和权限等信息，token和权限是如何产生的呢，往下看

```java
public UserVO login(LoginDTO loginDTO) {
    // 根据用户名查询出用户实体对象
    UserEntity user = userEntityMapper.selectByUsername(loginDTO.getUsername());
    // 若没有查到用户或者密码校验失败则抛出异常，将未加密的密码和已加密的密码进行比对
    if (user == null || !passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
        throw new ControllerException(ResultCode.USER_LOGIN_ERROR);
    }
    //VO是返回给前端用户展示的实体类，不过可以统一包装返回类
    UserVO userVO = new UserVO();
    userVO.setUserId(user.getUserId())
            .setUsername(user.getUsername())
            // 生成token
            .setToken(jwtManager.generate(user.getUsername()))//用jwt生成token
            .setResourceIds(resourceMapper.selectByUserId(user.getUserId()));
    return userVO;
}
```

userEntityService的login方法,从后台选择出UserEntity实体类，并封装好jwt令牌和可访问的权限Id

![http://image.radcircle.love/15eae0cdd06b42c996a3cd81ab237378](http://image.radcircle.love/15eae0cdd06b42c996a3cd81ab237378)

```java
@Slf4j
@Component
public class JwtManager {
    @Value("${security.jwt.secretKey}")
    private String secretKey;
    /**
     * 过期时间目前设置成2天，这个配置随业务需求而定
     */
    private Duration expiration = Duration.ofDays(1);

    /**
     * 生成JWT
     *
     * @param username 用户名
     * @return JWT
     */
    public String generate(String username) {
        // 过期时间
        Date expiryDate = new Date(System.currentTimeMillis() + expiration.toMillis());

        return Jwts.builder()//Jwt三部分
                .setSubject(username) // 将用户名放进JWT
                .setIssuedAt(new Date()) // 设置JWT签发时间
                .setExpiration(expiryDate)  // 设置过期时间
                .signWith(SignatureAlgorithm.HS512, secretKey) // 设置加密算法和秘钥
                .compact();
    }

    /**
     * 解析JWT
     *
     * @param token JWT字符串
     * @return 解析成功返回Claims对象，解析失败返回null
     */
    public Claims parse(String token) {
        // 如果是空字符串直接返回null
        if (!StringUtils.hasLength(token)) {
            return null;
        }

        Claims claims = null;
        // 解析失败了会抛出异常，所以我们要捕捉一下。token过期、token非法都会导致解析失败
        try {
            claims = Jwts.parser()
                    .setSigningKey(secretKey)
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException e) {
            log.error("token解析失败:{}", e.toString());
        }
        return claims;
    }
}
```

JwtManager会用特定加密算法生成token并返回

```javascript
submit() {
  this.$store
    .dispatch('Login', this.form) // 表单会在序列化时转换成json格式
    .then((res) => {
      // console.log(res.data)
      const data = res.data
      localStorage.setItem('token', data.token)
      localStorage.setItem('username', data.username)
      this.loginSuccess()
    })
    .catch((error) => {
      this.requestFailed()
      console.error(error)
    })
  this.handlemodifyReset('form')
},
```

```javascript
service.interceptors.request.use(
  (config) => {
    showLoading()
    if (localStorage.getItem('token')) {
      config.headers.Authorization = localStorage.getItem('token')
    }
    return config
  },
  (error) => Promise.reject(error)
)
```

![http://image.radcircle.love/ae42c5537ee64f25ad77a4cd5cab5200](http://image.radcircle.love/ae42c5537ee64f25ad77a4cd5cab5200)

这样前端在登陆完之后，有效期内每一次请求都会带着令牌了。

### 用户登录过滤器

我们系统中会有许多用户，确认当前是哪个用户正在使用我们系统就是登录认证的最终目的。这里我们就提取出了一个核心概念：**当前登录用户/当前认证用户**。这一概念在Spring Security中的体现就是 **`Authentication`**，它存储了认证信息，代表当前登录用户。我们这次项目的时间就是通过使用jwt进行Authentication的区别

我们在程序中如何获取并使用它呢？我们需要通过 **`SecurityContext`** 来获取`Authentication`

这里安全上下文`SecurityContext`指的是当前执行线程使用的最少量的安全信息(其实就是用于代表访问者账号的有关信息)。

这个上下文对象则是交由 **`SecurityContextHolder`** 进行管理，你可以在程序**任何地方**使用它：

```java
Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
```

可以看到调用链路是这样的：`SecurityContextHolder` `SecurityContext` `Authentication`。

现在我们已经知道了Spring Security中三个核心组件：

`Authentication`：存储了认证信息，代表当前登录用户

SeucirtyContext`：上下文对象，用来获取`Authentication

SecurityContextHolder`：上下文管理对象，用来在程序任何地方获取`SecurityContext

他们关系如下：

![img](https://pic3.zhimg.com/80/v2-94177f88515aee67568de8895ded47fa_720w.jpg)

`Authentication`中那三个玩意就是认证信息：

`Principal`：用户信息，没有认证时一般是用户名，认证后一般是用户对象

`Credentials`：用户凭证，一般是密码

`Authorities`：用户权限

登录认证就是说，我们首先需要根据请求发的令牌判断这个令牌是不是合法的，合法则将认证信息抽取出来保存到上下文对象之中去完成之后的请求



```java
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    private UserEntityServiceImpl userDetailsService;

    @Autowired
    private LoginFilter loginFilter;

    @Autowired
    private AuthFilter authFilter;


    @Override
    protected void configure(HttpSecurity http) throws Exception {
        // 关闭csrf和frameOptions，如果不关闭会影响前端请求接口（这里不展开细讲了，感兴趣的自行搜索，不难）
        http.csrf().disable();
        http.headers().frameOptions().disable();
        // 开启跨域以便前端调用接口
        http.cors();

        // 这是配置的关键，决定哪些接口开启防护，哪些接口绕过防护
        http.authorizeRequests()
                // 注意这里，是允许前端跨域联调的一个必要配置
                .requestMatchers(CorsUtils::isPreFlightRequest).permitAll()
                // 指定某些接口不需要通过验证即可访问。像登陆、测试接口肯定是不需要认证的
                .antMatchers("/api/login", "/api/test", "/api/logout").permitAll()
                // 这里意思是其它所有接口需要认证才能访问
                .antMatchers("/api/**").authenticated()
                //关于登录认证的错误处理器
                .and().exceptionHandling().authenticationEntryPoint(new MyEntryPoint())
                //指定认证错误，权限不足处理器
                .accessDeniedHandler(new MyDeniedHandler());

        // 禁用session，因为要用JWT
        http.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);
        // 将我们自定义的认证过滤器替换掉默认的认证过滤器,两个过滤器分别是登录过滤和权限过滤
        http.addFilterBefore(loginFilter, UsernamePasswordAuthenticationFilter.class);
        http.addFilterBefore(authFilter, FilterSecurityInterceptor.class);
    }

    //登录认证三大组件，业务对象UserDetailsService，用户对象UserDetail，加密工具passwordEncoder需要自定义重写
    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        // 指定UserDetailService和加密器
        auth.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder());
    }

    @Bean
    @Override
    //AuthenticationManager 就是Spring Security用于执行身份验证的组件，只需要调用它的authenticate方法即可完成认证
    protected AuthenticationManager authenticationManager() throws Exception {
        return super.authenticationManager();
    }

    @Bean
    //将密码加密类注入容器内部
    public PasswordEncoder passwordEncoder() {
        return new MyPasswordEncoder();
    }
}
```

先集成一个配置类实现webSecurityConfigurerAdapter接口**，里面配置了自定义的业务对象实现类，密码加密类，哪些接口放行，错误处理器，还有自定义的登录和认证过滤器等等，这个配置类集中了鉴权的核心配置。



```java
public class LoginFilter extends OncePerRequestFilter {
    @Autowired
    private JwtManager jwtManager;
    @Autowired
    private UserEntityServiceImpl userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        log.info("---LoginFilter---");
        // 从请求头中获取token字符串并解析，判断token是不是合法的
        Claims claims = jwtManager.parse(request.getHeader("Authorization"));
        if (claims != null) {
            String username = claims.getSubject();
            UserDetails user = userService.loadUserByUsername(username);
            //生成令牌存到上下文之中
            Authentication authentication = new UsernamePasswordAuthenticationToken(user,
                    user.getPassword(), user.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        chain.doFilter(request, response);
    }
}
```

然后自定义实现的LoginFilter，鉴别请求有没有带着**Authorization:**这个请求头，是不是有效的请求头，有效的话保存上下文，无效的话会交给错误处理器



```java
@Slf4j
public class MyEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException e) throws IOException {
        log.error(e.getMessage());
        response.setContentType("application/json;charset=utf-8");
        PrintWriter out = response.getWriter();
        //封装一个结果返回类
        out.write(JSON.toJSONString(Result.failure(ResultCode.USER_NOT_LOGGED_IN)));
        out.flush();
        out.close();
    }
}
```

错误处理器，进行日志记录和错误信息封装返回

```java
@Getter
@ToString
@EqualsAndHashCode(callSuper = false)
public class UserDetail extends User {
    /**
     * 我们自己的用户实体对象，这里省略掉get/set方法
     */
    private UserEntity userEntity;

    public UserDetail(UserEntity userEntity, Collection<? extends GrantedAuthority> authorities) {
        // 必须调用父类的构造方法，初始化用户名、密码、权限
        super(userEntity.getUsername(), userEntity.getPassword(), authorities);
        this.userEntity = userEntity;
    }

    @Override
    public String getPassword() {
        return this.userEntity.getPassword();
    }

    @Override
    public String getUsername() {
        return this.userEntity.getUsername();
    }
}
```

```java
@Override
public UserDetails loadUserByUsername(String username) {
    // 先调用DAO层查询用户实体对象
    UserEntity user = userEntityMapper.selectByUsername(username);
    // 若没查询到一定要抛出该异常，这样才能被Spring Security的错误处理器处理
    if (user == null) {
        throw new UsernameNotFoundException("没有找到该用户");
    }
    // 查询权限id
    Set<SimpleGrantedAuthority> authorities = resourceMapper.selectByUserId(user.getUserId())
            .stream()
            .map(String::valueOf)
            .map(SimpleGrantedAuthority::new)
            .collect(Collectors.toSet());
    return new UserDetail(user, authorities);
}
```

回到过滤器，业务对象会封装并返回一个UserDetail类，UserDetail是spring security里记录用户认证信息和权限的标准类，自定义的UserDetail需继承org.springframework.security.core.userdetails.User类

然后spring securty上下文保存用户认证信息，权限（一会讲），放行请求，进入Controller的接口

### 权限过滤器

这一部分整体比较难的( ╯□╰ )，尤其是数据表的设计，比较麻烦

我们知道一个系统中根据登陆用户的权限角色不同，比如普通用户和管理员，能够访问的接口也都不一样，为了把这些不同角色的请求区分开来，判断有没有请求的权限，需要再继承一个权限过滤器

首先我们得把接口区分开来，自定义接口注解（ps，其实这一部分我也不懂，感谢大佬RudeCrab）

```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.TYPE})
public @interface Auth {
    /**
     * 权限id，模块id + 方法id需要唯一
     */
    int id();

    /**
     * 权限名称
     */
    String name();
}
```

```java
@RequestMapping("/api/admin")
@Auth(id = 1000, name = "管理员操作")
public class AdminController {

    @PostMapping("register")
    @Auth(id = 1, name = "注册用户")
    public Result register(@RequestBody RegisterDTO registerDTO) {
        return Result.success();
    }

}
```

```java
@RequestMapping("/api/user")
@Api(tags = "用户操作")
@Auth(id = 2000, name = "用户操作")
public class UserInfoController {
    /**
     * @Description: 用户信息更新 @Param: [param, req]
     * @return: com.softlab.okr.utils.Result @Author: radCircle @Date: 2021/7/3
     */
    @ApiOperation("更新用户信息")
    @PostMapping("modifyUserInfo")
    @Auth(id = 1, name = "更新用户信息")
    public Result modifyUserInfo(@RequestBody UpdateUserDTO updateUserDto)
            throws Exception {
        return Result.success("用户信息更新成功");
    }
}
```

自定义Auth注解，然后再不同角色的接口上进行标注

```java
@Component
public class ApplicationStartup implements ApplicationRunner {

    @Autowired
    private RequestMappingInfoHandlerMapping requestMappingInfoHandlerMapping;
    @Autowired
    private ResourceService resourceService;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        // 扫描并获取所有需要权限处理的接口资源(该方法逻辑写在下面)
        List<Resource> list = getAuthResources();
        // 先删除所有操作权限类型的权限资源，待会再新增资源，以实现全量更新（注意哦，数据库中不要设置外键，否则会删除失败）
        resourceService.removeByType(1);
        // 如果权限资源为空，就不用走后续数据插入步骤
        if (Collections.isEmpty(list)) {
            return;
        }
        // 将权限资源给放到权限缓存里
        MySecurityMetadataSource.getRESOURCES().addAll(list);
        // 将资源数据批量添加到数据库
        resourceService.addResources(list);
    }

    /**
     * 扫描并返回所有需要权限处理的接口资源
     */
    private List<Resource> getAuthResources() {
        // 接下来要添加到数据库的资源
        List<Resource> list = new LinkedList<>();
        // 拿到所有接口信息，并开始遍历
        Map<RequestMappingInfo, HandlerMethod> handlerMethods =
                requestMappingInfoHandlerMapping.getHandlerMethods();
        handlerMethods.forEach((info, handlerMethod) -> {
            // 拿到类(模块)上的权限注解
            Auth moduleAuth = handlerMethod.getBeanType().getAnnotation(Auth.class);
            // 拿到接口方法上的权限注解
            Auth methodAuth = handlerMethod.getMethod().getAnnotation(Auth.class);
            // 模块注解和方法注解缺一个都代表不进行权限处理
            if (moduleAuth == null || methodAuth == null) {
                return;
            }

            // 拿到该接口方法的请求方式(GET、POST等)
            Set<RequestMethod> methods = info.getMethodsCondition().getMethods();
            // 如果一个接口方法标记了多个请求方式，权限id是无法识别的，不进行处理
            if (methods.size() != 1) {
                return;
            }
            // 将请求方式和路径用`:`拼接起来，以区分接口。比如：GET:/user/{id}、POST:/user/{id}
            String path =
                    methods.toArray()[0] + ":" + info.getPatternsCondition().getPatterns().toArray()[0];
            // 将权限名、资源路径、资源类型组装成资源对象，并添加集合中
            Resource resource = new Resource();
            resource.setType(1)
                    .setPath(path)
                    .setName(methodAuth.name())
                    .setResourceId(moduleAuth.id() + methodAuth.id());
            list.add(resource);
        });
        return list;
    }
}
```

编写一个启动类实现ApplicationRunner接口，先扫描所有Auth注解的方法，返回这个方法列表

![http://image.radcircle.love/c2dfcad49bb94c8483bf316d18066a93](http://image.radcircle.love/c2dfcad49bb94c8483bf316d18066a93)

![http://image.radcircle.love/319fa0b8c5d340cc90ad094e2c89fbfd](http://image.radcircle.love/319fa0b8c5d340cc90ad094e2c89fbfd)

resource表，里面保存了所有接口

经过重写的run方法更新数据库的资源接口数据表，并把资源列表放到权限缓存里，用于之后的权限校验

```java
@Override
public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
    log.info("---AuthFilter---");

    FilterInvocation fi = new FilterInvocation(request, response, chain);
    // 这里调用了父类的AbstractSecurityInterceptor的方法,也就是调用了accessDecisionManager
    InterceptorStatusToken token = super.beforeInvocation(fi);

    try {
        // 执行下一个拦截器
        fi.getChain().doFilter(fi.getRequest(), fi.getResponse());
    } finally {
        super.afterInvocation(token, null);
    }
}
```

一开始讲过，spring security集成了多个过滤器，当用户通过LoginFilter登录过滤器之后，就会进入这里自定义的AuthFilter过滤器

这个过滤的源码逻辑

```java
public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
    ...省略其它代码

    // 这是Spring Security封装的对象，该对象里包含了request等信息
    FilterInvocation fi = new FilterInvocation(request, response, chain);
    // 这里调用了父类的AbstractSecurityInterceptor的方法,认证核心逻辑基本全在父类里
    InterceptorStatusToken token = super.beforeInvocation(fi);

    ...省略其它代码
}
```

父类的`beforeInvocation`大概源码如下：

```java
protected InterceptorStatusToken beforeInvocation(Object object) {
    ...省略其它代码

    // 调用SecurityMetadataSource来获取当前请求的鉴权规则，这个ConfigAttribue就是规则
    Collection<ConfigAttribute> attributes = this.obtainSecurityMetadataSource().getAttributes(object);
    // 如果当前请求啥规则也没有，就代表该请求无需授权即可访问，直接结束方法
    if (CollectionUtils.isEmpty(attributes)) {
        return null;
    }

    // 获取当前登录用户
    Authentication authenticated = authenticateIfRequired();
    // 调用AccessDecisionManager来校验当前用户是否拥有该权限，没有权限则抛出异常
    this.accessDecisionManager.decide(authenticated, object, attributes);

    ...省略其它代码
}
```

大概就是说，在进行调用之前，会先获取检验规则（这里就是我们上面启动时放到权限缓存的那部分），然后根据规则进行用户已有权限的校验，成功的话放行，不成功调用授权错误处理器



```java
@Slf4j
@Component
public class MySecurityMetadataSource implements SecurityMetadataSource {
    /**
     * 当前系统所有url资源
     * 当前系统所有接口资源对象，放在这里相当于一个缓存的功能。
     */
    @Getter
    private static final Set<Resource> RESOURCES = new HashSet<>();

    //根据请求的路径匹配资源
    @Override
    public Collection<ConfigAttribute> getAttributes(Object object) {
        log.info("---MySecurityMetadataSource---");
        // 该对象是Spring Security帮我们封装好的，可以通过该对象获取request等信息
        FilterInvocation filterInvocation = (FilterInvocation) object;
        HttpServletRequest request = filterInvocation.getRequest();
        // 遍历所有权限资源，以和当前请求所需的权限进行匹配
        for (Resource resource : RESOURCES) {
            String[] split = resource.getPath().split(":");
            // 因为/API/user/test/{id}这种路径参数不能直接equals来判断请求路径是否匹配，所以需要用Ant类
            AntPathRequestMatcher ant = new AntPathRequestMatcher(split[1]);
            // 如果请求方法和请求路径都匹配上了，则代表找到了这个请求所需的权限资源
            if (request.getMethod().equals(split[0]) && ant.matches(request)) {
                // 将我们权限资源id返回
                return Collections.singletonList(new SecurityConfig(resource.getResourceId().toString()));
            }
        }
        // 走到这里就代表该请求无需授权即可访问，返回空
        return null;
    }

    @Override
    public Collection<ConfigAttribute> getAllConfigAttributes() {
        return null;
    }

    @Override
    public boolean supports(Class<?> clazz) {
        return true;
    }
}
```

MySecurityMetadataSource是缓存权限规则和进行资源匹配的类，再springboot启动的时候就在进行了RESOURCES的缓存，在AuthFilter中调用了getAttributes方法，判断当前的请求对应系统哪一个方法，需要什么权限，把这些信息返回给AuthFilter

```java
@Slf4j
@Component
public class MyDecisionManager implements AccessDecisionManager {
    @Override
    public void decide(Authentication authentication, Object object,
                       Collection<ConfigAttribute> configAttributes) {
        // 如果授权规则为空则代表此URL无需授权就能访问
        if (Collections.isEmpty(configAttributes)) {
            return;
        }
        log.info("---DecisionManager---");
        // 判断授权规则和当前用户所属权限是否匹配
        for (ConfigAttribute ca : configAttributes) {
            for (GrantedAuthority authority : authentication.getAuthorities()) {
                // 如果匹配上了，代表当前登录用户是有该权限的，直接结束方法
                if (Objects.equals(authority.getAuthority(), ca.getAttribute())) {
                    return;
                }
            }
        }
        // 走到这里就代表没有权限
        throw new AccessDeniedException("没有相关权限");
    }

    @Override
    public boolean supports(ConfigAttribute attribute) {
        return true;
    }

    @Override
    public boolean supports(Class<?> clazz) {
        return true;
    }
}
```

AuthFilter随后调用MyDecisionManager方法，根据上下文存放的用户认证信息，判断用户有没有访问这个接口的权限，有的话放行，没有的话调用错误处理类

```java
public class MyDeniedHandler implements AccessDeniedHandler {
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException,
            ServletException {
        response.setContentType("application/json;charset=utf-8");
        PrintWriter out = response.getWriter();
        out.write(JSON.toJSONString(Result.failure(ResultCode.PERMISSION_NO_ACCESS)));
        out.flush();
        out.close();
    }
}
```

这个类就不多说了

这样，我们就大概完成了用户的鉴权工作，写文章好累( ╯□╰ )

## 0x03展示

![http://image.radcircle.love/6bbcfe365f3c4de69a4b8fab6069279e](http://image.radcircle.love/6bbcfe365f3c4de69a4b8fab6069279e)

就不详细展示了，就放一张图，这里是我用普通用户调用管理员权限的接口。

## 0x04总结&&参考资料

因为以前对鉴权和会话追踪技术几乎不会，这次还是踩了不少坑的，感谢大佬的开源作品orz帮了俺很多

https://segmentfault.com/a/1190000017831088

https://zhuanlan.zhihu.com/p/342755411