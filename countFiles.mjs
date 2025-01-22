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

countFiles("./docs").then((count) => {
    // 去掉index.md
    console.log(count - 1);
    let articleCount = count - 1;
    let content = `---
# https://vitepress.dev/reference/default-theme-home-page

layout: home

hero:
  name: "个人博客"
  # text: "A VitePress Site"
  tagline: 记录编程、读书的学习笔记
  actions:
    - theme: brand
      text: Get Started
      link: /前端基础/Css/css踩坑记录.md

features:
  - title: Feature A
    details: 文章数量 ${articleCount}
  - title: Feature B
    details: 使用vitePress与markdown搭建的ssg网站
  - title: Feature C
    details: 使用github pages进行部署
---`;

    fsPromises.writeFile("./docs/index.md", content);
});
