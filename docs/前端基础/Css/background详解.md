# 语法介绍

## background-color

给元素设置背景色，语法如下，默认值transparent

```css
background-color: red;
background-color: #bbff00; /* 完全不透明 */
/* RGB 值 */
background-color: rgb(255 255 128); /* 完全不透明 */
/* HSL 值 */
background-color: hsl(50 33% 25%); /* 完全不透明 */
/* 特殊关键字值 */
background-color: currentcolor;
background-color: transparent;
```

## background-image

设置背景图，可以设置一个或多个背景图

```css
background-image: url("../../media/examples/lizard.png");

background-image: url("../../media/examples/lizard.png"),
                  url("../../media/examples/star.png");
```

* 背景图会以z轴方向堆叠，先指定的元素在上面
* background-color在背景图之下绘制，如果有背景图一般看不见背景色，但是图片完全渲染可能需要时间，因此即使用背景图也依旧需要指定背景色
* border在背景图之上绘制，想要看到边框下的背景图，border需要设置成dashed之类的值



## background-origin

指定背景图的原点位置

* border-box
* **padding-box，初始值**
* content-box



## background-postion

background-postion为背景图设置初始位置，背景图有多个值，postion对应也可以设置多个值

一个postion需要设置x/y两个值，x/y都可以通过数值、关键字或者二者混合组成，

初始值0 0;

```css
/* 只使用关键字，另一个左边默认为50% */
background-position: top;
background-position: bottom;
background-position: left;
background-position: right;
background-position: center;


/* 使用百分比或者数值,百分比是相对于容器的 */
background-position: 25% 75%;
background-position: 25px 75px;

/* 同时使用关键字和数值，指定单个坐标 */
background-position: bottom 10px right 20px;
background-position: top right 10px;

/* 指定多个值，使用“,”隔开 */
background-position: 25px 75px, 50px 100px;
```



## background-clip

设置图片延伸的区域

* **border-box，背景覆盖边框，默认值**
* padding-box，背景覆盖content + padding
* content-box，背景覆盖内容区域
* text，背景只覆盖文字

## background-repeat

指定背景图重复的方式

* repeat，重复

* repeat-x，x轴重复
* repeat-y，y轴重复
* no-repeat，不重复



## background-size

设置背景图的大小

* cover，缩放背景图到完全覆盖背景区域的大小，背景图可能显示不完整，宽高比不变
* contain，缩放背景图到图片完整显示，背景区可能存在空白，宽高比不变
* auto，图像保持原有尺寸
* 数值
  * 一个值，指定宽度，高度为auto，即图像原始高度
  * 两个值，指定宽、高



## background-attachment

背景是固定还是随着元素滚动而滚动

* fixed，背景相对于视口固定，不滚动
* **scroll，背景相对于元素本身固定，不滚动，默认值**
* local，随着元素滚动而滚动





## background简写

设置多个背景时，使用","分隔，size只能紧接着position出现，例如`center/80%`



## linear-gradient 

线形渐变



 

# 应用



## 色卡



## 棋盘



## 网格

