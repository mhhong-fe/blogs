<template>
  <ul class="catalog-tree">
    <li
      v-for="(node, index) in nodes"
      :key="getNodeKey(node, index)"
      class="tree-node"
    >
      <div class="node-row" :class="{ clickable: isLinkNode(node) }">
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
            v-if="isLinkNode(node)"
            class="node-dash"
            aria-hidden="true"
          ></span>
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

const onNodeClick = (node, index) => {
  if (node.path) {
    emit('navigate', node.path)
    return
  }

  if (canExpand(node)) {
    emit('toggle', getNodeKey(node, index))
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
  margin: 2px 0;
}

.node-row {
  display: flex;
  align-items: center;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.node-row.clickable:hover {
  background: var(--vp-c-bg-soft);
}

.toggle-btn,
.toggle-placeholder {
  width: 10px;
  height: 10px;
  flex: 0 0 10px;
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
  border-right: 1px solid var(--vp-c-text-2);
  border-bottom: 1px solid var(--vp-c-text-2);
  transform: rotate(-45deg);
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.toggle-btn:hover .toggle-icon {
  border-color: var(--vp-c-brand);
}

.toggle-btn.expanded .toggle-icon {
  transform: rotate(45deg);
}

.node-link {
  width: 100%;
  display: flex;
  align-items: center;
  border: none;
  background: transparent;
  color: var(--vp-c-text-1);
  cursor: pointer;
  padding: 6px 8px;
  font-size: 15px;
  line-height: 1.5;
  text-align: left;
  border-radius: 6px;
  text-decoration: none;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.node-link:hover,
.node-link:active {
  color: var(--vp-c-brand);
  text-decoration: none;
  background: transparent;
}

.node-title {
  white-space: nowrap;
}

.node-dash {
  flex: 1;
  border-bottom: 1px dashed var(--vp-c-divider);
  margin: 0 8px;
  transform: translateY(1px);
}

.catalog-tree .catalog-tree {
  margin-left: 18px;
}
</style>
