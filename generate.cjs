const fs = require("fs");
const path = require("path");

const docsPath = path.resolve(__dirname, "./docs"); // 文档根目录
const outputPath = path.resolve(__dirname, "./config.js"); // 输出配置文件路径

/**
 * 获取目录下的第一个文件路径
 * @param {string} dirPath - 目录路径
 * @returns {string} 第一个文件的相对路径（基于文档目录）
 */
function getFirstFileLink(dirPath) {
    const files = fs.readdirSync(dirPath).sort((a, b) => {
        const fullA = path.join(dirPath, a);
        const fullB = path.join(dirPath, b);
        const isADir = fs.statSync(fullA).isDirectory();
        const isBDir = fs.statSync(fullB).isDirectory();
        if (isADir || isBDir) return 0;
        return parseOrder(fullA) - parseOrder(fullB);
    });

    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isFile() && file.endsWith(".md")) {
            return file.replace(".md", "");
        }

        if (stat.isDirectory()) {
            const nestedFile = getFirstFileLink(fullPath);
            if (nestedFile) {
                return `${file}/${nestedFile}`;
            }
        }
    }

    return "";
}

/**
 * 读取 markdown 文件 frontmatter 中的 order 字段
 * 没有 order 则返回 Infinity，排到末尾
 */
function parseOrder(filePath) {
    const content = fs.readFileSync(filePath, "utf8");
    const match = content.match(/^---[\s\S]*?order:\s*(\d+)[\s\S]*?---/);
    return match ? parseInt(match[1]) : Infinity;
}

/**
 * 生成 Sidebar 配置
 * 支持多级嵌套，按 frontmatter order 字段排序
 */
function generateSidebar(dirPath, basePath = "") {
    const items = [];
    const files = fs.readdirSync(dirPath).sort((a, b) => {
        const fullA = path.join(dirPath, a);
        const fullB = path.join(dirPath, b);
        const isADir = fs.statSync(fullA).isDirectory();
        const isBDir = fs.statSync(fullB).isDirectory();
        // 目录保持原有顺序，只对 md 文件排序
        if (isADir || isBDir) return 0;
        return parseOrder(fullA) - parseOrder(fullB);
    });

    files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // 递归处理子目录
            items.push({
                text: file,
                collapsed: true,
                items: generateSidebar(fullPath, `${basePath}/${file}`),
            });
        } else if (file.endsWith(".md") && file !== "index.md") {
            // 处理 Markdown 文件
            items.push({
                text: path.basename(file, ".md"),
                link: `${basePath}/${file.replace(".md", "")}`,
            });
        }
    });

    return items;
}

/**
 * 读取分类目录 index.md 中的 order 字段
 * 没有 index.md 或没有 order 则返回 Infinity，排到末尾
 */
function parseDirOrder(dirPath) {
    const indexFile = path.join(dirPath, "index.md");
    if (!fs.existsSync(indexFile)) return Infinity;
    return parseOrder(indexFile);
}

/**
 * 生成 Nav 配置
 * 每个一级目录作为 Nav 项目，link 指向第一个文件，按 index.md order 排序
 */
function generateNav(baseDir) {
    const dirs = fs.readdirSync(baseDir)
        .filter((file) => {
            const fullPath = path.join(baseDir, file);
            return fs.statSync(fullPath).isDirectory();
        })
        .sort((a, b) => {
            return parseDirOrder(path.join(baseDir, a)) - parseDirOrder(path.join(baseDir, b));
        });

    return dirs.map((dir) => {
        const firstFile = getFirstFileLink(path.join(baseDir, dir));
        return {
            text: dir,
            link: `/${dir}/${firstFile ? firstFile : ""}`,
        };
    });
}

/**
 * 主函数
 */
function generateConfig() {
    let nav = generateNav(docsPath); // 动态生成导航
    const sidebar = {};

    nav.forEach((navItem) => {
        const dirPath = path.join(docsPath, navItem.text);
        sidebar[`/${navItem.text}/`] = generateSidebar(
            dirPath,
            `/${navItem.text}`,
        );
    });

    // 将配置写入文件
    const configContent = `module.exports = ${JSON.stringify(
        { nav, sidebar },
        null,
        2,
    )};\n`;

    fs.writeFileSync(outputPath, configContent, "utf8");
    console.log(`Generated config.js at ${outputPath}`);
}

generateConfig();
