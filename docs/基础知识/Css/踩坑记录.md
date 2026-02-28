# 背景

本文用以记录css开发中踩过的一些坑



# 文本换行消失

> white-spase: pre-wrap;

css中通过`white-space`属性来控制对**空白字符**、**换行符**的处理，默认值是normal

* 合并连续空白符
* 把换行符当成空白符处理，按照容器的大小来进行换行

```html
<body>
    <div class="container"></div>
</body>

<script>
    let text = `千山鸟飞绝，万路人踪灭；
孤舟蓑笠翁，独钓寒江雪。`;
    let container = document.querySelector('.container');
    container.innerHTML = text;
</script>
```

显示如下

![image.png](https://s2.loli.net/2025/01/11/wv9DkyE4Lsf68K2.png)

文本中的换行消失了，有时候并不符合我们的预期，因此可以改成pre-wrap

* 保留连续空白
* 保留换行符

保留换行可以设置成pre-wrap：

```css
.container {
	white-space: pre-wrap;
}
```

显示如下：

![image.png](https://s2.loli.net/2025/01/11/XwVhJHgU7a8vQr5.png)



# 超出省略不生效

text-overflow: ellipsis生效，**需要容器有明确的宽度**，如果有缩放的需求，可以指定min-width和max-width

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        .container {
            display: flex;
        }

        .ellipsis {
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
        }

        .content {
            flex: 1;
            display: flex;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <span>icon</span>
            <span class="ellipsis">千山鸟飞绝，万路人踪灭；孤舟蓑笠翁，独钓寒江雪。</span>
        </div>
    </div>
</body>

</html>
```

上面的例子中，ellipsis不会生效，因为

* container设置了flex，content的宽度由内容决定，宽度不确定
* ellipisis的容器宽度不确定，省略号就不会生效

解决方案，确定宽度，content指定最大宽度即可，也不影响缩放：

```css
.content {
    flex: 1;
    display: flex;
    max-width: 100%;
}
```





# flex: 1的自动缩小不生效

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        .container {
            display: flex;
        }

        .ellipsis {
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
        }

        .content {
            flex: 1;
            display: flex;
            max-width: 100%;
        }
    </style>
</head>
<body>
    <div class="container">
        <span>Hello World</span>
        <div class="content">
            <span class="ellipsis">千山鸟飞绝，万路人踪灭；孤舟蓑笠翁，独钓寒江雪。</span>
        </div>
    </div>
</body>

</html>
```

宽度不够时预期是content部分自动收缩，显示省略号，实际情况是content挤占了其他元素的空间：

![image.png](https://s2.loli.net/2025/01/11/DYL29xp1Brw3Ptg.png)

解决方案：加上min-width: 0; 允许无限缩小

```css
.content {
    flex: 1;
    display: flex;
    max-width: 100%;
    min-width: 0;
}
```

显示效果符合预期

![image.png](https://s2.loli.net/2025/01/11/plbHsPrv5LV1tfa.png)



# 0.5px在iOS上不渲染

在 iOS Safari 浏览器中，直接设置 `border: 0.5px` 可能无法正常显示，会被渲染成 0px 或 1px。

## 问题原因

### 1. 像素密度和逻辑像素

iOS 设备（特别是 Retina 屏）使用**物理像素**和**逻辑像素（CSS 像素）**的概念：

- **物理像素**：设备屏幕实际拥有的像素点数量
- **逻辑像素（CSS 像素）**：浏览器使用的抽象单位，1 CSS 像素可能对应多个物理像素

例如，iPhone 的 Retina 屏通常有 2x 或 3x 的像素密度（devicePixelRatio = 2 或 3），这意味着：
- 1 CSS 像素 = 2 或 3 个物理像素
- 0.5 CSS 像素 = 1 或 1.5 个物理像素

### 2. 浏览器渲染机制

iOS Safari 在处理小于 1px 的边框时，会进行**四舍五入**处理：

- `border: 0.5px` → 可能被渲染为 `0px`（向下取整）或 `1px`（向上取整）
- 具体行为取决于浏览器的实现和设备的像素密度

### 3. 渲染引擎限制

WebKit（Safari 的渲染引擎）在处理亚像素渲染时存在限制：

- 不支持真正的亚像素边框渲染
- 对于小于 1px 的值，会进行整数化处理
- 这导致 0.5px 无法被正确渲染

## 解决方案

### 方案一：使用 transform: scale() 缩放（推荐）

使用伪元素配合 `transform: scale()` 来实现 0.5px 边框：

```css
.hairline-border {
    position: relative;
}

.hairline-border::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    border: 1px solid #000;
    transform: scale(0.5);
    transform-origin: 0 0;
    box-sizing: border-box;
    pointer-events: none;
}
```

如果只需要单边边框，可以这样：

```css
/* 底部边框 */
.hairline-bottom {
    position: relative;
}

.hairline-bottom::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 1px;
    background-color: #000;
    transform: scaleY(0.5);
    transform-origin: 0 bottom;
}
```

**原理**：先创建 1px 的边框，然后通过 `transform: scale(0.5)` 缩小到 0.5px，这样在高 DPR 设备上就能正确显示。

### 方案二：使用 border-image

使用 `border-image` 配合渐变来创建 0.5px 边框：

```css
.hairline-border-image {
    border: 1px solid transparent;
    border-image: linear-gradient(to bottom, #000 50%, transparent 50%) 1;
}
```

**原理**：通过渐变图像创建视觉上的 0.5px 边框效果。

## 最佳实践

**推荐使用方案一（transform: scale）**，因为：
- 兼容性好，支持所有现代浏览器
- 视觉效果稳定，在所有设备上表现一致
- 可以精确控制边框位置和粗细

实际项目中可以封装成通用的工具类：

```css
/* 通用 0.5px 边框工具类 */
.hairline {
    position: relative;
}

.hairline::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 200%;
    height: 200%;
    border: 1px solid;
    transform: scale(0.5);
    transform-origin: 0 0;
    box-sizing: border-box;
    pointer-events: none;
}

/* 单边边框 */
.hairline-top::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 1px;
    background-color: currentColor;
    transform: scaleY(0.5);
    transform-origin: 0 top;
}

.hairline-bottom::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 1px;
    background-color: currentColor;
    transform: scaleY(0.5);
    transform-origin: 0 bottom;
}
```
