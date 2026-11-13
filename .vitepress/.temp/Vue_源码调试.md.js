import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"调试准备","description":"","frontmatter":{"order":14},"headers":[],"relativePath":"Vue/源码调试.md","filePath":"Vue/源码调试.md","lastUpdated":1774598995000}');
const _sfc_main = { name: "Vue/源码调试.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="调试准备" tabindex="-1">调试准备 <a class="header-anchor" href="#调试准备" aria-label="Permalink to &quot;调试准备&quot;">​</a></h1><p>仓库地址：<a href="https://github.com/vuejs/core" target="_blank" rel="noreferrer">vue-core</a></p><p>使用对应版本的pnpm进行安装 <img src="https://cdn.polyspeak.ai/speakmaster/6d3ee0bab378748c4873c5f9ef1444cd.webp" alt="image.png"></p><p>pnpm install，安装完成 执行pnpm dev，显示： <img src="https://cdn.polyspeak.ai/speakmaster/7597e4f3e01b99fa532a59dad6cadc30.webp" alt="image.png"></p><p>packages/vue下面生成了dist文件，接下来我们就可以运行examples下的demo进行调试了 <img src="https://cdn.polyspeak.ai/speakmaster/76f7ba080e3c26775e0bbec2c1082b6e.webp" alt="image.png"></p><p>compositon下的是vue3的组合是api，用live server运行grid.html <img src="https://cdn.polyspeak.ai/speakmaster/ebdad8b70ef3b18e678a1559ebe1f4fc.webp" alt="image.png"></p><p>现在就可以进行调试了</p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("Vue/源码调试.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const ____ = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  ____ as default
};
