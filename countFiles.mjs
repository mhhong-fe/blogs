import fsPromises from "fs/promises";

async function countFiles(path) {
    let count = 0;
    let files = await fsPromises.readdir(path, { withFileTypes: true });
    for (const file of files) {
        if (file.isFile()) {
            console.log(file.name);
            if (file.name.endsWith(".md")) {
                count++;
            }
        } else {
            count += await countFiles(`${path}/${file.name}`);
        }
    }

    return count;
}

import { readFile } from "fs/promises";

countFiles("./docs").then(async (count) => {
    // 去掉index.md
    const articleCount = count - 1;
    console.log(`📊 文章总数: ${articleCount}`);

    // 读取现有的 index.md，保留用户自定义的内容
    let existingContent = "";
    try {
        existingContent = await readFile("./docs/index.md", "utf8");
    } catch (error) {
        // 如果文件不存在，使用默认内容
        existingContent = `---
layout: home

hero:
  name: "个人技术博客"
  text: "记录编程路上的学习与思考"
  actions:
    - theme: brand
      text: 开始阅读
      link: /前端基础/Css/css踩坑记录.md
    - theme: alt
      text: 查看源码
      link: https://github.com/mhhong-fe/blogs

features:
  - icon: 🎨
    title: 前端基础
    details: 深入理解 CSS、JavaScript 等前端基础知识
  - icon: ⚡
    title: Vue 原理剖析
    details: 深入分析 Vue 框架的核心原理
  - icon: 🧮
    title: 算法学习
    details: 记录算法学习过程中的思路与解法
---`;
    }

    // 只更新文章数量，保留其他内容
    // 如果 features 中有文章数量相关的项，更新它
    const updatedContent = existingContent.replace(
        /(details:\s*)(文章数量\s*)\d+/,
        `$1$2${articleCount}`
    );

    // 如果没有找到文章数量，在第一个 feature 中添加
    let finalContent = updatedContent;
    if (!updatedContent.includes("文章数量")) {
        finalContent = existingContent.replace(
            /(features:\s*\n\s*-\s+icon:.*\n\s+title:.*\n\s+details:)(.*)/,
            `$1 文章数量 ${articleCount}`
        );
    }

    await fsPromises.writeFile("./docs/index.md", finalContent, "utf8");
    console.log("✅ 已更新 docs/index.md");
});
