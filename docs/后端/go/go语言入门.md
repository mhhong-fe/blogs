# 为什么学习go

- 语法简洁，开发快
- 编译快
- 部署快：二进制文件，Copy部署
- 强大的标准库，网络层、系统层的库非常实用
- 简单的并发
- 想学一门非js的语言，开拓下视野



# 安装

```bash
# 先通过 brew 安装 Go，安装非常慢
brew install go

# 检查版本
go version
```

可以通过gvm来切换go版本，类似于node的nvm.

```bash
# 安装 gvm
bash < <(curl -s -S -L https://raw.githubusercontent.com/moovweb/gvm/master/binscripts/gvm-installer)

# gvm 安装指定版本的 Go
gvm install go1.20.7
gvm use go1.20.7 --default

# 删掉 brew 安装的 Go
brew uninstall go
```

写一个hello world程序

```javascript
package main

import "fmt"

func main() {
	fmt.Println("Hello，世界");
}
```

运行`go run hello_world.go`

* 配置环境变量

  ```shell
  # 查看go的安装位置
  which go 
  
  # 添加配置
  open ~/.zshrc
  
  # 在.zshrc顶部加入这一行配置
  export PATH="/opt/homebrew/bin:$PATH"
  # 重启配置
  source ~/.zshrc
  ```

* vscode安装go插件，搜索go

* vscode安装go常用工具，例如代码补全、智能提示等，这一步会安装一系列工具

  ```txt
  # 打开安装面板
  Cmd+Shift+P
  # 下载常用工具
  Go: Install/Update Tools
  ```

  



# 参考

[go中文文档](https://www.topgoer.com/)