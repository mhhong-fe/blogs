<template>
  <div class="book-toc">
    <div class="page-header">
      <h1 class="page-title">前端工程实践手记</h1>
      <p class="page-subtitle">记录编程路上的学习与思考</p>
    </div>
    <div class="book-content">
      <CatalogTree
        :nodes="tocData"
        :expanded-map="expandedMap"
        :max-level="3"
        :level="0"
        @toggle="handleToggle"
        @navigate="handleNavigate"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useData } from 'vitepress'
import CatalogTree from './CatalogTree.vue'

const { site, theme } = useData()

const tocData = ref([])
const expandedMap = ref({})

// 从主题配置获取目录数据
onMounted(() => {
  try {
    const themeConfig = theme.value || {}
    const nav = themeConfig.nav || []
    const sidebar = themeConfig.sidebar || {}
    
    const toc = []
    
    // 使用 nav 的顺序来组织目录
    nav.forEach((navItem) => {
      const path = `/${navItem.text}/`
      const items = sidebar[path] || []
      
      const children = []
      
      // 处理 items，转换为树形结构
      function processItems(items, level = 0) {
        const result = []
        items.forEach(item => {
          if (item.link) {
            result.push({
              title: item.text,
              path: item.link,
              children: item.items && item.items.length > 0 && level < 2 
                ? processItems(item.items, level + 1) 
                : []
            })
          } else if (item.items && item.items.length > 0 && level < 2) {
            result.push({
              title: item.text,
              path: null,
              children: processItems(item.items, level + 1)
            })
          }
        })
        return result
      }
      
      const nodeChildren = processItems(items)
      
      toc.push({
        title: navItem.text,
        path: navItem.link,
        children: nodeChildren
      })
      
      // 默认展开第一级
      expandedMap.value[`root-0-${navItem.text}`] = true
    })
    
    tocData.value = toc
  } catch (error) {
    console.error('Failed to load config:', error)
  }
})

function handleToggle(nodeKey) {
  expandedMap.value[nodeKey] = !expandedMap.value[nodeKey]
}

function handleNavigate(path) {
  const base = site.value.base || '/'
  const fullPath = path.startsWith('/') ? base + path.slice(1) : base + path
  window.location.href = fullPath
}
</script>

<style scoped>
.book-toc {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 24px;
  min-height: calc(100vh - var(--vp-nav-height));
}

/* 标题区 */
.page-header {
  margin-bottom: 28px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #111111;
  letter-spacing: -0.01em;
  margin: 0 0 8px;
  line-height: 1.3;
  border: none;
  padding: 0;
}

.page-subtitle {
  font-size: 14px;
  color: #7C7873;
  line-height: 1.6;
  margin: 0;
}

/* 目录卡片 */
.book-content {
  background: #FFFFFF;
  border: 1px solid #E5E2DC;
  border-radius: 10px;
  padding: 28px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

/* 响应式 */
@media (max-width: 768px) {
  .book-toc {
    padding: 24px 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .book-content {
    padding: 20px;
  }
}
</style>
