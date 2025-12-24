#!/usr/bin/env node
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const hooksDir = path.join(rootDir, ".git", "hooks");

// 创建 pre-commit hook
const preCommitHook = `#!/bin/sh
# 自动更新导航和文件统计
cd "${rootDir}"
pnpm updateNav

# 将更新后的文件添加到暂存区
git add docs/index.md config.js
`;

const preCommitPath = path.join(hooksDir, "pre-commit");

try {
    // 确保 .git/hooks 目录存在
    if (!fs.existsSync(hooksDir)) {
        console.error("❌ .git/hooks 目录不存在，请确保已初始化 Git 仓库");
        process.exit(1);
    }

    // 写入 pre-commit hook
    fs.writeFileSync(preCommitPath, preCommitHook, "utf8");

    // 添加执行权限
    if (process.platform !== "win32") {
        execSync(`chmod +x "${preCommitPath}"`);
    }

    console.log("✅ Git hooks 设置成功！");
    console.log("📝 pre-commit hook 已安装，提交前会自动更新导航");
} catch (error) {
    console.error("❌ 设置 Git hooks 失败:", error.message);
    process.exit(1);
}
