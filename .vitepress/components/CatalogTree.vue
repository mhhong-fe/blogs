<template>
  <ul class="catalog-tree">
    <li
      v-for="(node, index) in nodes"
      :key="getNodeKey(node, index)"
      class="tree-node"
    >
      <div class="node-row" :class="{ clickable: isArticleNode(node) }">
        <button
          v-if="canExpand(node)"
          class="toggle-btn"
          type="button"
          :class="{ expanded: isExpanded(node, index) }"
          @click="$emit('toggle', getNodeKey(node, index))"
        >
          <span class="toggle-icon" aria-hidden="true"></span>
        </button>
        <span v-else class="toggle-placeholder" aria-hidden="true"></span>

        <button
          class="node-link"
          type="button"
          @click="onNodeClick(node, index)"
        >
          <span class="node-title">{{ node.title }}</span>
          <span
            v-if="isArticleNode(node)"
            class="node-dash"
            aria-hidden="true"
          ></span>
          <span v-if="isArticleNode(node) && node.time" class="node-time">{{ node.time }}</span>
        </button>
      </div>

      <CatalogTree
        v-if="canExpand(node) && isExpanded(node, index)"
        :nodes="node.children || []"
        :expanded-map="expandedMap"
        :max-level="maxLevel"
        :level="level + 1"
        :parent-key="getNodeKey(node, index)"
        @toggle="$emit('toggle', $event)"
        @navigate="$emit('navigate', $event)"
      />
    </li>
  </ul>
</template>

<script setup>
const props = defineProps({
  nodes: {
    type: Array,
    required: true
  },
  expandedMap: {
    type: Object,
    required: true
  },
  maxLevel: {
    type: Number,
    default: 3
  },
  level: {
    type: Number,
    default: 0
  },
  parentKey: {
    type: String,
    default: 'root'
  }
})

const emit = defineEmits(['toggle', 'navigate'])

const canExpand = (node) => {
  return props.level < props.maxLevel && (node.children?.length || 0) > 0
}

const getNodeKey = (node, index) => {
  return `${props.parentKey}-${index}-${node.title}`
}

const isExpanded = (node, index) => {
  return !!props.expandedMap[getNodeKey(node, index)]
}

const isLinkNode = (node) => {
  return !!node.path
}

// 文章节点：有路径 且 没有子节点
const isArticleNode = (node) => {
  return !!node.path && !canExpand(node)
}

const onNodeClick = (node, index) => {
  // 有子节点的目录：只折叠/展开，不跳转
  if (canExpand(node)) {
    emit('toggle', getNodeKey(node, index))
    return
  }
  // 文章节点：跳转
  if (node.path) {
    emit('navigate', node.path)
  }
}
</script>

<style scoped>
.catalog-tree {
  list-style: none;
  margin: 0;
  padding: 0;
}

.tree-node {
  margin: 1px 0;
}

.node-row {
  display: flex;
  align-items: center;
  border-radius: 6px;
  transition: background-color 0.15s ease;
}

.node-row.clickable:hover {
  background: #f4f3ee;
}

.toggle-btn,
.toggle-placeholder {
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
}

.toggle-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.toggle-icon {
  width: 5px;
  height: 5px;
  border-right: 1.5px solid #b1ada1;
  border-bottom: 1.5px solid #b1ada1;
  transform: rotate(-45deg);
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.toggle-btn:hover .toggle-icon {
  border-color: #c15f3c;
}

.toggle-btn.expanded .toggle-icon {
  transform: rotate(45deg);
}

/* 文章节点 */
.node-link {
  width: 100%;
  display: flex;
  align-items: center;
  border: none;
  background: transparent;
  color: #3d3a36;
  cursor: pointer;
  padding: 5px 8px;
  font-size: 14px;
  line-height: 1.6;
  text-align: left;
  border-radius: 6px;
  font-family: inherit;
  transition: color 0.15s ease;
}

.node-row.clickable .node-link:hover {
  color: #111;
}

/* 目录标题（无 path，不可跳转） */
.node-row:not(.clickable) {
  margin-top: 8px;
}

.node-row:not(.clickable) .node-link {
  color: #c15f3c;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: default;
  padding: 4px 8px;
}

.node-row:not(.clickable) .node-link:hover {
  color: #c15f3c;
}

.node-title {
  white-space: nowrap;
}

.node-dash {
  flex: 1;
  border-bottom: 1px dashed #dedad4;
  margin: 0 10px;
  transform: translateY(1px);
}

.node-time {
  color: #b1ada1;
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

/* 子树缩进 + 左边线 */
.catalog-tree .catalog-tree {
  margin-left: 16px;
  padding-left: 8px;
  border-left: 1px solid #ebe8e2;
  margin-top: 2px;
  margin-bottom: 4px;
}
</style>
