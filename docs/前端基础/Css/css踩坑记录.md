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
