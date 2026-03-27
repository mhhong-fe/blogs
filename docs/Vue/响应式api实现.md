## reactive

```js
// 存储副作用函数的桶
const bucket = new WeakMap();

function reactive(obj) {
    return new Proxy(obj, {
        // 拦截读取操作
        get(target, key, receiver) {
            // 将副作用函数 activeEffect 添加到存储副作用函数的桶中
            track(target, key);
            // 返回属性值
            return Reflect.get(target, key, receiver);
        },
        // 拦截设置操作
        set(target, key, newVal, receiver) {
            // 设置属性值
            const res = Reflect.set(target, key, newVal, receiver);
            trigger(target, key, type);
        },
    });
}

function track(target, key) {
    if (!activeEffect) return;
    let depsMap = bucket.get(target);
    if (!depsMap) {
        bucket.set(target, (depsMap = new Map()));
    }
    let deps = depsMap.get(key);
    if (!deps) {
        depsMap.set(key, (deps = new Set()));
    }
    deps.add(activeEffect);
    activeEffect.deps.push(deps);
}

function trigger(target, key) {
    const depsMap = bucket.get(target);
    if (!depsMap) return;
    const effects = depsMap.get(key);

    const effectsToRun = new Set();
    effects &&
        effects.forEach((effectFn) => {
            if (effectFn !== activeEffect) {
                effectsToRun.add(effectFn);
            }
        });

    effectsToRun.forEach((effectFn) => {
        if (effectFn.options.scheduler) {
            effectFn.options.scheduler(effectFn);
        } else {
            effectFn();
        }
    });
}

// 用一个全局变量存储当前激活的 effect 函数
let activeEffect;
// effect 栈
const effectStack = [];

function effect(fn) {
    const effectFn = () => {
        cleanup(effectFn);
        // 当调用 effect 注册副作用函数时，将副作用函数复制给 activeEffect
        activeEffect = effectFn;
        // 在调用副作用函数之前将当前副作用函数压栈
        effectStack.push(effectFn);
        const res = fn();
        // 在当前副作用函数执行完毕后，将当前副作用函数弹出栈，并还原 activeEffect 为之前的值
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1];

        return res;
    };

    // activeEffect.deps 用来存储所有与该副作用函数相关的依赖集合
    effectFn.deps = [];
    effectFn();
}

function cleanup(effectFn) {
    for (let i = 0; i < effectFn.deps.length; i++) {
        const deps = effectFn.deps[i];
        deps.delete(effectFn);
    }
    effectFn.deps.length = 0;
}

```

## ref

proxy只能代理对象，对于原始值，只能包裹一层，实现响应式。

```js
function ref(val) {
  const wrapper = {
    value: val
  }

  // 通过这个属性实现模版中自动脱ref
  Object.defineProperty(wrapper, '__v_isRef', {
    value: true
  })

  return reactive(wrapper)
}
```