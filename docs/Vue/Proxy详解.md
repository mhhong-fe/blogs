---
order: 2
---

# Proxy 详解

## 一、什么是 Proxy

Proxy 是 ES6 引入的元编程特性，可以在**对象的基本操作**（读、写、删除等）上设置拦截，自定义行为。

```js
const p = new Proxy(target, handler)
//                  ↑原始对象   ↑拦截配置
```

对 `p` 的操作，都会先经过 `handler` 中对应的**陷阱函数（trap）**。

---

## 二、常用的拦截操作

### 1. `get` — 拦截读取

```js
const obj = { name: 'Vue', version: 3 }

const p = new Proxy(obj, {
  get(target, key, receiver) {
    console.log(`读取了 ${key}`)
    return Reflect.get(target, key, receiver)
  }
})

p.name     // 打印: 读取了 name  → 'Vue'
p.version  // 打印: 读取了 version → 3
p.other    // 打印: 读取了 other → undefined
```

三个参数：
- `target` — 原始对象
- `key` — 被读取的属性名
- `receiver` — 触发 get 的那个对象（通常是 proxy 本身，涉及 this 问题时很重要）

### 2. `set` — 拦截赋值

```js
const p = new Proxy({}, {
  set(target, key, value, receiver) {
    console.log(`设置 ${key} = ${value}`)
    return Reflect.set(target, key, value, receiver)
    // 必须返回 true，否则严格模式下会报错
  }
})

p.age = 18  // 打印: 设置 age = 18
```

### 3. `has` — 拦截 `in` 操作符

```js
const p = new Proxy({ a: 1 }, {
  has(target, key) {
    console.log(`检查 ${key} 是否存在`)
    return key in target
  }
})

'a' in p   // 打印: 检查 a 是否存在 → true
'b' in p   // 打印: 检查 b 是否存在 → false
```

### 4. `deleteProperty` — 拦截 `delete`

```js
const p = new Proxy({ a: 1 }, {
  deleteProperty(target, key) {
    console.log(`删除 ${key}`)
    return delete target[key]
  }
})

delete p.a  // 打印: 删除 a
```

### 5. `ownKeys` — 拦截 `for...in` / `Object.keys`

```js
const p = new Proxy({ a: 1, b: 2 }, {
  ownKeys(target) {
    console.log('遍历了对象')
    return Reflect.ownKeys(target)
  }
})

for (let key in p) {}   // 打印: 遍历了对象
Object.keys(p)          // 打印: 遍历了对象
```

---

## 三、Reflect — Proxy 的搭档

Proxy 的每个 trap 都有对应的 `Reflect` 方法，语义完全对应：

| Proxy trap | Reflect 方法 |
|---|---|
| `get(target, key, receiver)` | `Reflect.get(target, key, receiver)` |
| `set(target, key, val, receiver)` | `Reflect.set(target, key, val, receiver)` |
| `has(target, key)` | `Reflect.has(target, key)` |
| `deleteProperty(target, key)` | `Reflect.deleteProperty(target, key)` |

**为什么要用 Reflect 而不是直接操作 target？**

核心在于 `receiver` 参数，解决 `this` 指向问题：

```js
const obj = {
  _name: 'Vue',
  get name() {
    return this._name   // this 是谁？
  }
}

const p = new Proxy(obj, {
  get(target, key, receiver) {
    track(target, key)

    // ❌ 直接访问 —— this 指向 target (原始对象)
    // 访问 name 里的 this._name 走的是 target._name
    // 不经过 proxy，不触发 track，_name 的依赖丢失
    return target[key]

    // ✅ 用 Reflect —— receiver 传入，this 指向 proxy
    // 访问 name 里的 this._name 经过 proxy 的 get
    // 触发 track，_name 的依赖正确建立
    return Reflect.get(target, key, receiver)
  }
})
```

---

## 四、Proxy 只代理一层（浅层）

这是理解 Vue3 响应式最关键的一点：

```js
const obj = {
  info: { age: 18 }
}

const p = new Proxy(obj, {
  get(target, key) {
    console.log('get:', key)
    return target[key]   // 直接返回原始值
  },
  set(target, key, val) {
    console.log('set:', key)
    target[key] = val
    return true
  }
})

p.info           // get: info  ← 触发
p.info.age       // get: info  ← 只触发这一次，.age 读取的是原始对象
p.info.age = 20  // get: info  ← 只触发 get，set 没有触发！
```

`p.info.age = 20` 的执行路径：

```
p.info       → 触发 proxy 的 get，返回原始的 { age: 18 }
      .age = 20  → 直接操作原始对象，proxy 完全不知道
```

**Vue3 的解决方案** —— 在 `get` 里懒递归，访问到嵌套对象时才包一层 proxy：

```js
get(target, key, receiver) {
  track(target, key)
  const res = Reflect.get(target, key, receiver)

  if (typeof res === 'object' && res !== null) {
    return reactive(res)  // 嵌套对象也变成 proxy
  }
  return res
}
```

这样 `p.info` 返回的是 proxy，`p.info.age = 20` 就会触发这个嵌套 proxy 的 `set`。

---

## 五、Proxy vs Object.defineProperty

Vue2 用的是 `Object.defineProperty`，Vue3 换成了 Proxy，区别很明显：

| | `Object.defineProperty` | `Proxy` |
|---|---|---|
| 作用粒度 | 单个属性 | 整个对象 |
| 新增属性 | ❌ 无法检测 | ✅ 能检测 |
| 删除属性 | ❌ 无法检测 | ✅ 能检测 |
| 数组下标赋值 | ❌ 无法检测 | ✅ 能检测 |
| 性能 | 初始化时递归遍历所有属性 | 懒代理，访问时才处理 |

Vue2 需要 `$set` / `$delete` 来解决新增/删除属性的问题，Vue3 的 Proxy 天然支持。

---

## 六、Proxy 对象与原始对象的关系

### 1. 两个独立的对象引用，但共享同一份数据

```js
const origin = { name: 'Vue' }
const p = new Proxy(origin, {})

console.log(p === origin)  // false，是两个不同的对象
```

Proxy 不是对原始对象的拷贝，它只是一个**中间层**，操作最终还是落在原始对象上。

### 2. 写操作会同步到原始对象

```js
const origin = { name: 'Vue' }
const p = new Proxy(origin, {
  set(target, key, val) {
    return Reflect.set(target, key, val)  // target 就是 origin
  }
})

p.name = 'React'

console.log(p.name)       // 'React'
console.log(origin.name)  // 'React' ← 原始对象也变了
```

`target` 就是 `origin`，`Reflect.set(target, ...)` 直接修改的是原始对象。

### 3. 读操作也来自原始对象

```js
const origin = { count: 1 }
const p = new Proxy(origin, {})

origin.count = 99

console.log(p.count)  // 99 ← proxy 读到的是原始对象的最新值
```

proxy 没有自己的数据存储，所有数据都在 `origin` 里。

### 关系示意图

```
外部代码
   ↓ 读/写
[ Proxy 对象 p ]  ← 只是拦截层，没有数据
   ↓ 转发给 target
[ 原始对象 origin ]  ← 真正存数据的地方
```

### 对应到 Vue3

```js
const origin = { count: 0 }
const state = reactive(origin)  // state 是 proxy，origin 是原始对象

state.count++

console.log(state.count)   // 1
console.log(origin.count)  // 1 ← 同步变化
console.log(state === origin)  // false
```

这也是为什么 Vue3 文档建议**只操作 reactive 返回的代理对象**，不要直接操作原始对象——直接操作 `origin` 不会经过 proxy 的 `get/set`，就不会触发依赖收集和更新。

---

## 七、对应到 Vue3 响应式

理解了 Proxy 之后，Vue3 响应式的骨架就很清晰了：

```
读取属性 → get trap → track()   → 收集依赖（副作用函数）
设置属性 → set trap → trigger() → 触发依赖（执行副作用函数）
```

```js
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      track(target, key)          // 收集：谁在用这个属性
      const res = Reflect.get(target, key, receiver)
      if (isObject(res)) return reactive(res)  // 嵌套对象懒递归
      return res
    },
    set(target, key, val, receiver) {
      const res = Reflect.set(target, key, val, receiver)
      trigger(target, key)        // 触发：这个属性变了，通知相关副作用
      return res
    }
  })
}
```

整个响应式系统就建立在 Proxy 这两个 trap 上。
