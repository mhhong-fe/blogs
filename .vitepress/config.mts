import { defineConfig } from "vitepress";
import config from "../config";

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "前端工程实践手记",
    description: "记录编程路上的学习与思考",
    base: "/blogs/",
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
            { icon: "github", link: "https://github.com/mhhong-fe/blogs" },
        ],
    },
});
