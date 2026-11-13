import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"element-plus中Image懒加载不生效","description":"","frontmatter":{"order":99},"headers":[],"relativePath":"Vue/问题记录.md","filePath":"Vue/问题记录.md","lastUpdated":1774528707000}');
const _sfc_main = { name: "Vue/问题记录.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="element-plus中image懒加载不生效" tabindex="-1">element-plus中Image懒加载不生效 <a class="header-anchor" href="#element-plus中image懒加载不生效" aria-label="Permalink to &quot;element-plus中Image懒加载不生效&quot;">​</a></h1><blockquote><p>可通过<code>lazy</code>开启懒加载功能， 当图片滚动到可视范围内才会加载。 可通过 <code>scroll-container</code> 来设置滚动容器， 若未定义，则为最近一个 overflow 值为 auto 或 scroll 的父元素。</p></blockquote><p><strong>视口的可视范围</strong>：视口区域，图片一在视口可视范围外</p><p><strong>容器的可视范围</strong>：容器区域，图片一在容器可视范围内，图片二在容器可视范围外</p><p>如果容器设置为overflow: scroll，容器就会作为滚动容器，图片1在视口之外，但在滚动容器的可视范围内，因此图片1不会懒加载，可能就不符合开发者的预期了。</p><p><img src="https://s2.loli.net/2025/02/14/1V2zxcFUWNfvuah.png" alt="image.png"></p><p>解决方案：</p><ol><li>方案一：去掉容器的overflow: scroll，让滚动容器重新变成body(和视口范围一样的容器)</li><li>方案二：修改容器高度，底部区域和视口底部重合</li></ol></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("Vue/问题记录.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const ____ = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  ____ as default
};
