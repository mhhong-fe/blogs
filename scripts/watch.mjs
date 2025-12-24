import chokidar from "chokidar";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// 监听 docs 目录下的 .md 文件变化
const watcher = chokidar.watch("./docs/**/*.md", {
    ignored: /node_modules/,
    persistent: true,
    ignoreInitial: true,
});

let updateTimer = null;

// 防抖函数，避免频繁执行
function debounceUpdate() {
    if (updateTimer) {
        clearTimeout(updateTimer);
    }

    updateTimer = setTimeout(async () => {
        console.log("📝 检测到文档变化，正在更新导航...");
        try {
            await execAsync("pnpm updateNav");
            console.log("✅ 导航更新完成");
        } catch (error) {
            console.error("❌ 更新导航失败:", error.message);
        }
    }, 500); // 500ms 防抖
}

watcher
    .on("add", (path) => {
        console.log(`📄 新增文件: ${path}`);
        debounceUpdate();
    })
    .on("change", (path) => {
        console.log(`✏️  修改文件: ${path}`);
        debounceUpdate();
    })
    .on("unlink", (path) => {
        console.log(`🗑️  删除文件: ${path}`);
        debounceUpdate();
    })
    .on("addDir", (path) => {
        console.log(`📁 新增目录: ${path}`);
        debounceUpdate();
    })
    .on("unlinkDir", (path) => {
        console.log(`🗑️  删除目录: ${path}`);
        debounceUpdate();
    })
    .on("error", (error) => {
        console.error("❌ 监听错误:", error);
    })
    .on("ready", () => {
        console.log("👀 开始监听 docs 目录变化...");
        console.log("💡 提示: 文件变化时会自动更新导航配置");
    });

// 优雅退出
process.on("SIGINT", () => {
    console.log("\n👋 停止监听");
    watcher.close();
    process.exit(0);
});
