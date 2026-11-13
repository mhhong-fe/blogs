import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"","description":"","frontmatter":{"order":1},"headers":[],"relativePath":"工程化/TODO.md","filePath":"工程化/TODO.md","lastUpdated":1774528707000}');
const _sfc_main = { name: "工程化/TODO.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><ul><li>性能监控</li><li>性能优化</li><li>错误监控</li><li>部署</li><li>埋点</li><li>问题排查</li><li>产物上传到cdn</li></ul></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("工程化/TODO.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const TODO = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  TODO as default
};
