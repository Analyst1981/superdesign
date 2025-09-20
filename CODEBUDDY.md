# SuperDesign VS Code Extension - CodeBuddy 开发指南

## 项目概述

SuperDesign 是一个 VS Code 扩展，提供 AI 驱动的设计代理功能，支持生成 UI 模型、组件和线框图。该扩展集成了多种 AI 模型提供商，包括 Claude、OpenAI 和多个中文 AI 模型。

## 核心架构

### 主要组件
- **Extension Entry** (`src/extension.ts`): 扩展主入口，处理激活、命令注册和消息路由
- **Chat Sidebar Provider** (`src/providers/chatSidebarProvider.ts`): 聊天侧边栏的 WebView 提供者
- **Custom Agent Service** (`src/services/customAgentService.ts`): AI 代理服务核心
- **Claude Code Service** (`src/services/claudeCodeService.ts`): Claude Code 集成服务
- **Tools System** (`src/tools/`): 文件操作工具集合（读写、编辑、搜索等）

### 关键目录结构
```
src/
├── core/           # 核心配置和提供者
├── services/       # AI 服务和消息处理
├── providers/      # WebView 提供者
├── tools/          # 文件操作工具
├── webview/        # WebView 组件
├── types/          # TypeScript 类型定义
└── utils/          # 工具函数
```

## 开发命令

### 构建和编译
```bash
# 编译项目（包含类型检查和 lint）
npm run compile

# 监听模式编译
npm run watch

# 生产构建
npm run package

# 仅类型检查
npm run check-types
```

### 代码质量
```bash
# 运行 ESLint
npm run lint

# 编译测试
npm run compile-tests

# 监听测试编译
npm run watch-tests
```

### 测试
```bash
# 运行所有测试
npm run test

# 运行特定测试套件
npm run test:llm          # LLM 服务测试
npm run test:core         # 核心组件测试
npm run test:tools        # 工具测试
npm run test:agent        # 代理测试
```

## AI 模型配置

### 支持的提供商
- **Claude API**: Anthropic 官方 API
- **Claude Code**: 本地 Claude 二进制文件
- **OpenAI**: GPT 模型
- **OpenRouter**: 多模型路由服务
- **中文模型**: ModelScope、DeepSeek、Kimi、GLM、智谱 AI、通义千问、豆包

### 配置方式
通过 VS Code 设置或命令面板配置 API 密钥：
- `Ctrl+Shift+P` → `SuperDesign: Configure [Provider] API Key`

## 设计工作流

### 自动化设计流程
1. **布局设计**: ASCII 线框图规划
2. **主题设计**: 使用 `generateTheme` 工具生成 CSS 主题
3. **动画设计**: 定义交互和过渡效果
4. **HTML 生成**: 创建完整的设计文件

### 设计文件存储
- 设计迭代保存在 `.superdesign/design_iterations/` 目录
- 支持 HTML、CSS 和 SVG 格式
- 自动版本控制（如 `ui_1.html`, `ui_1_1.html`）

## 工具系统

### 核心工具
- **read-tool**: 读取文件内容
- **write-tool**: 写入文件
- **edit-tool**: 编辑现有文件
- **multiedit-tool**: 批量编辑操作
- **grep-tool**: 文本搜索
- **glob-tool**: 文件模式匹配
- **ls-tool**: 目录列表
- **bash-tool**: Shell 命令执行
- **theme-tool**: 主题生成

### 工具使用原则
- 所有设计文件必须通过工具调用创建，不能仅输出文本
- 遵循 `.superdesign/design_iterations/` 目录结构
- 使用描述性文件命名约定

## 项目初始化

### 自动初始化功能
运行 `SuperDesign: Initialize Superdesign` 命令会：
1. 创建 `.superdesign/design_iterations/` 目录
2. 生成默认 UI 框架 CSS (`default_ui_darkmode.css`)
3. 在 `.cursor/rules/design.mdc` 中添加设计规则
4. 在 `CLAUDE.md` 中添加设计指令
5. 在 `.windsurfrules` 中添加 Windsurf 规则

## 开发注意事项

### 代码规范
- 使用 TypeScript 严格模式
- 遵循 ESLint 配置规则
- React JSX 语法支持
- 模块化架构设计

### WebView 通信
- 扩展与 WebView 通过消息系统通信
- 支持双向数据传递
- 处理文件上传和图像转换

### 文件操作
- 支持工作区文件读写
- 自动创建目录结构
- 处理相对和绝对路径

### 多语言支持
- 主要支持中文界面
- 集成多个中文 AI 模型
- 本地化配置选项

## 扩展特性

### Canvas 视图
- 独立的设计预览面板
- 实时设计文件监听
- 与聊天侧边栏联动

### 图像处理
- 支持多种图像格式（PNG、JPG、WebP 等）
- 自动 Base64 转换
- Moodboard 图像管理

### 主题系统
- 内置暗色模式框架
- Neo-brutalism 和现代设计风格
- 响应式设计支持
- CSS 变量系统

## 调试和日志

### 日志系统
- 集中式日志管理 (`src/services/logger.ts`)
- 支持不同日志级别
- VS Code 输出面板集成

### 开发调试
- 使用 VS Code 调试配置
- WebView 开发者工具支持
- 错误处理和用户反馈机制