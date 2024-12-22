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
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isFile() && file.endsWith(".md")) {
            return file.replace(".md", ""); // 返回去掉扩展名的文件路径
        }

        if (stat.isDirectory()) {
            const nestedFile = getFirstFileLink(fullPath); // 递归查找子目录
            if (nestedFile) {
                return `${file}/${nestedFile}`;
            }
        }
    }

    return ""; // 如果没有找到文件，返回空字符串
}

/**
 * 生成 Sidebar 配置
 * 支持多级嵌套
 */
function generateSidebar(dirPath, basePath = "") {
    const items = [];
    const files = fs.readdirSync(dirPath);

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
 * nav进行排序
 */

function getSortedNav(navList) {
    const navOrder = [
        "前端基础",
        "Vue",
        "React",
        "跨端",
        "后端",
        "算法",
        "工具",
        "其他",
    ];

    let res = [];
    navOrder.forEach((item) => {
        navList.forEach((nav) => {
            if (nav.text === item) {
                res.push(nav);
            }
        });
    });
    return res;
}

/**
 * 生成 Nav 配置
 * 每个一级目录作为 Nav 项目，link 指向第一个文件
 */
function generateNav(baseDir) {
    const dirs = fs.readdirSync(baseDir).filter((file) => {
        const fullPath = path.join(baseDir, file);
        return fs.statSync(fullPath).isDirectory();
    });

    return dirs.map((dir) => {
        const firstFile = getFirstFileLink(path.join(baseDir, dir));
        return {
            text: dir,
            link: `/${dir}/${firstFile ? firstFile : ""}`, // 如果没有文件，则指向目录
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
            `/${navItem.text}`
        );
    });

    nav = getSortedNav(nav);

    // 将配置写入文件
    const configContent = `module.exports = ${JSON.stringify(
        { nav, sidebar },
        null,
        2
    )};\n`;

    fs.writeFileSync(outputPath, configContent, "utf8");
    console.log(`Generated config.js at ${outputPath}`);
}

generateConfig();
