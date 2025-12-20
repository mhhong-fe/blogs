# IntersectionObserver API 详解

`IntersectionObserver` 是一个用于异步监听目标元素与其祖先元素或视口（viewport）交叉状态的 API。它可以高效地检测元素是否进入或离开视口，无需频繁计算，性能优异。

## 为什么需要 IntersectionObserver？

### 传统方式的痛点

在 `IntersectionObserver` 出现之前，检测元素是否可见通常使用以下方式：

```javascript
// 方式1：使用 scroll 事件（性能差）
window.addEventListener('scroll', () => {
  const rect = element.getBoundingClientRect();
  const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
  // 处理可见性变化
});

// 方式2：使用定时器轮询（资源浪费）
setInterval(() => {
  const rect = element.getBoundingClientRect();
  const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
  // 处理可见性变化
}, 100);
```

**问题**：
- **性能开销大**：scroll 事件触发频繁，每次都需要计算元素位置
- **主线程阻塞**：频繁的 DOM 查询和计算会阻塞主线程
- **代码复杂**：需要手动处理节流、防抖、边界情况等

### IntersectionObserver 的优势

- ✅ **高性能**：浏览器原生优化，异步执行，不阻塞主线程
- ✅ **自动管理**：浏览器自动处理可见性检测，无需手动计算
- ✅ **精确控制**：可以设置阈值、根元素等，灵活配置
- ✅ **自动清理**：元素被移除时自动取消观察

## API 基本用法

### 创建观察者

```javascript
const observer = new IntersectionObserver(callback, options);
```

### 参数说明

#### 1. callback（回调函数）

当目标元素的可见性发生变化时调用。

```javascript
const callback = (entries, observer) => {
  entries.forEach(entry => {
    // entry 包含目标元素的信息
    console.log(entry.isIntersecting); // 是否相交
    console.log(entry.intersectionRatio); // 相交比例
    console.log(entry.target); // 目标元素
    console.log(entry.boundingClientRect); // 元素边界矩形
    console.log(entry.rootBounds); // 根元素边界矩形
    console.log(entry.intersectionRect); // 相交区域矩形
  });
};
```

#### 2. options（配置选项）

```javascript
const options = {
  root: null,              // 根元素，null 表示视口
  rootMargin: '0px',      // 根元素的边距
  threshold: 0            // 触发回调的阈值（0-1）
};
```

**options 详解**：

- **root**：
  - `null`：使用视口作为根元素（默认）
  - `Element`：指定某个元素作为根元素

- **rootMargin**：
  - 类似 CSS 的 `margin`，可以扩展或缩小根元素的边界
  - 格式：`"10px 20px 30px 40px"`（上右下左）
  - 示例：`"50px"`（四边都是 50px），`"-50px"`（缩小边界）

- **threshold**：
  - `0`：元素刚进入/离开时触发（默认）
  - `1`：元素完全进入时触发
  - `[0, 0.5, 1]`：在 0%、50%、100% 时触发
  - `0.5`：元素 50% 可见时触发

### 观察目标元素

```javascript
// 观察单个元素
observer.observe(element);

// 观察多个元素
elements.forEach(element => {
  observer.observe(element);
});
```

### 停止观察

```javascript
// 停止观察某个元素
observer.unobserve(element);

// 停止所有观察并销毁观察者
observer.disconnect();
```

## Entry 对象详解

回调函数接收的 `entry` 对象包含以下属性：

```javascript
{
  // 目标元素
  target: Element,
  
  // 是否与根元素相交
  isIntersecting: boolean,
  
  // 相交比例（0-1）
  intersectionRatio: number,
  
  // 目标元素的边界矩形
  boundingClientRect: DOMRectReadOnly,
  
  // 根元素的边界矩形
  rootBounds: DOMRectReadOnly,
  
  // 相交区域的边界矩形
  intersectionRect: DOMRectReadOnly,
  
  // 时间戳
  time: number
}
```

## 常见应用场景

### 1. 图片懒加载

最经典的应用场景，当图片进入视口时才加载。

```javascript
// HTML
<img data-src="image.jpg" alt="图片" class="lazy-image">

// JavaScript
const lazyImages = document.querySelectorAll('.lazy-image[data-src]');

const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove('lazy-image');
      observer.unobserve(img); // 加载后停止观察
    }
  });
}, {
  rootMargin: '50px' // 提前 50px 开始加载
});

lazyImages.forEach(img => imageObserver.observe(img));
```

**优化版本**（支持加载状态）：

```javascript
const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      
      // 显示加载状态
      img.classList.add('loading');
      
      // 创建新图片对象预加载
      const imageLoader = new Image();
      imageLoader.onload = () => {
        img.src = imageLoader.src;
        img.classList.remove('loading');
        img.classList.add('loaded');
        observer.unobserve(img);
      };
      imageLoader.onerror = () => {
        img.classList.remove('loading');
        img.classList.add('error');
        observer.unobserve(img);
      };
      imageLoader.src = img.dataset.src;
    }
  });
}, {
  rootMargin: '100px'
});
```

### 2. 无限滚动加载

当滚动到底部时自动加载更多内容。

```javascript
// HTML
<div id="content">...</div>
<div id="sentinel"></div> <!-- 哨兵元素 -->

// JavaScript
const sentinel = document.getElementById('sentinel');
let page = 1;

const loadMoreObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadMoreContent(page++);
    }
  });
}, {
  rootMargin: '200px' // 提前 200px 开始加载
});

loadMoreObserver.observe(sentinel);

async function loadMoreContent(page) {
  // 显示加载状态
  sentinel.textContent = '加载中...';
  
  try {
    const data = await fetch(`/api/content?page=${page}`).then(r => r.json());
    appendContent(data);
    sentinel.textContent = '';
  } catch (error) {
    sentinel.textContent = '加载失败';
  }
}
```

### 3. 元素进入视口动画

当元素进入视口时触发动画效果。

```javascript
// HTML
<div class="fade-in">内容</div>
<div class="slide-up">内容</div>

// CSS
.fade-in {
  opacity: 0;
  transition: opacity 0.6s ease-in;
}

.fade-in.visible {
  opacity: 1;
}

.slide-up {
  transform: translateY(50px);
  opacity: 0;
  transition: transform 0.6s ease-out, opacity 0.6s ease-out;
}

.slide-up.visible {
  transform: translateY(0);
  opacity: 1;
}

// JavaScript
const animatedElements = document.querySelectorAll('.fade-in, .slide-up');

const animationObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      animationObserver.unobserve(entry.target); // 只执行一次
    }
  });
}, {
  threshold: 0.1 // 10% 可见时触发
});

animatedElements.forEach(el => animationObserver.observe(el));
```

### 4. 广告曝光统计

统计广告是否真正被用户看到。

```javascript
const adElements = document.querySelectorAll('.ad');

const adObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
      // 广告至少 50% 可见时统计
      const adId = entry.target.dataset.adId;
      trackAdView(adId);
      adObserver.unobserve(entry.target); // 只统计一次
    }
  });
}, {
  threshold: [0, 0.5, 1] // 多个阈值
});

adElements.forEach(ad => adObserver.observe(ad));

function trackAdView(adId) {
  // 发送统计请求
  fetch('/api/ads/view', {
    method: 'POST',
    body: JSON.stringify({ adId }),
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### 5. 视频自动播放控制

当视频进入视口时播放，离开时暂停。

```javascript
const videos = document.querySelectorAll('video[data-autoplay]');

const videoObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const video = entry.target;
    if (entry.isIntersecting) {
      video.play().catch(err => {
        console.error('自动播放失败:', err);
      });
    } else {
      video.pause();
    }
  });
}, {
  threshold: 0.5 // 50% 可见时播放
});

videos.forEach(video => videoObserver.observe(video));
```

### 6. 导航栏显示/隐藏

根据滚动方向显示或隐藏导航栏。

```javascript
let lastScrollY = 0;
const header = document.getElementById('header');

const headerObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) {
      // 元素离开视口（向上滚动）
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY) {
        header.classList.add('hidden');
      } else {
        header.classList.remove('hidden');
      }
      lastScrollY = currentScrollY;
    } else {
      // 元素在视口内
      header.classList.remove('hidden');
    }
  });
});

// 观察一个位于页面顶部的哨兵元素
const sentinel = document.createElement('div');
sentinel.style.height = '1px';
sentinel.style.position = 'absolute';
sentinel.style.top = '0';
document.body.prepend(sentinel);
headerObserver.observe(sentinel);
```

### 7. 阅读进度条

根据页面滚动显示阅读进度。

```javascript
const progressBar = document.getElementById('progress-bar');
const article = document.getElementById('article');

const progressObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const progress = entry.intersectionRatio;
    progressBar.style.width = `${(1 - progress) * 100}%`;
  });
}, {
  threshold: Array.from({ length: 100 }, (_, i) => i / 100) // 100 个阈值，更平滑
});

progressObserver.observe(article);
```

### 8. 目录高亮

根据当前阅读位置高亮目录项。

```javascript
const sections = document.querySelectorAll('section[id]');
const tocLinks = document.querySelectorAll('.toc a');

// 为每个章节创建观察者
sections.forEach(section => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 移除所有高亮
        tocLinks.forEach(link => link.classList.remove('active'));
        
        // 高亮对应的目录项
        const id = entry.target.id;
        const tocLink = document.querySelector(`.toc a[href="#${id}"]`);
        if (tocLink) {
          tocLink.classList.add('active');
        }
      }
    });
  }, {
    rootMargin: '-20% 0px -70% 0px' // 只在中间区域触发
  });
  
  observer.observe(section);
});
```

### 9. 性能监控

监控关键元素是否被用户看到。

```javascript
const performanceObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const timeToVisible = performance.now() - pageLoadTime;
      console.log(`元素 ${entry.target.id} 在 ${timeToVisible}ms 后可见`);
      
      // 发送性能数据
      sendPerformanceData({
        element: entry.target.id,
        timeToVisible,
        intersectionRatio: entry.intersectionRatio
      });
      
      performanceObserver.unobserve(entry.target);
    }
  });
});

const pageLoadTime = performance.now();
document.querySelectorAll('[data-track-performance]').forEach(el => {
  performanceObserver.observe(el);
});
```

### 10. 虚拟滚动优化

在虚拟列表中，只渲染可见区域的元素。

```javascript
class VirtualList {
  constructor(container, itemHeight, totalItems) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.totalItems = totalItems;
    this.visibleStart = 0;
    this.visibleEnd = 0;
    
    this.setupObserver();
  }
  
  setupObserver() {
    // 创建顶部和底部哨兵元素
    const topSentinel = document.createElement('div');
    const bottomSentinel = document.createElement('div');
    topSentinel.id = 'top-sentinel';
    bottomSentinel.id = 'bottom-sentinel';
    
    this.container.appendChild(topSentinel);
    this.container.appendChild(bottomSentinel);
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.target.id === 'top-sentinel' && entry.isIntersecting) {
          this.loadPrevious();
        } else if (entry.target.id === 'bottom-sentinel' && entry.isIntersecting) {
          this.loadNext();
        }
      });
    });
    
    observer.observe(topSentinel);
    observer.observe(bottomSentinel);
  }
  
  loadPrevious() {
    if (this.visibleStart > 0) {
      this.visibleStart = Math.max(0, this.visibleStart - 10);
      this.render();
    }
  }
  
  loadNext() {
    if (this.visibleEnd < this.totalItems) {
      this.visibleEnd = Math.min(this.totalItems, this.visibleEnd + 10);
      this.render();
    }
  }
  
  render() {
    // 渲染可见区域的元素
    // ...
  }
}
```

## 高级用法

### 1. 自定义根元素

使用指定容器作为根元素，而不是视口。

```javascript
const container = document.getElementById('scroll-container');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    console.log('元素在容器中可见:', entry.isIntersecting);
  });
}, {
  root: container, // 使用容器作为根元素
  threshold: 0.5
});

observer.observe(targetElement);
```

### 2. 多个阈值

设置多个阈值，在不同可见度时触发回调。

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    console.log('可见比例:', entry.intersectionRatio);
    
    if (entry.intersectionRatio === 0) {
      console.log('完全不可见');
    } else if (entry.intersectionRatio === 1) {
      console.log('完全可见');
    } else {
      console.log('部分可见');
    }
  });
}, {
  threshold: [0, 0.25, 0.5, 0.75, 1] // 5 个阈值
});
```

### 3. 使用 rootMargin 提前触发

```javascript
// 提前 100px 开始加载
const observer = new IntersectionObserver(callback, {
  rootMargin: '100px'
});

// 缩小触发区域（元素需要更深入视口才触发）
const observer2 = new IntersectionObserver(callback, {
  rootMargin: '-50px' // 缩小 50px
});
```

### 4. 组合多个观察者

为不同场景创建不同的观察者。

```javascript
// 懒加载观察者（提前加载）
const lazyLoadObserver = new IntersectionObserver(lazyLoadCallback, {
  rootMargin: '200px',
  threshold: 0
});

// 动画观察者（精确触发）
const animationObserver = new IntersectionObserver(animationCallback, {
  threshold: 0.1
});

// 统计观察者（50% 可见）
const statsObserver = new IntersectionObserver(statsCallback, {
  threshold: 0.5
});

// 为不同元素使用不同观察者
document.querySelectorAll('.lazy').forEach(el => lazyLoadObserver.observe(el));
document.querySelectorAll('.animate').forEach(el => animationObserver.observe(el));
document.querySelectorAll('.track').forEach(el => statsObserver.observe(el));
```

## 注意事项与最佳实践

### 1. 浏览器兼容性

```javascript
// 检查浏览器支持
if ('IntersectionObserver' in window) {
  // 使用 IntersectionObserver
} else {
  // 降级方案：使用 scroll 事件
  window.addEventListener('scroll', fallbackHandler);
}
```

**兼容性**：
- Chrome 51+
- Firefox 55+
- Safari 12.1+
- Edge 15+

### 2. 性能优化

```javascript
// ✅ 好的做法：复用观察者
const observer = new IntersectionObserver(callback);
elements.forEach(el => observer.observe(el));

// ❌ 不好的做法：为每个元素创建观察者
elements.forEach(el => {
  const observer = new IntersectionObserver(callback);
  observer.observe(el);
});
```

### 3. 及时清理

```javascript
// 组件销毁时清理观察者
function cleanup() {
  observer.disconnect(); // 停止所有观察
  // 或者
  elements.forEach(el => observer.unobserve(el));
}
```

### 4. 避免频繁回调

```javascript
// 使用防抖处理回调
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

const debouncedCallback = debounce((entries, observer) => {
  // 处理逻辑
}, 100);

const observer = new IntersectionObserver(debouncedCallback);
```

### 5. 处理异步操作

```javascript
const observer = new IntersectionObserver(async (entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      // 异步操作
      await loadData(entry.target);
      observer.unobserve(entry.target);
    }
  }
});
```

## 常见问题排查

### 1. 回调不触发

```javascript
// 检查元素是否真的存在
console.log(element); // 确保元素存在

// 检查元素是否有尺寸
console.log(element.offsetHeight, element.offsetWidth); // 确保有尺寸

// 检查 root 元素
console.log(observer.root); // 检查根元素

// 检查 threshold 设置
console.log(observer.thresholds); // 检查阈值
```

### 2. 回调触发太频繁

```javascript
// 增加 threshold
const observer = new IntersectionObserver(callback, {
  threshold: 0.5 // 只在 50% 可见时触发
});

// 或者使用防抖
const debouncedCallback = debounce(callback, 100);
```

### 3. rootMargin 不生效

```javascript
// 确保 rootMargin 格式正确
rootMargin: '10px 20px 30px 40px' // ✅ 正确
rootMargin: '10px' // ✅ 正确（四边都是 10px）
rootMargin: '10px 20px' // ✅ 正确（上下 10px，左右 20px）
rootMargin: '10' // ❌ 错误，缺少单位
```

## Polyfill

对于不支持 IntersectionObserver 的浏览器，可以使用 polyfill：

```html
<script src="https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver"></script>
```

或者使用 npm：

```bash
npm install intersection-observer
```

```javascript
import 'intersection-observer';
```

## 总结

`IntersectionObserver` 是一个强大的 API，主要优势：

1. **高性能**：浏览器原生优化，异步执行
2. **易用性**：API 简洁，配置灵活
3. **适用场景广泛**：懒加载、无限滚动、动画、统计等

**使用建议**：
- 优先使用 IntersectionObserver 替代 scroll 事件
- 合理设置 threshold 和 rootMargin
- 及时清理不需要的观察者
- 注意浏览器兼容性，提供降级方案

通过合理使用 IntersectionObserver，可以显著提升页面性能和用户体验。

