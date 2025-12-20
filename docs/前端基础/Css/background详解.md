# Background 属性详解

`background` 是 CSS 中用于设置元素背景的简写属性，可以设置背景颜色、背景图片、背景位置、背景大小等多个属性。

## 属性概览

| 属性 | 说明 | 默认值 |
|------|------|--------|
| `background-color` | 背景颜色 | `transparent` |
| `background-image` | 背景图片 | `none` |
| `background-position` | 背景位置 | `0% 0%` |
| `background-size` | 背景大小 | `auto` |
| `background-repeat` | 背景重复 | `repeat` |
| `background-origin` | 背景定位区域 | `padding-box` |
| `background-clip` | 背景绘制区域 | `border-box` |
| `background-attachment` | 背景固定方式 | `scroll` |

## 详细属性说明

### background-color

设置元素的背景颜色。

```css
/* 颜色关键字 */
background-color: red;
background-color: blue;

/* 十六进制 */
background-color: #ff0000;
background-color: #f00; /* 简写 */

/* RGB/RGBA */
background-color: rgb(255, 0, 0);
background-color: rgba(255, 0, 0, 0.5); /* 带透明度 */

/* HSL/HSLA */
background-color: hsl(0, 100%, 50%);
background-color: hsla(0, 100%, 50%, 0.5);

/* 特殊关键字 */
background-color: transparent; /* 透明 */
background-color: currentColor; /* 使用当前文字颜色 */
```

**注意事项**：
- 即使使用背景图，也建议设置背景色，避免图片加载时的空白
- `transparent` 不等于 `rgba(0,0,0,0)`，在某些情况下表现不同

### background-image

设置一个或多个背景图片。

```css
/* 单个背景图 */
background-image: url("image.jpg");

/* 多个背景图（用逗号分隔） */
background-image: 
  url("image1.jpg"),
  url("image2.png"),
  linear-gradient(to bottom, rgba(0,0,0,0.5), transparent);

/* 渐变作为背景 */
background-image: linear-gradient(45deg, #ff0000, #0000ff);
background-image: radial-gradient(circle, #ff0000, #0000ff);
```

**重要特性**：
- 背景图按 z 轴方向堆叠，**先指定的在上层**
- `background-color` 在最底层绘制
- `border` 在背景图之上绘制
- 多个背景图时，其他属性值也要用逗号分隔对应

### background-position

设置背景图片的初始位置。

```css
/* 关键字 */
background-position: top;        /* 等同于 top center */
background-position: bottom;     /* 等同于 bottom center */
background-position: left;       /* 等同于 center left */
background-position: right;      /* 等同于 center right */
background-position: center;     /* 等同于 center center */

/* 关键字组合 */
background-position: top left;
background-position: top right;
background-position: bottom center;

/* 百分比 */
background-position: 50% 50%;    /* 居中 */
background-position: 0% 0%;      /* 左上角 */
background-position: 100% 100%; /* 右下角 */

/* 像素值 */
background-position: 10px 20px;
background-position: -10px -20px; /* 可以负值，图片会超出元素 */

/* 关键字 + 数值（CSS3） */
background-position: right 10px bottom 20px;
background-position: center top 10px;

/* 多个背景图 */
background-position: 0 0, center center;
```

**计算规则**：
- 百分比：`(容器尺寸 - 图片尺寸) × 百分比`
- `0%` = 左/上边缘，`100%` = 右/下边缘
- `center` = `50%`

### background-size

设置背景图片的大小。

```css
/* 关键字 */
background-size: cover;    /* 覆盖整个容器，可能裁剪图片 */
background-size: contain;  /* 完整显示图片，可能有空白 */
background-size: auto;     /* 保持原始尺寸 */

/* 单个值（宽度，高度自动） */
background-size: 100px;
background-size: 50%;

/* 两个值（宽度 高度） */
background-size: 100px 200px;
background-size: 50% 80%;

/* 多个背景图 */
background-size: cover, contain, 100px 100px;
```

**cover vs contain**：
- `cover`：缩放图片以完全覆盖容器，保持宽高比，可能裁剪
- `contain`：缩放图片以完整显示在容器内，保持宽高比，可能有空白

### background-repeat

设置背景图片的重复方式。

```css
/* 单个值 */
background-repeat: repeat;    /* 水平和垂直都重复 */
background-repeat: repeat-x;  /* 只水平重复 */
background-repeat: repeat-y;  /* 只垂直重复 */
background-repeat: no-repeat; /* 不重复 */

/* CSS3 新值 */
background-repeat: space;     /* 重复并均匀分布 */
background-repeat: round;     /* 重复并缩放以填满 */

/* 两个值（水平 垂直） */
background-repeat: repeat no-repeat;
background-repeat: space round;

/* 多个背景图 */
background-repeat: no-repeat, repeat-x, repeat-y;
```

### background-origin

指定背景图片的定位区域（`background-position` 的参考点）。

```css
background-origin: border-box;  /* 相对于边框盒 */
background-origin: padding-box; /* 相对于内边距盒（默认） */
background-origin: content-box; /* 相对于内容盒 */
```

**视觉效果**：
- `border-box`：背景图从边框外边缘开始定位
- `padding-box`：背景图从内边距外边缘开始定位
- `content-box`：背景图从内容区域边缘开始定位

### background-clip

指定背景的绘制区域（哪些区域显示背景）。

```css
background-clip: border-box;  /* 延伸到边框（默认） */
background-clip: padding-box;  /* 只延伸到内边距 */
background-clip: content-box;  /* 只延伸到内容区域 */
background-clip: text;         /* 只在文字区域显示（需要 -webkit- 前缀） */
```

**与 `background-origin` 的区别**：
- `background-origin`：控制**定位参考点**
- `background-clip`：控制**显示区域**

### background-attachment

设置背景图片的固定方式。

```css
background-attachment: scroll; /* 相对于元素固定（默认） */
background-attachment: fixed;   /* 相对于视口固定 */
background-attachment: local;   /* 相对于元素内容固定 */
```

**使用场景**：
- `scroll`：背景随元素滚动（最常见）
- `fixed`：背景固定在视口，常用于全屏背景
- `local`：背景随元素内容滚动（用于可滚动元素）

### background 简写

`background` 是以上所有属性的简写形式。

```css
/* 完整语法 */
background: 
  [background-color]
  [background-image]
  [background-position] / [background-size]
  [background-repeat]
  [background-attachment]
  [background-origin]
  [background-clip];

/* 示例 */
background: #ff0000 url("image.jpg") center/cover no-repeat;

/* 多个背景 */
background:
  url("image1.jpg") top left / 100px 100px no-repeat,
  url("image2.jpg") bottom right / 200px 200px no-repeat,
  linear-gradient(to bottom, rgba(0,0,0,0.5), transparent);
```

**注意事项**：
- `background-size` 必须紧跟在 `background-position` 后面，用 `/` 分隔
- 顺序可以任意，但建议按上述顺序
- 未指定的属性会使用默认值

## 常见应用场景

### 1. 全屏背景图

```css
.hero-section {
  background-image: url("hero-bg.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed; /* 视差效果 */
  height: 100vh;
}
```

### 2. 渐变背景

```css
/* 线性渐变 */
.gradient-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 径向渐变 */
.radial-gradient {
  background: radial-gradient(circle at center, #ff0000, #0000ff);
}

/* 多色渐变 */
.multi-color {
  background: linear-gradient(
    to right,
    #ff0000 0%,
    #ff7f00 25%,
    #ffff00 50%,
    #00ff00 75%,
    #0000ff 100%
  );
}
```

### 3. 图案背景（重复纹理）

```css
.pattern-bg {
  background-image: url("pattern.png");
  background-repeat: repeat;
  background-size: 50px 50px;
}

/* 使用渐变创建图案 */
.checkerboard {
  background-image: 
    linear-gradient(45deg, #000 25%, transparent 25%),
    linear-gradient(-45deg, #000 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #000 75%),
    linear-gradient(-45deg, transparent 75%, #000 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}
```

### 4. 文字渐变效果

```css
.gradient-text {
  background: linear-gradient(45deg, #ff0000, #0000ff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent; /* 降级方案 */
}
```

### 5. 图标背景

```css
.icon-link {
  background-image: url("icon.png");
  background-size: 20px 20px;
  background-position: left center;
  background-repeat: no-repeat;
  padding-left: 30px; /* 为图标留出空间 */
}
```

### 6. 水印效果

```css
.watermark {
  background-image: 
    url("watermark.png"),
    url("content-bg.jpg");
  background-position: 
    center center,
    0 0;
  background-size: 
    200px 200px,
    cover;
  background-repeat: no-repeat;
  opacity: 0.3; /* 水印透明度 */
}
```

### 7. 响应式背景图

```css
.responsive-bg {
  background-image: url("bg-small.jpg");
  background-size: cover;
  background-position: center;
}

/* 大屏幕使用大图 */
@media (min-width: 768px) {
  .responsive-bg {
    background-image: url("bg-large.jpg");
  }
}

/* 高 DPR 设备使用高清图 */
@media (-webkit-min-device-pixel-ratio: 2) {
  .responsive-bg {
    background-image: url("bg-2x.jpg");
  }
}
```

### 8. 多图层背景

```css
.layered-bg {
  background:
    /* 顶层：装饰图案 */
    url("pattern.png") top left / 100px 100px repeat,
    /* 中层：渐变遮罩 */
    linear-gradient(to bottom, rgba(0,0,0,0.3), transparent),
    /* 底层：主背景图 */
    url("main-bg.jpg") center/cover no-repeat,
    /* 最底层：背景色 */
    #f0f0f0;
}
```

## 使用技巧与最佳实践

### 1. 性能优化

```css
/* ❌ 不推荐：大图直接使用 */
.bad {
  background-image: url("huge-image-5000x5000.jpg");
}

/* ✅ 推荐：使用合适尺寸的图片 */
.good {
  background-image: url("optimized-image-1920x1080.jpg");
  background-size: cover;
}

/* ✅ 使用 WebP 格式 */
.modern {
  background-image: url("image.webp");
}

/* 降级方案 */
.modern {
  background-image: url("image.jpg"); /* 降级 */
  background-image: image-set(
    url("image.webp") type("image/webp"),
    url("image.jpg") type("image/jpeg")
  );
}
```

### 2. 背景色作为降级方案

```css
.card {
  /* 先设置背景色，图片加载失败时显示 */
  background-color: #f0f0f0;
  background-image: url("card-bg.jpg");
  background-size: cover;
}
```

### 3. 使用 CSS 变量

```css
:root {
  --bg-color: #ffffff;
  --bg-image: url("bg.jpg");
  --bg-size: cover;
}

.element {
  background-color: var(--bg-color);
  background-image: var(--bg-image);
  background-size: var(--bg-size);
}
```

### 4. 背景图预加载

```html
<!-- 在 <head> 中预加载关键背景图 -->
<link rel="preload" as="image" href="hero-bg.jpg">
```

### 5. 使用 data URI（小图标）

```css
/* 小图标可以直接内联，减少 HTTP 请求 */
.icon {
  background-image: url("data:image/svg+xml,%3Csvg...%3E");
}
```

### 6. 背景图与内容分离

```css
/* 使用伪元素创建背景层，便于控制 */
.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("bg.jpg");
  background-size: cover;
  z-index: -1;
  opacity: 0.5;
}
```

### 7. 背景图动画

```css
@keyframes bgMove {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 100% 0;
  }
}

.animated-bg {
  background-image: url("pattern.png");
  background-size: 200px 200px;
  animation: bgMove 10s linear infinite;
}
```

### 8. 背景图遮罩

```css
/* 使用渐变创建遮罩效果 */
.overlay-bg {
  background-image: 
    linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),
    url("bg.jpg");
  background-size: cover;
}

/* 或者使用伪元素 */
.overlay-bg::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}
```

### 9. 背景图居中技巧

```css
/* 方法1：使用 background-position */
.center-bg {
  background-position: center center;
}

/* 方法2：使用百分比 */
.center-bg {
  background-position: 50% 50%;
}

/* 方法3：使用 calc（精确控制） */
.center-bg {
  background-position: calc(50% - 100px) calc(50% - 100px);
}
```

### 10. 背景图裁剪技巧

```css
/* 只显示图片的某个区域 */
.cropped-bg {
  background-image: url("image.jpg");
  background-size: 200% 200%; /* 放大图片 */
  background-position: -100px -50px; /* 移动位置 */
}
```

## 常见问题排查

### 1. 背景图不显示

```css
/* 检查清单 */
.element {
  /* ✅ 路径是否正确 */
  background-image: url("./images/bg.jpg"); /* 相对路径 */
  background-image: url("/images/bg.jpg"); /* 绝对路径 */
  
  /* ✅ 是否有内容或尺寸 */
  width: 100px;
  height: 100px;
  /* 或者 */
  min-height: 100px;
  
  /* ✅ 是否被其他样式覆盖 */
  background-image: url("bg.jpg") !important;
}
```

### 2. 背景图模糊

```css
/* 原因1：DPR 适配问题 */
.high-dpi {
  background-image: url("bg-2x.jpg");
  background-size: 100px 100px; /* 实际显示 100px，但使用 2x 图 */
}

/* 原因2：background-size 设置不当 */
.sharp {
  background-size: contain; /* 或精确像素值 */
  /* 避免使用百分比缩放 */
}
```

### 3. 背景图重复

```css
/* 如果不想重复，记得设置 */
.no-repeat {
  background-repeat: no-repeat;
}
```

### 4. 背景图位置不对

```css
/* 检查 background-origin */
.check-origin {
  background-origin: padding-box; /* 默认值 */
  /* 或 */
  background-origin: content-box;
}
```

## 浏览器兼容性

| 属性 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| `background-size` | 4+ | 4+ | 4.1+ | 9+ |
| `background-clip: text` | 4+ (-webkit-) | 49+ | 3.1+ (-webkit-) | 15+ |
| `background-attachment: fixed` | 所有版本 | 所有版本 | 所有版本 | 所有版本（注意：移动端可能不支持） |

**注意事项**：
- `background-attachment: fixed` 在移动端可能表现异常，建议使用 JavaScript 实现视差效果
- `background-clip: text` 需要 `-webkit-` 前缀

## 总结

`background` 属性功能强大，掌握以下几点很重要：

1. **背景色作为降级方案**：即使使用背景图，也要设置背景色
2. **合理使用 `background-size`**：`cover` 和 `contain` 是最常用的值
3. **多背景图的使用**：可以创建丰富的视觉效果
4. **性能优化**：使用合适尺寸的图片，考虑使用 WebP 格式
5. **响应式设计**：使用媒体查询为不同设备提供不同背景图

通过合理使用 `background` 属性，可以创建出美观且性能良好的页面背景效果。
