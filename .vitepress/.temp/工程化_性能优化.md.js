import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"参考","description":"","frontmatter":{"order":2},"headers":[],"relativePath":"工程化/性能优化.md","filePath":"工程化/性能优化.md","lastUpdated":1774528707000}');
const _sfc_main = { name: "工程化/性能优化.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="参考" tabindex="-1">参考 <a class="header-anchor" href="#参考" aria-label="Permalink to &quot;参考&quot;">​</a></h1><p><a href="https://juejin.cn/post/7468655596641976320" target="_blank" rel="noreferrer">性能优化</a></p><h1 id="性能排查" tabindex="-1">性能排查 <a class="header-anchor" href="#性能排查" aria-label="Permalink to &quot;性能排查&quot;">​</a></h1><p>使用performance可以查看一个动作触发了哪些代码，这些代码分别消耗了多少时间</p><h1 id="性能监测" tabindex="-1">性能监测 <a class="header-anchor" href="#性能监测" aria-label="Permalink to &quot;性能监测&quot;">​</a></h1><ul><li>performance.timing</li><li>performanceObserver</li><li>web-vital</li><li>sdk</li></ul><h1 id="object-freeze" tabindex="-1">Object.freeze <a class="header-anchor" href="#object-freeze" aria-label="Permalink to &quot;Object.freeze&quot;">​</a></h1><p>冻结一个对象，vue2会遍历给一个对象设置响应式，如果这个对象属性非常多，这个过程会非常消耗时间，使用Object.freeze可以跳过这个过程</p><h1 id="图片懒加载" tabindex="-1">图片懒加载 <a class="header-anchor" href="#图片懒加载" aria-label="Permalink to &quot;图片懒加载&quot;">​</a></h1><p>intersectionObserver</p><h1 id="无限滚动" tabindex="-1">无限滚动 <a class="header-anchor" href="#无限滚动" aria-label="Permalink to &quot;无限滚动&quot;">​</a></h1><ul><li>intersectionObserver</li><li>element-plus的v-infinite-scroll</li></ul><h1 id="图片格式" tabindex="-1">图片格式 <a class="header-anchor" href="#图片格式" aria-label="Permalink to &quot;图片格式&quot;">​</a></h1><p>webp</p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("工程化/性能优化.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const ____ = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  ____ as default
};
