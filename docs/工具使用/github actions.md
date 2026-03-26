# 概念



在软件开发过程中，为提高交付效率，通常都需要实现代码的自动化构建和部署，也就是实现CI/CD

* CI(Continuous Integration)，持续集成
* CD(Continuous Deployment)，持续部署

github actions是github提供的一种便捷的自动化方式，主要流程如下：

![Diagram of an event triggering Runner 1 to run Job 1, which triggers Runner 2 to run Job 2. Each of the jobs is broken into multiple steps.](https://docs.github.com/assets/cb-25535/images/help/actions/overview-actions-simple.png)

github actions主要有以下概念：

* workflows(工作流)

  * 一个工作流是一个自动化过程的集合，定义了在特定事件发生时要执行的操作。

  * `.github/workflows` 目录中，使用 YAML 文件定义

  *  `push`、`pull_request`等事件触发，也可以手动触发

    ```shell
    name: CI Workflow
    on: 
      push:
        branches:
          - main
      pull_request:
    jobs:
      build:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v3
          - run: echo "Hello, World!"
    
    ```

* event(事件)

  * 仓库事件：push`、`pull_request`、`create`、`delete
  * 外部事件：`workflow_dispatch` 或 `repository_dispatch`。
  * job，工作流中的一组步骤，每一步包含一个脚本，或者一个action，按顺序执行

* job(任务)

  * 工作流中的一个可执行单元，包含一系列步骤

    ```yaml
    jobs:
      build:
        runs-on: ubuntu-latest
        steps:
          - run: echo "Building project..."
      test:
        runs-on: ubuntu-latest
        needs: build
        steps:
          - run: echo "Running tests..."
    
    ```

* step(步骤)

  * job 中的具体操作，每个步骤会按顺序执行

  * 使用 `run` 指定脚本或命令，或者使用使用 `uses` 引用现成的 Action

    ```yaml
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      - name: Run tests
        run: npm test
    ```

* actions(动作)

  * 可复用的任务单元，可以是官方或社区开发的功能模块

  * 使用 `@版本号` 引用，例如 `actions/checkout@v3`。

  * 指定仓库的分支或标签。

    ```yaml
    - uses: actions/setup-node@v3
      with:
        node-version: 16
    ```

* runner(执行器)

  * 实际执行 Job 的机器或环境
  * GitHub 提供的运行环境是ubuntu，也可以自定义托管环境

* secrets

  * 用于存储敏感信息，如 API 密钥、令牌等

  * 存储位置：Settings > Secrets and variables > Actions

  * 使用：`secret.<name>`

    ```yaml
    steps:
      - name: Access secret
        run: echo ${{ secrets.MY_SECRET }}
    ```

* artifacts(产物)

  * 工作流运行过程中生成的文件（如构建输出、日志），可供下载和查看

  * 上传工件：`actions/upload-artifact@v3`。

  * 下载工件：`actions/download-artifact@v3`。

    ```yaml
    steps:
      - name: Build project
        run: npm run build
      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: build-output
          path: ./build/
    ```

* 环境变量

  * 用于管理环境变量和部署策略



# 语法

GitHub actions使用yaml文件编写，使用缩进表示层级关系。

以下是github actions中常见的关键字：

* name，定义工作流的名称（可选）。
* on，指定工作流的触发条件，可以是事件、定时器或手动触发
* permissions，控制读写的权限
* concurrency，并发控制，避免冲突
* jobs，任务
  * build，构建阶段工作
    * runs-on，指定工作环境
    * needs，定义依赖关系
    * outputs，输出产物
* steps，步骤
  * name，给步骤命名，便于在日志中识别
  * uses，调用现有的 GitHub Actions
  * run，执行脚本
  * with，提供参数
* env，环境变量



# 在github pages上部署博客

目标：把使用vitepress搭建的博客，部署在github pages上。github pages本身能直接部署markdown形式的博客，但是样式太丑，因此用vitepress优化一下。

## github pages使用

1. github上有一个代码仓库
2. Settings - pages - build and deployment选择Github Actions，表示要使用自定义的workflow进行部署
3. 如果部署成功，会提供一个github.io的网址，这就是你的个人博客了

![image-20241211113100551.png](https://i.imgur.com/MlHKLmO.png)



## vitepress的博客部署脚本

位置：项目根目录下.github/workflows/deploy.yml

```yaml
# 构建 VitePress 站点并将其部署到 GitHub Pages 的示例工作流程
name: Deploy VitePress site to Pages

on:
  push:
    branches: [master]

  # 支持手动触发，通过 GitHub Actions 的界面点击 Run workflow
  workflow_dispatch:

# 设置 GITHUB_TOKEN 的权限，以允许部署到 GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# 只允许同时进行一次部署，跳过正在运行和最新队列之间的运行队列
# 但是，不要取消正在进行的运行，因为我们希望允许这些生产部署完成
concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  # 构建工作
  build:
    runs-on: ubuntu-22.04  # 显式指定使用 ubuntu-22.04
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # 如果未启用 lastUpdated，则不需要
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm # 或 pnpm / yarn
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Install dependencies
        run: pnpm install
      - name: Build with VitePress
        run: pnpm build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: .vitepress/dist

  # 部署工作
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    needs: build
    runs-on: ubuntu-latest
    name: Deploy
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```



## 部署过程

代码push到master之后，就会自动触发workflow，开始构建、部署

手动触发workflow

![](https://i.imgur.com/OTOdL6P.png)

查看部署日志

![image-20241211111824341]( https://i.imgur.com/PuumL4e.png)