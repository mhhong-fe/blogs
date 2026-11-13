import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"背景","description":"","frontmatter":{"order":1},"headers":[],"relativePath":"基础知识/移动端设备调试.md","filePath":"基础知识/移动端设备调试.md","lastUpdated":1774528707000}');
const _sfc_main = { name: "基础知识/移动端设备调试.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="背景" tabindex="-1">背景 <a class="header-anchor" href="#背景" aria-label="Permalink to &quot;背景&quot;">​</a></h1><p>开发移动端页面时，我们通常都使用谷歌浏览器上的模拟器来实现调试，但是有的场景下，模拟器和真机就是不一样，只能用手机去进行调试</p><h1 id="android设备" tabindex="-1">android设备 <a class="header-anchor" href="#android设备" aria-label="Permalink to &quot;android设备&quot;">​</a></h1><ol><li>手机上开启开发者模式，通常是设置 - 关于手机 - 连续点击版本号，会有提示，已开启开发者模式</li><li>通过数据线连接电脑，选择信任此设备(电脑和手机最好处于同一网络下)</li><li>手机上打开要调试的网页</li><li>谷歌浏览器访问：<code>chrome://inspect/#devices</code></li><li>Remote Target里会出现要用的设备，点inspect就可以开始调试了</li></ol><h1 id="ios设备" tabindex="-1">ios设备 <a class="header-anchor" href="#ios设备" aria-label="Permalink to &quot;ios设备&quot;">​</a></h1><p>ios18不支持开启开发者模式，可以通过safari连接iphone的方式开启调试</p><ol><li><p><strong>在 iPhone 上启用 Web 检查器</strong>：</p><ul><li><p>打开 <code>设置</code> 应用。</p></li><li><p>选择 <code>Safari</code>。</p></li><li><p>向下滚动并选择 <code>高级</code>。</p></li><li><p>启用 <code>Web 检查器</code>。</p></li></ul></li><li><p><strong>在 Mac 上打开 Safari</strong>：</p><ul><li><p>打开 <code>Safari</code> 浏览器。</p></li><li><p>选择菜单栏中的 <code>Safari</code> &gt; <code>偏好设置</code>。</p></li><li><p>选择 <code>高级</code> 标签。</p></li><li><p>勾选 <code>在菜单栏中显示开发菜单</code>。</p></li></ul></li><li><p><strong>连接 iPhone 到 Mac</strong>：</p><ul><li>使用 USB 数据线将 iPhone 连接到 Mac。最好处于同一网络</li></ul></li><li><p><strong>在 Safari 中打开开发菜单</strong>：</p><ul><li><p>在菜单栏中选择 <code>开发</code>。</p></li><li><p>你应该会看到连接的 iPhone 设备及其上打开的网页列表。</p></li><li><p>选择你要调试的网页。</p></li></ul></li><li><p><strong>开始调试</strong>：</p><ul><li>选择网页后，会打开一个新的开发者工具窗口，你可以在其中查看和调试 iPhone 上的网页。</li></ul></li></ol></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("基础知识/移动端设备调试.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _______ = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  _______ as default
};
