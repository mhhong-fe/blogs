<template>
  <div class="book-toc">
    <!-- <div class="book-cover">
      <h1 class="book-title">{{ bookTitle }}</h1>
      <p class="book-subtitle">{{ bookSubtitle }}</p>
    </div> -->
    
    <div class="book-content">
      <!-- <div class="toc-header">
        <h2>目录</h2>
      </div> -->
      
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

const bookTitle = computed(() => site.value.title || '前端工程手记')
const bookSubtitle = computed(() => site.value.description || '记录编程路上的学习与思考')

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
  padding: 2rem;
  min-height: calc(100vh - var(--vp-nav-height));
}

.book-cover {
  text-align: center;
  padding: 2rem 0;
  margin-bottom: 2rem;
}

.book-title {
  font-size: 2.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-text-1);
}

.book-subtitle {
  font-size: 1rem;
  color: var(--vp-c-text-2);
  margin: 0;
}

.book-content {
  background: var(--vp-c-bg);
  padding: 2rem;
}

.toc-header {
  margin-bottom: 2rem;
}

.toc-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: var(--vp-c-text-1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .book-toc {
    padding: 1rem;
  }
  
  .book-title {
    font-size: 2rem;
  }
  
  .book-content {
    padding: 1.5rem;
  }
}
</style>
