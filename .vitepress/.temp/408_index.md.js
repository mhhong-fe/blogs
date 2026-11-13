import { useSSRContext, unref } from "vue";
import { ssrRenderAttrs, ssrRenderAttr } from "vue/server-renderer";
import { w as withBase } from "./Content.-NX8oIAA.js";
const __pageData = JSON.parse('{"title":"408 学习笔记","description":"","frontmatter":{"order":10},"headers":[],"relativePath":"408/index.md","filePath":"408/index.md","lastUpdated":null}');
const __default__ = { name: "408/index.md" };
const _sfc_main = /* @__PURE__ */ Object.assign(__default__, {
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="_408-学习笔记" tabindex="-1">408 学习笔记 <a class="header-anchor" href="#_408-学习笔记" aria-label="Permalink to &quot;408 学习笔记&quot;">​</a></h1><a${ssrRenderAttr("href", unref(withBase)("/408/external-sort.html"))} target="_blank" rel="noopener"> 外部排序交互教材 ↗ </a><p>通过交互演示学习多路归并、败者树、置换—选择排序和最佳归并树。</p></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("408/index.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  __pageData,
  _sfc_main as default
};
