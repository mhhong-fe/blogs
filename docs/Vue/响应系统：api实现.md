---
order: 3
---

# 响应系统：API 实现

上一篇[《响应式系统设计与实现》](/Vue/响应系统：设计与实现)已完成响应系统的核心基础设施：`effect`（含 `lazy`、`scheduler`）、`track`、`trigger`、`cleanup`、`effectStack`。本文在此基础上，逐步实现 Vue 3 中的响应式 API：`reactive`、`computed`、`watch`、`ref`，以及配套的 `toRef`、`toRefs`、`proxyRefs`。

## 一、reactive

`reactive` 将上一篇中内联的 Proxy 逻辑封装为可复用函数，并增加**嵌套对象的惰性代理**：读取某个属性时，若其值为对象，则在此时对其进行代理，而非初始化时递归代理整棵树。

完整实现如下：

```js
// 依赖桶：target → key → effectFns 的三层映射
// 使用 WeakMap 使 target 不被引用时可被垃圾回收，避免内存泄漏
const bucket = new WeakMap()
// 当前正在执行的副作用函数
let activeEffect
// 副作用函数调用栈，解决嵌套 effect 时 activeEffect 被覆盖的问题
const effectStack = []

function effect(fn, options = {}) {
  const effectFn = () => {
    // 执行前清除旧依赖，确保本次执行按实际访问重新收集（支持分支切换）
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn)
    // 捕获返回值：computed 需要拿到 getter 的计算结果
    const res = fn()
    effectStack.pop()
    // 恢复为上一层副作用函数（嵌套 effect 场景）
    activeEffect = effectStack[effectStack.length - 1]
    return res
  }
  effectFn.options = options
  // deps 存储所有包含该副作用函数的依赖集合，用于反向删除
  effectFn.deps = []
  // lazy 为 true 时不立即执行，由外部手动调用（computed/watch 使用）
  if (!options.lazy) {
    effectFn()
  }
  return effectFn
}

function cleanup(effectFn) {
  // 将自身从所有依赖集合中删除，下次执行时再按实际访问重新建立依赖
  for (let i = 0; i < effectFn.deps.length; i++) {
    effectFn.deps[i].delete(effectFn)
  }
  effectFn.deps.length = 0
}

function track(target, key) {
  // 没有激活的副作用函数说明不在响应式上下文中，无需收集
  if (!activeEffect) return
  let depsMap = bucket.get(target)
  if (!depsMap) bucket.set(target, (depsMap = new Map()))
  let deps = depsMap.get(key)
  if (!deps) depsMap.set(key, (deps = new Set()))
  deps.add(activeEffect)
  // 建立反向引用：副作用函数持有依赖集合的引用，cleanup 时可精确删除
  activeEffect.deps.push(deps)
}

function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)
  // 复制到新 Set 再遍历：防止 cleanup 删除元素后 track 又重新添加，
  // 导致在同一 Set 上边删边增引发无限循环
  const effectsToRun = new Set()
  effects && effects.forEach(effectFn => {
    // 跳过当前正在执行的副作用函数，避免 effect 内写操作触发自身无限递归
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn)
    }
  })
  effectsToRun.forEach(effectFn => {
    // 有调度器时交由调度器决定执行时机（computed/watch 依赖此机制）
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
}

function reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      track(target, key)
      // 使用 Reflect.get 并传入 receiver，确保 getter 中 this 指向代理对象
      // 若直接 target[key]，getter 内的 this 为原始对象，属性访问将绕过 Proxy
      const res = Reflect.get(target, key, receiver)
      // 惰性代理：属性值为对象时按需代理，而非初始化时递归代理整棵树
      if (typeof res === 'object' && res !== null) {
        return reactive(res)
      }
      return res
    },
    set(target, key, newVal, receiver) {
      const res = Reflect.set(target, key, newVal, receiver)
      trigger(target, key)
      return res
    }
  })
}
```

使用示例：

```js
const state = reactive({ count: 0, info: { name: 'vue' } })

effect(() => {
  console.log(state.count)
})

state.count++  // effect 重新执行，输出 1
```

> **惰性代理 vs 递归代理**：Vue 3 采用惰性代理策略，仅在属性被实际读取时才代理其子对象。这使得深层对象在未被访问时不会产生代理开销，相比 Vue 2 `Object.defineProperty` 的初始化递归遍历，性能更优。



## 二、computed

`computed` 本质是一个**带缓存的懒执行 effect**，其设计要点如下：

- **懒执行**：使用 `lazy: true`，不在注册时立即运行 getter；
- **缓存**：通过 `dirty` 标志控制，只有依赖变化后才重新计算；
- **调度器**：依赖变化时，不直接重算，而是将 `dirty` 置为 `true`，等下次读取 `.value` 时再计算；
- **嵌套响应**：若外层 effect 依赖了 computed 的值，依赖变化时需要通知外层重新执行，通过在 getter 中 `track`、在 scheduler 中 `trigger` 实现。

```js
function computed(getter) {
  let value        // 缓存上一次的计算结果
  let dirty = true // true 表示依赖已变化，下次读取需重新计算

  const effectFn = effect(getter, {
    // 不立即执行，首次读取 .value 时才触发计算
    lazy: true,
    // 依赖变化时不直接重算，而是标记 dirty，实现惰性求值
    scheduler() {
      if (!dirty) {
        dirty = true
        // 主动通知依赖该 computed 的外层副作用函数重新执行
        // 若无此步骤，外层 effect 读取 sum.value 时将得到旧值
        trigger(obj, 'value')
      }
    }
  })

  const obj = {
    get value() {
      // 仅在 dirty 时重新计算，否则直接返回缓存值
      if (dirty) {
        value = effectFn()
        dirty = false
      }
      // 将外层副作用函数收集到 computed 自身的依赖桶中
      // 这样 scheduler 触发 trigger(obj, 'value') 时能找到外层 effect
      track(obj, 'value')
      return value
    }
  }

  return obj
}
```

使用示例：

```js
const state = reactive({ a: 1, b: 2 })
const sum = computed(() => state.a + state.b)

effect(() => {
  console.log('sum:', sum.value)  // 输出 3
})

state.a = 10  // sum.value 重新计算，effect 重新执行，输出 13
state.a = 20  // 输出 22
```

**执行流程**：

```
state.a 变化
  → trigger → scheduler → dirty = true → trigger(obj, 'value')
    → 外层 effect 重新执行
      → 读取 sum.value → dirty 为 true → effectFn() 重算
        → getter 内读取 state.a/state.b → track，dirty = false
      → 返回新值
```



## 三、watch

`watch` 观测一个响应式数据源，在数据变化时执行用户回调，并提供 `oldValue` 和 `newValue`。其实现同样基于 `effect` 的 `lazy` + `scheduler` 机制。

### 3.1 基础实现

`watch` 支持两种数据源形式：

- **响应式对象**：通过 `traverse` 递归读取所有属性，建立深层依赖；
- **getter 函数**：直接使用用户提供的函数，精确控制依赖范围。

```js
function watch(source, cb, options = {}) {
  let getter
  if (typeof source === 'function') {
    // 用户传入 getter，依赖范围由用户决定
    getter = source
  } else {
    // 传入响应式对象时，递归读取所有属性建立深层依赖
    getter = () => traverse(source)
  }

  let oldValue, newValue

  // job：依赖变化时执行，负责计算新值、调用回调、更新 oldValue
  const job = () => {
    newValue = effectFn()
    cb(newValue, oldValue)
    oldValue = newValue
  }

  const effectFn = effect(getter, {
    lazy: true,
    // 依赖变化时不直接执行回调，而是交由 scheduler 统一调度
    scheduler: job
  })

  // 首次手动执行，完成依赖收集并记录初始 oldValue
  oldValue = effectFn()
}

// 递归读取对象的每一个属性，触发 track，建立全量依赖
// seen 防止循环引用导致的无限递归
function traverse(value, seen = new Set()) {
  if (typeof value !== 'object' || value === null || seen.has(value)) return
  seen.add(value)
  for (const key in value) {
    traverse(value[key], seen)
  }
  return value
}
```

### 3.2 immediate 选项

`immediate: true` 时，watch 创建后立即执行一次回调。此时 `oldValue` 为 `undefined`。

```js
if (options.immediate) {
  // 立即执行 job，此时 oldValue 尚未赋值，回调中为 undefined
  job()
} else {
  // 首次执行以收集依赖，并记录 oldValue，不触发回调
  oldValue = effectFn()
}
```

### 3.3 flush 选项

`flush` 控制回调的执行时机：

- `'sync'`（默认）：同步执行，数据变化后立即触发；
- `'post'`：延迟到微任务队列，相当于 DOM 更新后执行（对应 `watchEffect` 的 `flush: 'post'`）。

```js
const effectFn = effect(getter, {
  lazy: true,
  scheduler() {
    if (options.flush === 'post') {
      // 将 job 推入微任务队列，在当前同步任务（含 DOM 更新）完成后执行
      Promise.resolve().then(job)
    } else {
      job()
    }
  }
})
```

### 3.4 onInvalidate：清理过期的副作用

在异步场景（如发起请求）中，若数据在上一次请求完成前再次变化，需要取消或忽略上一次的请求结果，避免竞态问题。`onInvalidate` 提供了注册清理函数的入口：

```js
function watch(source, cb, options = {}) {
  let getter
  if (typeof source === 'function') {
    getter = source
  } else {
    getter = () => traverse(source)
  }

  let oldValue, newValue
  let cleanup // 保存用户通过 onInvalidate 注册的清理函数

  // 用户在回调中调用 onInvalidate(fn)，将 fn 注册为清理函数
  // 当 watch 再次触发时，fn 会在新回调执行前被调用
  const onInvalidate = (fn) => {
    cleanup = fn
  }

  const job = () => {
    newValue = effectFn()
    // 新一轮回调执行前，先执行上一轮注册的清理函数（如取消过期请求）
    if (cleanup) cleanup()
    cb(newValue, oldValue, onInvalidate)
    oldValue = newValue
  }

  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      if (options.flush === 'post') {
        Promise.resolve().then(job)
      } else {
        job()
      }
    }
  })

  if (options.immediate) {
    job()
  } else {
    oldValue = effectFn()
  }
}
```

使用示例：

```js
watch(
  () => state.id,
  async (newId, oldId, onInvalidate) => {
    let cancelled = false
    // 注册清理函数：若本次回调未结束时 id 再次变化，cancelled 被置为 true
    onInvalidate(() => { cancelled = true })

    const res = await fetchData(newId)
    // 过期的请求结果直接丢弃，只使用最新一次的结果
    if (!cancelled) {
      data.value = res
    }
  }
)
```



## 四、ref

`reactive` 基于 Proxy，只能代理对象，无法直接处理原始值（`number`、`string`、`boolean` 等）。`ref` 通过将原始值包裹在一个含 `.value` 属性的对象中，配合 getter/setter 手动调用 `track`/`trigger`，实现原始值的响应式。

```js
function ref(rawValue) {
  const wrapper = {
    // 标识此对象为 ref，供 toRef、proxyRefs 等在运行时判断
    __v_isRef: true,
    get value() {
      track(wrapper, 'value')
      // 原始值是对象时委托给 reactive，使其深层属性同样具备响应性
      return typeof rawValue === 'object' ? reactive(rawValue) : rawValue
    },
    set value(newVal) {
      // 值未变化时跳过，避免触发不必要的副作用
      if (newVal !== rawValue) {
        rawValue = newVal
        trigger(wrapper, 'value')
      }
    }
  }
  return wrapper
}
```

`__v_isRef` 标志用于在运行时区分 ref 对象与普通对象（`toRef`、`proxyRefs` 等依赖此标志）。

使用示例：

```js
const count = ref(0)

effect(() => {
  console.log(count.value)  // 输出 0
})

count.value++  // effect 重新执行，输出 1
```



## 五、toRef 与 toRefs

直接对 `reactive` 对象进行解构会丢失响应性，因为解构取出的是普通值，与原始代理对象的依赖关联断开：

```js
const state = reactive({ foo: 1, bar: 2 })
const { foo } = state  // foo 是普通数字 1，不具备响应性
```

`toRef` 创建一个与原始 reactive 对象属性保持绑定的 ref 包装器：读取 `.value` 时访问代理对象上的属性（触发 `track`），写入 `.value` 时修改代理对象（触发 `trigger`）：

```js
function toRef(obj, key) {
  return {
    __v_isRef: true,
    get value() {
      // 通过 reactive 对象读取，自动触发其 Proxy get 陷阱中的 track
      return obj[key]
    },
    set value(newVal) {
      // 通过 reactive 对象写入，自动触发其 Proxy set 陷阱中的 trigger
      obj[key] = newVal
    }
  }
}
```

`toRefs` 对对象的所有属性批量调用 `toRef`：

```js
function toRefs(obj) {
  const ret = {}
  for (const key in obj) {
    ret[key] = toRef(obj, key)
  }
  return ret
}
```

使用示例：

```js
const state = reactive({ foo: 1, bar: 2 })
const { foo, bar } = toRefs(state)

effect(() => {
  console.log(foo.value)  // 输出 1
})

state.foo = 10   // effect 重新执行，输出 10
foo.value = 20   // 等价于 state.foo = 20，effect 重新执行，输出 20
```



## 六、proxyRefs：模板自动解包

在 Vue 单文件组件中，`setup()` 返回的 ref 无需在模板中手动写 `.value`，这依赖 `proxyRefs` 的自动解包机制。

`proxyRefs` 对一个包含 ref 的对象创建 Proxy，在读取属性时自动取出 `.value`，在写入时自动赋值到 `.value`：

```js
function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver)
      // 若属性是 ref，透明地返回其 .value，模板中无需手动解包
      return value && value.__v_isRef ? value.value : value
    },
    set(target, key, newValue, receiver) {
      const value = target[key]
      // 若目标属性是 ref，将新值赋给 .value 而非替换 ref 对象本身
      if (value && value.__v_isRef) {
        value.value = newValue
        return true
      }
      return Reflect.set(target, key, newValue, receiver)
    }
  })
}
```

Vue 内部对 `setup()` 的返回值会自动调用 `proxyRefs`，这正是模板中无需 `.value` 的原因：

```js
// setup() 返回
const count = ref(0)
const name = ref('vue')
return proxyRefs({ count, name })

// 模板中可以直接使用
// {{ count }} 而非 {{ count.value }}
```



## 七、更多拦截操作

前文的 `reactive` 实现只覆盖了 `get` 和 `set` 两个陷阱，仅能处理对象属性的基本读写。完整的响应式代理还需要应对 `in` 操作符、键枚举、属性删除、数组变更方法，以及 Map/Set 的内部插槽限制。

### 7.1 对象的完整拦截

**`has` 陷阱**：拦截 `in` 操作符

`'foo' in obj` 不触发 `get`，需要通过 `has` 陷阱收集依赖：

```js
has(target, key) {
  track(target, key)
  return Reflect.has(target, key)
}
```

**`ownKeys` 陷阱**：拦截键枚举（`for...in`、`Object.keys()`）

键枚举关注的是「对象有哪些属性」，而非某个具体属性的值。为此引入特殊标识 `ITERATE_KEY`，所有枚举操作都追踪到它：

```js
const ITERATE_KEY = Symbol('iterate')

ownKeys(target) {
  // 枚举操作不与具体 key 绑定，统一追踪到 ITERATE_KEY
  track(target, ITERATE_KEY)
  return Reflect.ownKeys(target)
}
```

对应地，`set` 陷阱需要区分「新增属性」和「修改属性」。新增属性改变了键集合，需要额外触发 `ITERATE_KEY` 的依赖：

```js
set(target, key, newVal, receiver) {
  const hadKey = Object.prototype.hasOwnProperty.call(target, key)
  const res = Reflect.set(target, key, newVal, receiver)
  if (!hadKey) {
    // 新增属性：键集合发生变化，触发 ITERATE_KEY 依赖
    trigger(target, ITERATE_KEY)
  } else {
    // 修改已有属性：只触发该属性的依赖
    trigger(target, key)
  }
  return res
}
```

**`deleteProperty` 陷阱**：拦截 `delete` 操作符

删除属性同样会改变键集合，需要同时触发该属性和 `ITERATE_KEY` 的依赖：

```js
deleteProperty(target, key) {
  const hadKey = Object.prototype.hasOwnProperty.call(target, key)
  const res = Reflect.deleteProperty(target, key)
  if (res && hadKey) {
    trigger(target, key)
    trigger(target, ITERATE_KEY)
  }
  return res
}
```

### 7.2 数组的特殊处理

**索引赋值与 length 的联动**

当设置的索引 >= 数组当前 `length` 时，赋值会隐式修改 `length`。`set` 陷阱只触发了对应索引的依赖，依赖 `length` 的副作用函数不会重新执行：

```js
const arr = reactive([1, 2, 3])
effect(() => console.log(arr.length))  // 收集了对 length 的依赖

arr[5] = 5  // length 3 → 6，但默认 set 只触发 key=5 的依赖，length 依赖未触发
```

修复：在 `set` 陷阱中检测索引是否超出 `length`，若超出则额外触发 `length` 的依赖：

```js
set(target, key, newVal, receiver) {
  const oldLen = Array.isArray(target) ? target.length : undefined
  const res = Reflect.set(target, key, newVal, receiver)
  trigger(target, key)
  if (Array.isArray(target) && Number(key) >= oldLen) {
    trigger(target, 'length')
  }
  return res
}
```

**变更方法的副作用问题**

`push`、`pop`、`splice` 等方法内部会**同时读取和写入** `length`，在响应式上下文中触发无限循环：

```
effect 中执行 arr.push(1)
  → push 内部读取 arr.length（track，将 effectFn 收入 length 的依赖集合）
  → push 内部写入 arr[length] 并更新 arr.length
  → trigger length 的依赖 → effectFn 重新执行 → 再次 push → 无限循环
```

解决方案：在调用这些方法期间暂停依赖收集，执行完毕后恢复：

```js
let shouldTrack = true

// track 中检查 shouldTrack
function track(target, key) {
  if (!activeEffect || !shouldTrack) return
  // ...
}

// 重写会引发问题的数组变更方法
const arrayInstrumentations = {}
;['push', 'pop', 'shift', 'unshift', 'splice'].forEach(method => {
  const originMethod = Array.prototype[method]
  arrayInstrumentations[method] = function(...args) {
    shouldTrack = false                      // 暂停 track，避免读取 length 收集依赖
    const res = originMethod.apply(this, args)
    shouldTrack = true                       // 恢复 track
    return res
  }
})

// get 陷阱中对数组方法进行拦截，返回重写版本
get(target, key, receiver) {
  if (Array.isArray(target) && arrayInstrumentations.hasOwnProperty(key)) {
    return Reflect.get(arrayInstrumentations, key, receiver)
  }
  // ...
}
```

### 7.3 Map 与 Set 的代理限制

Map 和 Set 将数据存储在内部插槽（Internal Slot）中，方法执行时要求 `this` 指向原始集合对象，而非 Proxy。直接代理 Map/Set 会抛出错误：

```js
const m = reactive(new Map([['key', 1]]))
m.size  // TypeError: Method get Map.prototype.size called on incompatible receiver
```

原因是 `size` 的 getter 需要访问 `this` 上的 `[[MapData]]` 插槽，Proxy 对象上不存在该插槽。解决方案是在 `get` 陷阱中将方法绑定到原始对象 `target`：

```js
get(target, key, receiver) {
  if (key === 'size') {
    track(target, ITERATE_KEY)
    return Reflect.get(target, key, target)  // 以 target 为 this，绕过插槽限制
  }
  // 其他方法也需要绑定到 target，同时注入自定义的 track/trigger 逻辑
  return mutableInstrumentations[key]
    ? mutableInstrumentations[key].bind(target)
    : Reflect.get(target, key, target)
}
```

各方法需要手动实现 track/trigger，核心对应关系如下：

| 方法 | track | trigger |
|------|-------|---------|
| `size` | `ITERATE_KEY` | — |
| `has(key)` | `key` | — |
| `get(key)` | `key` | — |
| `forEach` / `keys()` / `values()` | `ITERATE_KEY` | — |
| `add(value)` | — | `ITERATE_KEY`（新增元素） |
| `set(key, value)` | — | `key`（修改）或 `ITERATE_KEY`（新增） |
| `delete(key)` | — | `key` + `ITERATE_KEY` |

## 八、总结

| API | 实现机制 | 核心要点 |
|-----|---------|---------|
| `reactive` | Proxy + track/trigger | 惰性递归代理，Reflect 修正 this |
| `computed` | lazy effect + dirty 缓存 | scheduler 延迟重算，track/trigger 支持嵌套 |
| `watch` | lazy effect + scheduler | traverse 深层依赖，onInvalidate 处理竞态 |
| `ref` | getter/setter + track/trigger | 原始值响应化，`__v_isRef` 标识 |
| `toRef` / `toRefs` | 委托代理对象的 track/trigger | 解构不丢失响应性 |
| `proxyRefs` | Proxy 自动解包 | 模板中无需显式 `.value` |

所有 API 最终都收敛到同一套 `effect`、`track`、`trigger` 基础设施之上，体现了 Vue 3 响应系统设计的高度一致性与可组合性。
