# 自动化脚本说明

## 功能说明

本项目提供了多种自动化方式来更新导航配置和文件统计，无需手动执行 `pnpm updateNav`。

## 自动化方式

### 1. Git Pre-commit Hook（推荐）

在每次 Git 提交前自动更新导航配置。

**首次设置**：
```bash
pnpm setup:hooks
```

**工作原理**：
- 安装 Git pre-commit hook
- 每次 `git commit` 前自动执行 `pnpm updateNav`
- 自动将更新后的 `docs/index.md` 和 `config.js` 添加到暂存区

**优点**：
- ✅ 提交前自动更新，确保配置最新
- ✅ 无需记忆手动执行命令
- ✅ 适合团队协作

### 2. 开发/构建前自动更新

在运行 `dev` 或 `build` 命令前自动更新。

**使用方式**：
```bash
pnpm dev    # 开发前自动更新
pnpm build  # 构建前自动更新
```

**工作原理**：
- 使用 npm scripts 的 `pre` 钩子
- `predev` 和 `prebuild` 会在对应命令前自动执行

**优点**：
- ✅ 开发/构建时自动更新
- ✅ 无需额外操作

### 3. 文件监听模式（开发时）

实时监听文件变化，自动更新导航配置。

**使用方式**：
```bash
pnpm watch:docs
```

**工作原理**：
- 使用 `chokidar` 监听 `docs` 目录下的 `.md` 文件
- 文件变化时自动执行 `pnpm updateNav`
- 500ms 防抖，避免频繁更新

**优点**：
- ✅ 实时更新，无需手动操作
- ✅ 适合频繁修改文档的场景
- ✅ 可以单独运行，不影响其他进程

**使用场景**：
- 开发时在另一个终端运行 `pnpm watch:docs`
- 或者与 `pnpm dev` 一起运行（需要两个终端）

## 脚本说明

### generate.cjs
生成导航（nav）和侧边栏（sidebar）配置，输出到 `config.js`。

### countFiles.mjs
统计文档数量并更新 `docs/index.md` 中的文章数量。

### watch.mjs
文件监听脚本，监听文档变化并自动更新。

### setup-hooks.mjs
Git hooks 安装脚本，设置 pre-commit hook。

## 推荐工作流

### 方案 A：Git Hook（适合大多数场景）
```bash
# 1. 首次设置（只需一次）
pnpm setup:hooks

# 2. 正常开发
# 添加/修改文档后直接提交，hook 会自动更新配置
git add docs/新文章.md
git commit -m "添加新文章"
```

### 方案 B：开发时监听（适合频繁修改）
```bash
# 终端1：启动开发服务器
pnpm dev

# 终端2：启动文件监听
pnpm watch:docs

# 然后正常编辑文档，配置会自动更新
```

### 方案 C：构建前更新（最简单）
```bash
# 直接运行，构建前会自动更新
pnpm build
```

## 注意事项

1. **首次使用**：建议运行 `pnpm setup:hooks` 设置 Git hooks
2. **手动更新**：仍可使用 `pnpm updateNav` 手动更新
3. **文件冲突**：如果 `docs/index.md` 有手动修改，`countFiles.mjs` 会尽量保留你的修改
4. **性能**：文件监听模式会占用少量资源，不需要时可以关闭

