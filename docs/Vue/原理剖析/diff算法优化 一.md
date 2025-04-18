# 概述
本文用以介绍vue3 diff算法中编译优化的部分

# 背景知识

简单的二进制操作

```
/** &，与运算，如果两个都是1，则结果为1 */
5 & 3 // (二进制：101 & 011 → 001 → 1)

/** |，或运算，如果至少有一个是1，则结果为1 */
5 | 3 // (二进制：101 | 011 → 111 → 7)

/** <<，左移，将二进制位向左移动指定的位数，右边用0填充 */
5 << 1 // (二进制：101 → 1010 → 10)

/** <<，右移，将二进制位向右移动指定的位数，符号位填充（如果是负数，填充1；如果是正数，填充0）。 */
5 >> 1 // (二进制：101 → 10 → 2)

/** 负数，32位数字第一位是1为负数，第一位0为正数，取反后+1就是它的值 */
1111 1111 1111 1111 1111 1111 1111 1010
// 取反 -> 0000 0000 0000 0000 0000 0000 0000 0101
// + 1 -> 0000 0000 0000 0000 0000 0000 0000 0110
// 所以1111 1111 1111 1111 1111 1111 1111 1010，= 6

/** 取反，反转每一位 */
～5 // 6
// 0000 0000 0000 0000 0000 0000 0000 0101
// 1111 1111 1111 1111 1111 1111 1111 1010
// 6
```

# 编译优化

## 编译优化的目标

```vue
<div id="foo">
    <p class="bar">{{ text }}</p>
</div>
```

传统的diff算法会进行如下比较：

*   比较div的属性与子节点
*   比较p的属性与子节点
*   比较p的文本子节点

但是只有p的文本节点是动态的，如果能够直接比较文本节点，diff性能会大幅提升。编译优化的目标就是要在虚拟DOM上体现出节点的动态性，具体有两点：

*   当前node后代有哪些动态节点；
*   当前node有哪些属性是动态的

传统的虚拟dom：

```js
const vnode = {
    tag: "div",
    children: [
        { tag: "div", children: "foo" },
        { tag: "p", children: ctx.bar },
    ],
};
```

目标的虚拟dom

```js
const vnode = {
    tag: "div",
    children: [
        { tag: "div", children: "foo" },
        { tag: "p", children: ctx.bar, patchFlag: 1 }, // 这是动态节点
    ],
    // 后代元素中的动态节点
    dynamicChildren: [],
};
```

## 怎么标记节点的动态性

patchFlag有以下值：

```ts
export const enum PatchFlags {
    // 动态文字内容
    TEXT = 1, // 0000000001

    // 动态 class
    CLASS = 1 << 1, // 0000000010

    // 动态样式
    STYLE = 1 << 2, // 0000000100

    // 动态 props
    PROPS = 1 << 3,

    // 有动态的key，也就是说props对象的key不是确定的
    FULL_PROPS = 1 << 4,

    // 合并事件
    HYDRATE_EVENTS = 1 << 5,

    // children 顺序确定的 fragment
    STABLE_FRAGMENT = 1 << 6,

    // children中有带有key的节点的fragment
    KEYED_FRAGMENT = 1 << 7,

    // 没有key的children的fragment
    UNKEYED_FRAGMENT = 1 << 8,

    // 只有非props需要patch的，比如`ref`
    NEED_PATCH = 1 << 9,

    // 动态的插槽
    DYNAMIC_SLOTS = 1 << 10,

    // SPECIAL FLAGS -------------------------------------------------------------

    // 以下是特殊的flag，不会在优化中被用到，是内置的特殊flag

    // 表示他是静态节点，他的内容永远不会改变，对于hydrate的过程中，不会需要再对其子节点进行diff
    HOISTED = -1,

    // 用来表示一个节点的diff应该结束
    BAIL = -2,
}
```

一个节点可能会有多个动态属性，例如动态文本和动态class，可以用`PatchFlags.TEXT | PatchFlags.CLASS`来得到0000000011，这个节点patchFlag = 0000000011，表示它同时拥有动态文本和动态class。

要判断这个节点是否拥有动态文本：`patchFlag & PatchFlags.TEXT > 0`即可

## 怎么提取后代元素中的动态节点

约定组件模版的根节点必须作为一个Block，考虑到组件嵌套层级，使用栈结构来存储动态节点，栈顶数组存储当前组件的动态节点

```js
// 动态节点栈
const dynamicChildrenStack = [];
// 当前动态节点集合
let currentDynamicChildren = null;
// openBlock 用来创建一个新的动态节点集合，并将该集合压入栈中
function openBlock() {
    dynamicChildrenStack.push((currentDynamicChildren = []));
}
// closeBlock 用来将通过 openBlock 创建的动态节点集合从栈中弹出
function closeBlock() {
    currentDynamicChildren = dynamicChildrenStack.pop();
}
```

创建当前虚拟节点时，如果当前节点是动态的，就存入

```js
function createVNode(tag, props, children, flags) {
    const key = props && props.key;
    props && delete props.key;

    const vnode = {
        tag,
        props,
        children,
        key,
        patchFlags: flags,
    };

    if (typeof flags !== "undefined" && currentDynamicChildren) {
        // 动态节点，将其添加到当前动态节点集合中
        currentDynamicChildren.push(vnode);
    }

    return vnode;
}
```

一层一层的创建vnode，先得到内层的结果，再得到外层的结果

```js
function render() {
    return createVNode("div", { id: "foo" }, [
        createVNode("p", { class: "bar" }, text, PatchFlags.TEXT), // PatchFlags.TEXT 就是补丁标志
    ]);
}
```

![](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/bc936702b1534b99ab6ba5affd9291c3~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgaG1oMTIzNDU=:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMzA0MzA2MDQwNzYwNzU2MCJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1745566181&x-orig-sign=7M1mhQLXULXPiqPQxe90JdiPvb0%3D)

因此，到最外层执行结束，currentDynamicChildren中存储了所有后代节点的动态节点，把currentDynamicChildren挂载到当前Block上

```js
function render() {
    // 1. 使用 createBlock 代替 createVNode 来创建 block
    // 2. 每当调用 createBlock 之前，先调用 openBlock
    return (
        openBlock(),
        createBlock("div", null, [
            createVNode("p", { class: "foo" }, null, 1 /* patch flag */),
            createVNode("p", { class: "bar" }, null),
        ])
    );
}

function createBlock(tag, props, children) {
    // block 本质上也是一个 vnode
    const block = createVNode(tag, props, children);
    // 将当前动态节点集合作为 block.dynamicChildren
    block.dynamicChildren = currentDynamicChildren;

    // 关闭 block
    closeBlock();
    // 返回
    return block;
}
```

## diff时的优化

目前已经有了vnode.dynamicChildren，以及vnode.patchFlag，基于这两点，就可以实现靶向更新了。

**只比较动态子节点**

```js
function patchElement(n1, n2) {
    const el = (n2.el = n1.el);
    const oldProps = n1.props;
    const newProps = n2.props;

    // 省略部分代码

    if (n2.dynamicChildren) {
        // 调用 patchBlockChildren 函数，这样只会更新动态节点
        patchBlockChildren(n1, n2);
    } else {
        patchChildren(n1, n2, el);
    }
}

function patchBlockChildren(n1, n2) {
    // 只更新动态节点即可
    for (let i = 0; i < n2.dynamicChildren.length; i++) {
        patchElement(n1.dynamicChildren[i], n2.dynamicChildren[i]);
    }
}
```

**节点只比较动态属性**

```js
function patchElement(n1, n2) {
    const el = n2.el = n1.el
    const oldProps = n1.props
    const newProps = n2.props

    if (n2.patchFlags) {
        // 靶向更新
        if (n2.patchFlags === 1) {
        // 只需要更新 class
        } else if (n2.patchFlags === 2) {
        // 只需要更新 style
        } else if (...) {
                // ...
        }
    } else {
        // 全量更新
        for (const key in newProps) {
            if (newProps[key] !== oldProps[key]) {
                patchProps(el, key, oldProps[key], newProps[key])
            }
        }
        for (const key in oldProps) {
        if (!(key in newProps)) {
            patchProps(el, key, oldProps[key], null)
        }
        }
    }

    // 在处理 children 时，调用 patchChildren 函数
    patchChildren(n1, n2, el)
}

```
# 总结
Vue3编译时优化主要有两个点：
1. vue2对所有节点进行diff，vue3只对动态节点进行diff
2. vue2对节点所有属性进行diff，vue3只对变化的属性进行diff

# 参考

[你和大神的距离可能就在这里，Vue3的patchFlags超详细讲解](https://juejin.cn/post/6858955776992968712)

《Vue.js设计与实现》
