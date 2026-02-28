# Vue Router 原理剖析

## 为什么需要 Router？

### 1. 传统多页面应用的痛点

在传统的多页面应用中，每次页面跳转都需要：

- **重新加载整个页面**：包括 HTML、CSS、JavaScript
- **重新请求服务器**：增加服务器负担和网络延迟
- **丢失页面状态**：页面刷新导致状态丢失
- **用户体验差**：页面闪烁、加载时间长

```html
<!-- 传统方式：每次跳转都重新加载 -->
<a href="/about.html">关于我们</a>  <!-- 整页刷新 -->
```

### 2. 单页面应用（SPA）的需求

单页面应用（Single Page Application）的核心思想是：

- **只加载一次页面**：首次加载后，后续通过 JavaScript 动态更新内容
- **无刷新跳转**：页面切换不刷新，保持应用状态
- **更好的用户体验**：流畅的页面切换，类似原生应用

但 SPA 也带来了新问题：

- **如何管理不同的页面/视图？**
- **如何实现浏览器的前进/后退？**
- **如何保持 URL 与页面状态同步？**
- **如何实现页面级别的权限控制？**

### 3. Router 的核心价值

Router（路由）就是为了解决这些问题而生的：

1. **URL 与视图的映射**：将不同的 URL 映射到不同的组件/视图
2. **浏览器历史管理**：利用浏览器 History API 实现前进/后退
3. **状态同步**：保持 URL 与页面状态的一致性
4. **导航守卫**：在路由切换时进行权限控制、数据预加载等

## Vue Router 解决了什么问题？

### 1. URL 与组件的映射

**问题**：如何根据 URL 显示对应的组件？

**解决方案**：路由配置表

```javascript
const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/user/:id', component: User }
]
```

### 2. 浏览器历史管理

**问题**：如何实现浏览器的前进/后退功能？

**解决方案**：利用 History API

```javascript
// 方式1：History API（推荐）
history.pushState({}, '', '/about')  // 添加历史记录
history.replaceState({}, '', '/about') // 替换当前记录
window.addEventListener('popstate', handler) // 监听前进/后退

// 方式2：Hash 模式（兼容性好）
location.hash = '#/about'  // URL: http://example.com/#/about
window.addEventListener('hashchange', handler)
```

### 3. 动态路由匹配

**问题**：如何匹配动态路径参数？

**解决方案**：路径参数解析

```javascript
// 路由配置
{ path: '/user/:id', component: User }

// URL: /user/123
// 解析后: { id: '123' }
```

### 4. 嵌套路由

**问题**：如何实现多层级的路由结构？

**解决方案**：嵌套路由配置

```javascript
{
  path: '/user',
  component: UserLayout,
  children: [
    { path: 'profile', component: Profile },
    { path: 'settings', component: Settings }
  ]
}
```

### 5. 导航守卫

**问题**：如何在路由切换时进行权限控制、数据加载等？

**解决方案**：导航守卫钩子

```javascript
router.beforeEach((to, from, next) => {
  // 权限检查
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})
```

## Vue Router 实现原理

### 1. 核心架构

Vue Router 的核心由以下几个部分组成：

```
┌─────────────────────────────────────────┐
│         Vue Router 核心架构              │
├─────────────────────────────────────────┤
│  1. Router 实例（管理路由状态）          │
│  2. Matcher（路由匹配器）                │
│  3. History（历史管理）                  │
│  4. RouterView（视图渲染）                │
│  5. RouterLink（导航组件）               │
└─────────────────────────────────────────┘
```

### 2. Router 实例初始化

```javascript
class VueRouter {
  constructor(options) {
    this.options = options
    this.mode = options.mode || 'hash'
    
    // 创建路由匹配器
    this.matcher = createMatcher(options.routes)
    
    // 创建历史管理器
    this.history = createHistory(this.mode, this)
    
    // 当前路由
    this.current = createRoute(null, {
      path: '/'
    })
  }
}
```

### 3. 路由匹配器（Matcher）

路由匹配器负责将 URL 路径匹配到对应的路由配置。

#### 3.1 路由表构建

```javascript
function createMatcher(routes) {
  // 将路由配置扁平化，构建路由映射表
  const pathMap = {}
  const nameMap = {}
  
  function addRoute(route, parent) {
    const normalizedRoute = normalizeRoute(route, parent)
    
    // 添加到路径映射表
    pathMap[normalizedRoute.path] = normalizedRoute
    
    // 如果有名称，添加到名称映射表
    if (normalizedRoute.name) {
      nameMap[normalizedRoute.name] = normalizedRoute
    }
    
    // 处理嵌套路由
    if (normalizedRoute.children) {
      normalizedRoute.children.forEach(child => {
        addRoute(child, normalizedRoute)
      })
    }
  }
  
  routes.forEach(route => addRoute(route))
  
  return {
    match,
    addRoute
  }
}
```

#### 3.2 路径匹配算法

```javascript
function match(path, route) {
  // 1. 精确匹配
  if (route.path === path) {
    return route
  }
  
  // 2. 动态参数匹配
  // /user/:id -> /user/123
  const paramNames = []
  const regexp = pathToRegexp(route.path, paramNames)
  const match = path.match(regexp)
  
  if (match) {
    const params = {}
    paramNames.forEach((name, index) => {
      params[name] = match[index + 1]
    })
    return { ...route, params }
  }
  
  return null
}
```

**路径转正则表达式**：

```javascript
function pathToRegexp(path, paramNames) {
  // /user/:id -> /^\/user\/([^\/]+)$/
  const segments = path.split('/')
  const regexpSegments = []
  
  segments.forEach(segment => {
    if (segment.startsWith(':')) {
      // 动态参数
      const paramName = segment.slice(1)
      paramNames.push(paramName)
      regexpSegments.push('([^/]+)')
    } else {
      // 静态路径
      regexpSegments.push(segment)
    }
  })
  
  return new RegExp('^' + regexpSegments.join('/') + '$')
}
```

### 4. 历史管理（History）

#### 4.1 Hash 模式实现

```javascript
class HashHistory {
  constructor(router) {
    this.router = router
    this.current = createRoute(null, { path: '/' })
    
    // 监听 hashchange 事件
    window.addEventListener('hashchange', () => {
      this.onHashChange()
    })
    
    // 初始化
    this.onHashChange()
  }
  
  onHashChange() {
    const path = this.getHash()
    const route = this.router.matcher.match(path)
    
    // 更新当前路由
    this.updateRoute(route)
  }
  
  getHash() {
    // 获取 # 后面的路径
    return window.location.hash.slice(1) || '/'
  }
  
  push(path) {
    window.location.hash = path
  }
  
  replace(path) {
    const i = window.location.href.indexOf('#')
    window.location.replace(
      window.location.href.slice(0, i >= 0 ? i : 0) + '#' + path
    )
  }
  
  updateRoute(route) {
    const prev = this.current
    this.current = route
    
    // 触发路由更新
    this.router._route = route
    
    // 调用导航守卫
    this.router.beforeHooks.forEach(hook => {
      hook(route, prev, () => {})
    })
  }
}
```

#### 4.2 History 模式实现

```javascript
class HTML5History {
  constructor(router) {
    this.router = router
    this.current = createRoute(null, { path: '/' })
    
    // 监听 popstate 事件（前进/后退）
    window.addEventListener('popstate', (e) => {
      const path = window.location.pathname
      const route = this.router.matcher.match(path)
      this.updateRoute(route)
    })
    
    // 初始化
    const path = window.location.pathname
    const route = this.router.matcher.match(path)
    this.updateRoute(route)
  }
  
  push(path) {
    // 添加历史记录
    history.pushState({}, '', path)
    const route = this.router.matcher.match(path)
    this.updateRoute(route)
  }
  
  replace(path) {
    // 替换当前历史记录
    history.replaceState({}, '', path)
    const route = this.router.matcher.match(path)
    this.updateRoute(route)
  }
  
  updateRoute(route) {
    const prev = this.current
    this.current = route
    this.router._route = route
    
    // 调用导航守卫
    this.router.beforeHooks.forEach(hook => {
      hook(route, prev, () => {})
    })
  }
}
```

### 5. RouterView 组件实现

`RouterView` 负责根据当前路由渲染对应的组件。

```javascript
const RouterView = {
  name: 'RouterView',
  functional: true,
  render(h, { parent, data }) {
    // 获取当前路由
    const route = parent.$route
    
    // 获取匹配的组件
    const component = route.matched[route.matched.length - 1]?.components?.default
    
    // 渲染组件
    return h(component, data)
  }
}
```

**完整实现**（支持嵌套路由）：

```javascript
const RouterView = {
  name: 'RouterView',
  functional: true,
  render(h, { parent, data }) {
    data.routerView = true
    
    let depth = 0
    let route = parent.$route
    
    // 计算嵌套深度
    while (parent && parent._routerRoot !== parent) {
      const vnodeData = parent.$vnode && parent.$vnode.data
      if (vnodeData && vnodeData.routerView) {
        depth++
      }
      parent = parent.$parent
    }
    
    // 获取对应深度的匹配记录
    const matched = route.matched[depth]
    const component = matched ? matched.components.default : null
    
    return h(component, data)
  }
}
```

### 6. RouterLink 组件实现

`RouterLink` 提供声明式的导航。

```javascript
const RouterLink = {
  name: 'RouterLink',
  props: {
    to: {
      type: [String, Object],
      required: true
    },
    replace: Boolean,
    tag: {
      type: String,
      default: 'a'
    }
  },
  render(h) {
    const router = this.$router
    const current = this.$route
    
    // 解析目标路由
    const to = router.resolve(this.to)
    const resolved = to.resolved
    
    // 判断是否激活
    const active = current.path === resolved.path
    
    const data = {
      class: {
        'router-link-active': active,
        'router-link-exact-active': active
      },
      on: {
        click: (e) => {
          e.preventDefault()
          if (this.replace) {
            router.replace(resolved.path)
          } else {
            router.push(resolved.path)
          }
        }
      }
    }
    
    return h(this.tag, data, this.$slots.default)
  }
}
```

### 7. 响应式路由更新

Vue Router 通过 Vue 的响应式系统实现路由变化时自动更新视图。

```javascript
// 在 Vue 实例上定义 $route
Object.defineProperty(Vue.prototype, '$route', {
  get() {
    return this._routerRoot._route
  }
})

Object.defineProperty(Vue.prototype, '$router', {
  get() {
    return this._routerRoot._router
  }
})

// 在根实例中定义响应式 _route
Vue.mixin({
  beforeCreate() {
    if (this.$options.router) {
      this._routerRoot = this
      this._router = this.$options.router
      
      // 将 _route 设置为响应式
      Vue.util.defineReactive(this, '_route', this._router.history.current)
      
      // 监听路由变化
      this._router.history.listen((route) => {
        this._route = route
      })
    } else {
      this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
    }
  }
})
```

### 8. 导航守卫实现

```javascript
class VueRouter {
  constructor(options) {
    // ... 其他初始化代码
    
    // 导航守卫数组
    this.beforeHooks = []
    this.resolveHooks = []
    this.afterHooks = []
  }
  
  beforeEach(fn) {
    this.beforeHooks.push(fn)
  }
  
  beforeResolve(fn) {
    this.resolveHooks.push(fn)
  }
  
  afterEach(fn) {
    this.afterHooks.push(fn)
  }
  
  async transitionTo(target, onComplete) {
    const route = this.matcher.match(target)
    
    // 执行导航守卫
    const queue = [
      ...this.beforeHooks,
      ...this.resolveHooks
    ]
    
    let index = 0
    const next = async () => {
      if (index >= queue.length) {
        // 所有守卫执行完毕
        this.updateRoute(route)
        this.afterHooks.forEach(hook => hook(route))
        onComplete && onComplete()
        return
      }
      
      const hook = queue[index++]
      await hook(route, this.current, next)
    }
    
    next()
  }
}
```

## 完整实现示例

### 简化版 Vue Router

```javascript
// 1. 路由匹配器
function createMatcher(routes) {
  const pathMap = {}
  
  function addRoute(route) {
    pathMap[route.path] = route
  }
  
  routes.forEach(addRoute)
  
  function match(path) {
    return pathMap[path] || null
  }
  
  return { match, addRoute }
}

// 2. Hash 历史管理器
class HashHistory {
  constructor(router) {
    this.router = router
    this.current = { path: '/' }
    
    window.addEventListener('hashchange', () => {
      this.onHashChange()
    })
    this.onHashChange()
  }
  
  onHashChange() {
    const path = window.location.hash.slice(1) || '/'
    const route = this.router.matcher.match(path)
    this.current = route
    this.router._route = route
  }
  
  push(path) {
    window.location.hash = path
  }
}

// 3. Router 类
class VueRouter {
  constructor(options) {
    this.options = options
    this.matcher = createMatcher(options.routes || [])
    this.history = new HashHistory(this)
    this._route = this.history.current
  }
  
  push(location) {
    this.history.push(location)
  }
}

// 4. RouterView 组件
const RouterView = {
  name: 'RouterView',
  render(h) {
    const route = this.$route
    const component = route.component
    return h(component)
  }
}

// 5. 安装插件
VueRouter.install = function(Vue) {
  Vue.mixin({
    beforeCreate() {
      if (this.$options.router) {
        this._routerRoot = this
        this._router = this.$options.router
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {
        this._routerRoot = (this.$parent && this._routerRoot) || this
      }
    }
  })
  
  Object.defineProperty(Vue.prototype, '$router', {
    get() {
      return this._routerRoot._router
    }
  })
  
  Object.defineProperty(Vue.prototype, '$route', {
    get() {
      return this._routerRoot._route
    }
  })
  
  Vue.component('RouterView', RouterView)
}

// 使用
const router = new VueRouter({
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About }
  ]
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
```

## 核心流程总结

```
用户点击链接/调用 router.push()
    ↓
Router 解析目标路径
    ↓
Matcher 匹配路由配置
    ↓
执行导航守卫（beforeEach）
    ↓
History 更新 URL（pushState/hash）
    ↓
更新 _route（响应式）
    ↓
RouterView 重新渲染组件
    ↓
执行 afterEach 钩子
```

## 关键设计模式

1. **观察者模式**：路由变化时通知所有订阅者（组件）
2. **策略模式**：Hash 和 History 两种路由模式
3. **工厂模式**：createMatcher、createHistory 等工厂函数
4. **适配器模式**：统一不同浏览器的 History API

## 总结

Vue Router 通过以下核心机制实现了 SPA 的路由管理：

1. **路由匹配**：将 URL 映射到对应的组件
2. **历史管理**：利用浏览器 API 实现前进/后退
3. **响应式更新**：路由变化时自动更新视图
4. **导航守卫**：提供路由切换的生命周期钩子

这些机制共同实现了流畅的单页面应用导航体验，解决了传统多页面应用的痛点。

