

# whistle介绍

* 特点：
  * 基于 Node.js 的跨平台 Web 调试代理工具
  * 支持在桌面和移动设备上使用
* 功能
  * 抓包，查看设备上的网络请求
  * 修改请求和响应
  * Mock 数据
* 原理
  * Whistle 作为代理服务器，会拦截所有经过它的网络流量，转发给真正的目标服务器，并提供抓包、修改、Mock 等功能。



# whistle安装与启动

whistle的安装：

```shell
pnpm install whistle -g
```

启动whistle：

```shell
w2 start
```

whistle默认运行在8899端口，通过localhost:8899可以访问，whistle的界面如下：

![image.png](https://s2.loli.net/2025/03/11/gACnrGMaK9mXQw6.png)



# 安装SwitchyOmega

whistle能启动一个代理服务器，但是需要有一个代理工具把流量转发到这个代理服务器上，在浏览器上可以使用SwitchyOmega插件

SwitchyOmega有两种用法：

1. 把所有流量都转发到代理服务器上，

   1. 选择系统代理
   2. 注意设置不代理的地址列表，避免被影响，有时候无法代理本机的localhost，可以尝试把不代理的地址列表加上<-loopback>

   ![image.png](https://s2.loli.net/2025/03/11/9PxhpsvwVUIFguf.png)

2. 使用条件判断，把特定的流量转发到代理服务器

   1. 新建特定的情景模式 auto switch
   2. 增加特定的条件，匹配到特定的域名就转发到proxy上，点击应用选项
   3. 选择auto switch模式

   ![image.png](https://s2.loli.net/2025/03/11/HiReEzMWFg7Z68I.png)

# 代理https

想要代理https的请求，需要安装whistle自制的证书，并且信任证书。点击顶部的HTTPS进行下载。

Q: 为什么要安装证书

A: 因为https会对流量进行加密，无法直接查看和篡改请求，因此whistle需要伪装成一个安全的安全的服务器。手动安装并信任whistle自制的证书，浏览器就会认为whistle的代理服务器是安全可靠的，这样客户端与whistle建立加密连接，whistle与目标服务器建立加密连接，whistle在中间就能解密来往的流量了，也就能实现修改请求、响应的功能

![image.png](https://s2.loli.net/2025/03/11/1PJxscHmkyoeOrw.png)



# 代理手机

有时候进行移动端开发，也会遇到要抓取手机上流量的需求，可以按下面的步骤进行设置：

1. 手机和PC连接同一个无线网

2. 配置手机上连接无线网的代理，这一步的目的是把手机上所有的流量都转发到PC的whistle服务器上

   1. 入口：无线网 - 配置代理 - 选择手动 - 填写PC的ip和whistle的端口(默认8899)

      ![image.png](https://s2.loli.net/2025/03/11/F9KnifJedm7y4qL.png)

3. 手机上安装并信任whistle的证书

   可以用safari扫描PC上https的二维码进行下载

4. **要实现whistle代理，需要把其他代理(vpn等)关掉，否则可能会代理失败**





# whistle的使用

whistle一行表示一个规则，一个规则可以应用多个功能

```shell
# 1. 转发请求，微前端场景常用，把线上环境转发到本地
www.test.com/fe/ 127.0.0.1:4001/

# 2. 支持跨域
www.test.com/fe/ resCors://enable

# 3. mock数据，接口api的返回值就是手动写的search变量
# search变量在whistle的values中添加
www.test.com/fe/api1 file://{search}

# 4. 增加请求头
www.test.com reqHeaders://ingress-rule=test

# 5. 修改response的content-type
www.test.com/fe/api1 file://{search} resType://application/json
```





# 参考

[关于whistle](https://wproxy.org/whistle/)

