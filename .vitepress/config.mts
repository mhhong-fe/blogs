import { defineConfig } from "vitepress";
import config from "../config";

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "My Blogs",
    description: "A VitePress Site",
    srcDir: "./docs",
    lastUpdated: true,
    themeConfig: {
        outline: [1, 4],
        nav: config.nav,
        sidebar: config.sidebar,
        search: {
            provider: "local",
        },
        socialLinks: [
            { icon: "github", link: "https://github.com/vuejs/vitepress" },
        ],
    },
});
