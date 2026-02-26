# Git Log Generator Plugin for Obsidian

## 功能介绍

Git Log Generator是一个Obsidian插件，依赖Git插件和Copilot插件，使用Copilot插件的大模型能力，分析Git文件差异，自动生成提交日志，并填充到Git的提交消息中。

### 核心功能

- **Git差异分析**：检测当前Obsidian仓库的Git文件变更，分析文件的增删改操作和具体内容变化
- **智能日志生成**：调用Copilot插件的大模型API，基于文件差异内容生成有意义的提交日志，支持中文和英文两种语言
- **提交消息填充**：将生成的日志自动填充到Git提交消息输入框，支持用户编辑和调整生成的日志内容
- **操作流程优化**：提供快捷命令触发日志生成，集成到Obsidian的命令面板，支持通过快捷键触发

### 辅助功能

- **配置选项**：日志语言设置（中文/英文）、日志格式模板选择、生成策略调整（详细/简洁）
- **历史记录**：保存最近生成的日志记录，支持快速重用历史日志
- **错误处理**：处理Git仓库未初始化的情况、Copilot插件未安装的情况，提供友好的错误提示

## 安装方法

### 前置条件

- 安装Obsidian 1.5.0或更高版本
- 安装Git插件 2.20.0或更高版本
- 安装Copilot插件 1.5.0或更高版本
- 配置Copilot插件的API访问权限

### 安装步骤

1. 下载插件的最新版本
2. 在Obsidian中打开设置 → 插件 → 社区插件
3. 关闭安全模式
4. 点击"从文件安装插件"，选择下载的插件文件
5. 启用插件

### Release 资产说明

- 本项目在 GitHub Release 发布时会自动上传以下安装文件：
	- `main.js`
	- `manifest.json`
	- `styles.css`
- 对于 Obsidian 插件安装（含 BRAT），请优先使用以上 3 个资产文件。
- GitHub 默认的 `Source code (zip/tar.gz)` 是源码包，由 GitHub 自动生成，不能关闭；它不是插件安装包。

### 自动发版（Tag）

- 本项目已配置工作流：推送语义化版本标签时自动创建 Release 并上传插件资产。
- 标签格式：`v*.*.*`（例如：`v1.0.1`）。
- 示例命令：
	- `git tag v1.0.1`
	- `git push origin v1.0.1`

### Windows 本地开发环境修复

当你遇到以下问题时可使用一键修复：

- `uv` 命令找不到
- PowerShell 中 `npm` 因执行策略被拦截
- `node` / `npm` 已安装但 PATH 未生效

在项目根目录执行：

- `npm run doctor:win`

脚本会自动完成：

- 设置 `CurrentUser` 作用域执行策略为 `RemoteSigned`
- 尝试修复 `uv` 的用户 PATH
- 尝试修复 `node` 的用户 PATH
- 验证 `uv` / `node` / `npm` 可用性

脚本完成后，建议重开一个 PowerShell 终端。

## 使用方法

### 生成Git提交日志

1. 在Obsidian中，使用快捷键 `Ctrl+Shift+G`（Windows/Linux）或 `Cmd+Shift+G`（macOS）
2. 或者，打开命令面板（Ctrl+P），搜索并选择"Generate Git Commit Log"
3. 插件会自动分析Git文件变更，并使用Copilot生成提交日志
4. 生成的日志会被复制到剪贴板，同时显示通知

### 生成并填充Git提交消息

1. 打开命令面板（Ctrl+P），搜索并选择"Generate Git Commit Log and Fill"
2. 插件会自动分析Git文件变更，生成提交日志，并尝试填充到Git提交消息框
3. 如果填充失败，日志会被复制到剪贴板作为 fallback

## 配置选项

在Obsidian设置 → 插件 → Git Log中，您可以配置以下选项：

- **Language**：选择生成日志的语言（中文/英文）
- **Log Template**：选择日志格式模板（默认/简洁/详细）
- **Generation Strategy**：选择日志生成策略（详细/简洁）
- **History Count**：设置保存的历史日志数量
- **Keyboard Shortcut**：设置生成日志的快捷键

## 技术原理

1. **Git差异分析**：使用Git插件的API获取文件变更信息，解析Git diff输出，提取变更内容
2. **智能日志生成**：构建有效的提示词（Prompt），调用Copilot插件的生成API，处理API响应和错误
3. **提交消息填充**：尝试与Git插件的提交UI交互，将生成的日志填充到提交消息框
4. **性能优化**：异步处理文件差异分析，缓存大模型响应，避免阻塞Obsidian主线程

## 常见问题

### 插件无法生成日志

- 检查Git插件是否已安装并启用
- 检查Copilot插件是否已安装并启用
- 检查当前Vault是否是Git仓库
- 检查Copilot插件的API访问权限是否已配置

### 生成的日志质量不佳

- 尝试调整生成策略为"详细"
- 确保Git文件变更有足够的内容供Copilot分析
- 检查Copilot插件的模型设置

## 后续扩展

- 支持自定义日志模板
- 集成更多大模型选项
- 支持批量提交和日志生成
- 支持分支管理和合并请求的日志生成

## 贡献

欢迎提交Issue和Pull Request来改进这个插件！

## 许可证

MIT License