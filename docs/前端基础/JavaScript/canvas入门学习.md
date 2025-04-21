canvas是html5提供的独立画布，能够更绘制更加丰富的图形和2d动画；并且由于canvas是独立画布，不会引起大范围的回流，因此性能上也更加出色。以下是canvas的入门学习，目标是能够使用canvas绘制简单的图形和动画

<h1 id="oKTZT">提供画布</h1>
canvas可以像普通的html元素一样设置样式

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
        <style>
            canvas {
                border: 1px solid #000;
            }
        </style>
    </head>
    <body>
        <canvas id="canvas" width="300" height="200"></canvas>
    </body>
</html>
```

这样就提供了一个宽300，高200，带边框的画布

![](https://cdn.nlark.com/yuque/0/2024/png/22310040/1730537740260-73555346-0c52-46ed-81a7-8d10478559f6.png)

**canvas的尺寸说明**

canvas的宽高默认是300 * 150，也可以通过width/height修改，它对应屏幕上的300px * 150px

```html
<canvas id="canvas" width="300" height="150"></canvas>
```

也可以设置canvas的宽高和css不一致，画布宽高500*300，而css像素是250*150，后续绘图使用的是canvas的宽高，再转换到页面显示会不一样，最好保持二者一致

```html
<canvas id="myCanvas" width="500" height="300" style="width: 250px; height: 150px;"></canvas>
```

<h1 id="NPhIT">绘制图形</h1>
canvas只支持绘制**矩形**和**路径(**<font style="color:rgb(27, 27, 27);">由一系列点连成的线段</font>**)**，其他所有类型的图形都是通过一条或者多条路径组合而成。

+ canvas.getContext，用来判断浏览器是否支持canvas
+ canvas.getContext('2d')，用来获取2d上下文，使用这个对象来绘制图形

```javascript
const canvas = document.getElementById("canvas");
// 
if (canvas.getContext) {}
```



<h2 id="Oycy0">绘制矩形</h2>
+ fillRect(x, y, width, height)，用于填充矩形
    - x/y，矩形做上点的坐标
    - width/height，矩形宽高
    - 矩形的样式由当前的fillStyle决定
+ strokeRect(x, y, width, height)，用于绘制矩形边框
    - 边框的样式由当前stokeStyle决定
+ clearRect(x, y, width, height)，用于清空画布



```javascript
function draw() {
    const canvas = document.getElementById("canvas");
    if (canvas.getContext) {
        const ctx = canvas.getContext("2d");
        // 默认填充黑色
        ctx.fillRect(25, 25, 100, 100);
        ctx.clearRect(45, 45, 60, 60);
        ctx.strokeRect(50, 50, 50, 50);
    }
}

draw();
```

效果如下：

![](https://cdn.nlark.com/yuque/0/2024/png/22310040/1730537371569-3a22c22e-908c-4bcc-887e-75c932373bce.png)

<h2 id="TnAk9">绘制路径</h2>
+ beginPath，<font style="color:rgb(27, 27, 27);">新建一条路径，生成之后，图形绘制命令被指向到路径上生成路径。</font>
+ <font style="color:rgb(27, 27, 27);">closePath，闭合路径之后图形绘制命令又重新指向到上下文中。</font>
+ <font style="color:rgb(27, 27, 27);">stroke，通过线条来绘制图形轮廓。</font>
+ <font style="color:rgb(27, 27, 27);">fill，通过填充路径的内容区域生成实心的图形。</font>
+ <font style="color:rgb(27, 27, 27);">moveTo(x, y)，把画笔移动到坐标(x, y)处</font>
+ <font style="color:rgb(27, 27, 27);">lineTo(x, y)，</font><font style="color:rgb(27, 27, 27);">绘制一条从当前位置到指定 x 以及 y 位置的直线。</font>
+ arc(x, y, radius, startAngle, endAngle, anticlockwise)
    - <font style="color:rgb(27, 27, 27);">画一个以（x,y）为圆心的以 radius 为半径的圆弧（圆），从 startAngle 开始到 endAngle 结束，按照 anticlockwise 给定的方向（默认为顺时针）来生成。</font>
+ **<font style="color:rgb(27, 27, 27);">路径中还有贝塞尔曲线等复杂的路径，暂时跳过</font>**



通过上面这些api，就可以开始画一些简单的图形了。

**画两个三角形**

```javascript
function draw() {
    var canvas = document.getElementById("canvas");
    if (canvas.getContext) {
        var ctx = canvas.getContext("2d");

        // 填充三角形
        ctx.beginPath();
        ctx.moveTo(25, 25);
        ctx.lineTo(105, 25);
        ctx.lineTo(25, 105);
        ctx.fill();

        // 描边三角形
        ctx.beginPath();
        ctx.moveTo(125, 125);
        ctx.lineTo(125, 45);
        ctx.lineTo(45, 125);
        ctx.closePath();
        ctx.stroke();
    }
}
```

效果如下：  
![](https://cdn.nlark.com/yuque/0/2024/png/22310040/1730538617878-142373c5-a3c1-4d2e-a84b-a4730d8b4d69.png)

<font style="color:rgb(27, 27, 27);"></font>

<h2 id="rWKTv"><font style="color:rgb(27, 27, 27);">设置样式</font></h2>
+ <font style="color:rgb(27, 27, 27);">fillStyle = color，填充颜色</font>
+ <font style="color:rgb(27, 27, 27);">strokeStyle = color，描边颜色</font>
+ <font style="color:rgb(27, 27, 27);">globalAlpha，设置透明度</font>
+ <font style="color:rgb(27, 27, 27);">lineWidth = value，设置线条宽度</font>
+ <font style="color:rgb(27, 27, 27);">lineType = type，设置线条末端样式</font>
+ <font style="color:rgb(27, 27, 27);">阴影/渐变等更多样式，请自行查阅文档</font>

<h3 id="t3pAZ">使用fillStyle绘制调色板</h3>
```javascript
function draw() {
    var ctx = document.getElementById("canvas").getContext("2d");
    for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 6; j++) {
            ctx.fillStyle =
                "rgb(" +
                Math.floor(255 - 42.5 * i) +
                "," +
                Math.floor(255 - 42.5 * j) +
                ",0)";
            ctx.fillRect(j * 25, i * 25, 25, 25);
        }
    }
}
```

效果如下：

![](https://cdn.nlark.com/yuque/0/2024/png/22310040/1730539458688-65e28e93-e53d-4594-a8cd-d0357250f393.png)



<h3 id="gORwL">绘制线条</h3>
```javascript
function draw() {
  var ctx = document.getElementById("canvas").getContext("2d");
  for (var i = 0; i < 10; i++) {
    ctx.lineWidth = 1 + i;
    ctx.beginPath();
    ctx.moveTo(5 + i * 14, 5);
    ctx.lineTo(5 + i * 14, 140);
    ctx.stroke();
  }
}
```



![](https://cdn.nlark.com/yuque/0/2024/png/22310040/1730539813097-0c222113-374a-466e-b805-eb1aea91c7d6.png)



<h1 id="b3D6c">绘制文本</h1>
+ font，指定文本样式
+ textAlign = value，对齐方式
+ direction = value，文本方向
+ fillText(text, x, y [, maxWidth])
    - <font style="color:rgb(27, 27, 27);">在指定的 (x,y) 位置填充指定的文本，绘制的最大宽度是可选的。</font>
+ strokeText(text, x, y [, maxWidth])
    - <font style="color:rgb(27, 27, 27);">在指定的 (x,y) 位置绘制文本边框，绘制的最大宽度是可选的。</font>

```javascript
function draw() {
  var ctx = document.getElementById("canvas").getContext("2d");
  ctx.font = "48px serif";
  ctx.fillText("Hello world", 10, 50);
}
```

![](https://cdn.nlark.com/yuque/0/2024/png/22310040/1730543571773-5b87cc5a-2ab5-4db4-aac9-c05e3dbe666e.png)



<h1 id="ftl0u">变形Transform</h1>
+ save()，保存canvas的所有状态，入栈
+ restore()，恢复栈中上一个canvas的状态

在做变形前，最好都保存一下当前的状态

+ translate(x, y)，把canvas往右下角移动一定距离

![](https://cdn.nlark.com/yuque/0/2024/png/22310040/1730544635978-722d992d-77f8-4a46-825d-f636b977bdac.png)

+ rotate(angle)，<font style="color:rgb(27, 27, 27);">这个方法只接受一个参数：旋转的角度 (angle)，它是顺时针方向的，以弧度为单位的值。旋转的中心点始终是 canvas 的原点，如果要改变它，我们需要用到 </font>`<font style="color:rgb(27, 27, 27);">translate</font>`<font style="color:rgb(27, 27, 27);">方法。</font>
+ <font style="color:rgb(27, 27, 27);">scale(x, y)，缩放画布，比1大放大图形，比1小缩小图形</font>

**一个移动的案例**

save/restore之后，每次都是在原点的基础上进行移动

```javascript
function draw() {
  var ctx = document.getElementById("canvas").getContext("2d");
  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < 3; j++) {
      ctx.save();
      ctx.fillStyle = "rgb(" + 51 * i + ", " + (255 - 51 * i) + ", 255)";
      ctx.translate(10 + j * 50, 10 + i * 50);
      ctx.fillRect(0, 0, 25, 25);
      ctx.restore();
    }
  }
}
```

![](https://cdn.nlark.com/yuque/0/2024/png/22310040/1730544741433-6750846e-e83d-4648-9724-e0241352e9f5.png)



<h1 id="rGTgy">小球坠落动画</h1>
小球自由坠落

<h2 id="ggVf5">绘制小球</h2>
```html
<canvas id="canvas" width="600" height="300"></canvas>
```

```javascript
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var ball = {
    x: 100,
    y: 100,
    radius: 25,
    color: "blue",
    draw: function () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
    },
};

ball.draw();
```

完成小球的绘制：

![](https://cdn.nlark.com/yuque/0/2024/png/22310040/1730545688579-0d6de028-1b19-4604-bd46-f40daa7ae0a5.png)



<h2 id="B4HW6">增加动画</h2>
+ window.requestAnimationFrame(callback)，可以让浏览器重新绘制前执行一次callback，这个函数是一次性的，因此要在callback中递归的调用，才会有连续动画的效果。
    - 使用cancelAnimationFrame取消
+ 增加vy/vx，控制坐标的增量，每次执行清空画布、渲染、修改左边三步
    - 遇到边界，需要反转vy/vx
    - vy有加速度，更真实

```javascript
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
        <style>
            canvas {
                display: block;
                margin: 200px auto;
                border: 1px solid #000;
            }
        </style>
    </head>
    <body>
        <canvas id="canvas" width="600" height="300"></canvas>
        <script>
            const canvas = document.getElementById("canvas");
            const ctx = canvas.getContext("2d");
            let raf;

            const ball = {
                x: 100,
                y: 100,
                // 要改变的距离
                vx: 5,
                vy: 2,
                radius: 25,
                color: "blue",
                draw() {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
                    ctx.closePath();
                    ctx.fillStyle = this.color;
                    ctx.fill();
                },
            };

            function draw() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ball.draw();
                // 每次距离改变这么多
                ball.x += ball.vx;
                ball.y += ball.vy;
                // 下降时，vy为正，vy逐渐变大；
                // 上升时，vy为负，vy逐渐变小；符合物体坠落、弹跳的运动规律
                ball.vy *= 0.99;
                ball.vy += 0.25;

                // 边界处理，遇到边界，方向转向
                if (ball.y + ball.vy > canvas.height || ball.y + ball.vy < 0) {
                    ball.vy = -ball.vy;
                }
                if (ball.x + ball.vx > canvas.width || ball.x + ball.vx < 0) {
                    ball.vx = -ball.vx;
                }

                // 空闲时执行，一次性，必须递归调用
                raf = window.requestAnimationFrame(draw);
            }

            canvas.addEventListener("mouseover", (e) => {
                raf = window.requestAnimationFrame(draw);
            });

            canvas.addEventListener("mouseout", (e) => {
                window.cancelAnimationFrame(raf);
            });

            ball.draw();
        </script>
    </body>
</html>

```

[juejin](https://code.juejin.cn/pen/7432684639141478410?embed=true)



<h2 id="ywZw4">增加长尾效果</h2>
之前每次绘制时使用clearRect清空画布，现在使用半透明的颜色遮盖画布，没遮盖一次，之前的小球就会变浅一点，直到完全消失。

```javascript
ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
ctx.fillRect(0, 0, canvas.width, canvas.height);
```

[juejin](https://code.juejin.cn/pen/7432692903749058594?embed=true)

<h1 id="u9pAI">小球跟随鼠标移动</h1>
[juejin](https://code.juejin.cn/pen/7432688501847982117?embed=true)



<h1 id="yXjUX">参考</h1>
[Canvas 教程](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial)

