# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用开发命令

### 构建和编译
```bash
# 开发模式构建（包含类型检查和代码检查）
npm run compile

# 监听模式构建
npm run watch

# 生产环境构建
npm run package
```

### 代码质量检查
```bash
# 类型检查
npm run check-types

# ESLint 代码检查
npm run lint

# 完整编译流程（类型检查 + 代码检查 + 构建）
npm run compile
```

### 测试
```bash
# 所有测试
npm test

# LLM 服务测试
npm run test:llm

# 核心组件测试
npm run test:core

# 工具类测试
npm run test:tools

# 代理服务测试
npm run test:agent
```

### 开发服务器
```bash
# 启动开发服务器（监听文件变化）
npm run watch
```

## 项目架构概述

SuperDesign 是一个 VS Code 扩展，提供了AI设计代理功能，支持多种大语言模型（包括中国的AI模型）。

### 核心架构组件

#### 1. 扩展入口点
- **`src/extension.ts`**: 主扩展文件，包含所有命令注册和核心功能
- **功能**: API密钥配置、侧边栏管理、画布视图、项目初始化

#### 2. LLM 提供商系统
- **`src/providers/llmProviderFactory.ts`**: LLM提供商工厂类，单例模式管理多种AI模型
- **支持的模型**:
  - Claude API (Anthropic)
  - Claude Code (本地二进制)
  - ModelScope (魔搭社区)
  - DeepSeek
  - Kimi (Moonshot AI)
  - GLM (智谱AI)
  - Zhipu AI
  - Qwen (通义千问)
  - Doubao (豆包)

#### 3. 聊天和UI系统
- **`src/providers/chatSidebarProvider.ts`**: 侧边栏聊天视图提供商
- **`src/webview/`**: React前端应用，包含聊天界面和画布功能
- **`src/templates/webviewTemplate.ts`**: WebView HTML模板生成器

#### 4. 服务层
- **`src/services/customAgentService.ts`**: 自定义代理服务
- **`src/services/chatMessageService.ts`**: 聊天消息处理服务
- **`src/services/claudeCodeService.ts`**: Claude Code集成服务
- **`src/services/logger.ts`**: 集中式日志服务

#### 5. 工具系统
- **`src/tools/`**: 包含各种文件操作工具（read, write, edit, bash等）
- **`src/tools/tool-utils.ts`**: 工具通用功能

#### 6. 类型定义
- **`src/types/agent.ts`**: 代理相关类型
- **`src/types/context.ts`**: 上下文相关类型

### 项目目录结构

```
src/
├── extension.ts              # 主扩展入口
├── providers/                # LLM提供商
│   ├── llmProviderFactory.ts
│   ├── chatSidebarProvider.ts
│   └── [各种模型提供商]
├── services/                 # 业务服务
│   ├── customAgentService.ts
│   ├── chatMessageService.ts
│   └── ...
├── tools/                    # 文件操作工具
├── webview/                  # React前端应用
│   ├── components/           # UI组件
│   ├── hooks/               # React Hooks
│   └── utils/               # 工具函数
├── templates/               # 模板文件
└── types/                    # TypeScript类型定义
```

### 关键特性

#### 1. 多LLM支持
项目采用工厂模式管理多种LLM提供商，通过配置可以轻松切换不同的AI模型。

#### 2. WebView集成
使用React构建的WebView界面，提供聊天、画布和设置功能。

#### 3. 文件系统监控
自动监控`.superdesign/design_iterations/`目录中的设计文件变化。

#### 4. 中国AI模型支持
特别优化了对中国AI模型的支持，包括ModelScope、DeepSeek、Kimi、GLM等。

### 配置系统

#### VS Code设置
所有配置通过`superdesign.`前缀的VS Code设置管理：
- `superdesign.llmProvider`: 选择LLM提供商
- `superdesign.anthropicApiKey`: Anthropic API密钥
- `superdesign.modelScopeApiKey`: ModelScope API密钥
- [其他模型配置...]

#### 项目初始化
运行`superdesign.initializeProject`命令会创建：
- `.superdesign/` 目录结构
- `.cursor/rules/design.mdc` 文件
- 默认设计规则和样式文件

### 开发注意事项

#### 1. 代码规范
- 使用TypeScript严格模式
- 遵循ESLint规则
- 函数和组件必须有详细的JSDoc注释

#### 2. 文件命名
- 设计文件保存在`.superdesign/design_iterations/`目录
- 文件命名格式：`{design_name}_{n}.html`或`{current_file_name}_{n}.html`

#### 3. 错误处理
- 使用集中的日志服务（Logger）
- 所有异步操作都需要适当的错误处理
- 向用户显示友好的错误消息

#### 4. 安全考虑
- API密钥通过VS Code配置管理，不硬编码
- WebView内容安全策略（CSP）严格限制
- 文件操作需要适当的权限检查

### 构建和部署

#### 开发环境
```bash
npm install
npm run watch
```

#### 生产构建
```bash
npm run package
```

#### VSIX打包
使用vsce工具打包扩展：
```bash
npx vsce package
```

### 调试技巧

#### 1. 输出面板
- 查看Superdesign输出面板了解扩展日志
- 使用`Logger.info()`, `Logger.error()`等记录信息

#### 2. 开发者工具
- WebView可以通过右键打开开发者工具
- 使用React Developer Tools调试前端

#### 3. 断点调试
- 在VS Code中设置断点调试扩展代码
- 使用F5启动调试模式

### 扩展开发指南

#### 添加新的LLM提供商
1. 在`src/providers/`创建新的提供商类
2. 继承`LLMProvider`基类
3. 在`llmProviderFactory.ts`中注册新提供商
4. 更新package.json中的配置选项

#### 添加新工具
1. 在`src/tools/`中创建新的工具类
2. 实现必要的接口和方法
3. 在适当的服务中集成新工具

#### 修改UI组件
- WebView使用React构建，组件在`src/webview/components/`中
- 修改后需要重新构建webview.js文件

### 测试策略

#### 单元测试
- 主要测试工具类和服务类
- 测试文件在`src/test/`目录

#### 集成测试
- 测试LLM提供商集成
- 测试文件系统操作

#### E2E测试
- 使用VS Code测试框架
- 测试完整的用户工作流