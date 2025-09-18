# 中国大模型接入指南

## 概述

SuperDesign VS Code扩展现已支持四个主流的中国大模型提供者，为中国用户提供更好的AI编程体验。本指南将详细介绍如何配置和使用这些模型。

## 支持的中国大模型

### 1. ModelScope (魔搭社区)
- **提供商**: 阿里云
- **主要模型**: Qwen系列 (通义千问)
- **特点**: 
  - 强大的中文理解能力
  - 支持代码生成和分析
  - 多模态能力
- **官网**: https://modelscope.cn/
- **API文档**: https://dashscope.aliyuncs.com/

### 2. DeepSeek
- **提供商**: 深度求索
- **主要模型**: DeepSeek-Chat, DeepSeek-Coder, DeepSeek-Reasoner
- **特点**:
  - 专业的代码生成能力
  - 强大的推理能力
  - 支持长上下文
- **官网**: https://www.deepseek.com/
- **API文档**: https://api-docs.deepseek.com/

### 3. Kimi (Moonshot AI)
- **提供商**: 月之暗面
- **主要模型**: Moonshot系列
- **特点**:
  - 超长文本处理能力 (200万字)
  - 优秀的中文对话体验
  - 强大的文档理解能力
- **官网**: https://kimi.moonshot.cn/
- **API文档**: https://platform.moonshot.cn/docs

### 4. GLM (智谱AI)
- **提供商**: 智谱AI
- **主要模型**: GLM-4系列
- **特点**:
  - 多模态理解能力
  - 强大的中文生成能力
  - 支持函数调用
- **官网**: https://www.zhipuai.cn/
- **API文档**: https://open.bigmodel.cn/dev/api

## 配置步骤

### 第一步：获取API密钥

#### ModelScope API密钥
1. 访问 [ModelScope控制台](https://modelscope.cn/my/myaccesstoken)
2. 登录您的账户
3. 创建新的API Token
4. 复制生成的API密钥

#### DeepSeek API密钥
1. 访问 [DeepSeek平台](https://platform.deepseek.com/api_keys)
2. 注册并登录账户
3. 在API Keys页面创建新密钥
4. 复制生成的API密钥

#### Kimi API密钥
1. 访问 [Moonshot AI平台](https://platform.moonshot.cn/console/api-keys)
2. 注册并登录账户
3. 创建新的API密钥
4. 复制生成的API密钥

#### GLM API密钥
1. 访问 [智谱AI开放平台](https://open.bigmodel.cn/usercenter/apikeys)
2. 注册并登录账户
3. 创建新的API密钥
4. 复制生成的API密钥

### 第二步：在VS Code中配置API密钥

#### 方法一：通过命令面板配置
1. 打开VS Code
2. 按 `Ctrl+Shift+P` (Windows/Linux) 或 `Cmd+Shift+P` (Mac) 打开命令面板
3. 输入并选择相应的配置命令：
   - `Configure ModelScope API Key` - 配置ModelScope API密钥
   - `Configure DeepSeek API Key` - 配置DeepSeek API密钥
   - `Configure Kimi API Key` - 配置Kimi API密钥
   - `Configure GLM API Key` - 配置GLM API密钥
4. 在弹出的输入框中粘贴您的API密钥
5. 按回车确认

#### 方法二：通过设置界面配置
1. 打开VS Code设置 (`Ctrl+,`)
2. 搜索 "superdesign"
3. 找到相应的API密钥设置项：
   - `Superdesign: ModelScope API Key`
   - `Superdesign: DeepSeek API Key`
   - `Superdesign: Kimi API Key`
   - `Superdesign: GLM API Key`
4. 输入您的API密钥并保存

### 第三步：选择和使用模型

1. 打开SuperDesign聊天界面
2. 在模型选择器中选择您想要使用的中国大模型：
   - **ModelScope**: 选择Qwen系列模型
   - **DeepSeek**: 选择DeepSeek-Chat、DeepSeek-Coder或DeepSeek-Reasoner
   - **Kimi**: 选择Moonshot系列模型
   - **GLM**: 选择GLM-4系列模型
3. 开始与AI助手对话

## 使用建议

### ModelScope (Qwen) 最佳实践
- **适用场景**: 中文内容生成、代码解释、多模态任务
- **提示词建议**: 使用中文提示词可获得更好效果
- **模型选择**: 
  - `qwen-turbo`: 快速响应，适合简单任务
  - `qwen-plus`: 平衡性能和质量
  - `qwen-max`: 最高质量，适合复杂任务

### DeepSeek 最佳实践
- **适用场景**: 代码生成、算法设计、技术问题解答
- **提示词建议**: 详细描述需求，包含具体的技术栈信息
- **模型选择**:
  - `deepseek-chat`: 通用对话
  - `deepseek-coder`: 专业代码生成
  - `deepseek-reasoner`: 复杂推理任务

### Kimi 最佳实践
- **适用场景**: 长文档分析、文献阅读、详细报告生成
- **提示词建议**: 可以提供大量上下文信息
- **特色功能**: 支持超长文本输入，适合处理大型文档

### GLM 最佳实践
- **适用场景**: 中文创作、多模态理解、函数调用
- **提示词建议**: 结构化的提示词效果更好
- **特色功能**: 支持图像理解和函数调用

## 故障排除

### 常见问题

#### 1. API密钥无效
**症状**: 提示"API密钥无效"或"认证失败"
**解决方案**:
- 检查API密钥是否正确复制
- 确认API密钥是否已激活
- 检查账户余额是否充足

#### 2. 网络连接问题
**症状**: 请求超时或连接失败
**解决方案**:
- 检查网络连接
- 确认防火墙设置
- 尝试使用VPN（如果在海外）

#### 3. 配额超限
**症状**: 提示"配额已用完"或"请求频率过高"
**解决方案**:
- 检查API使用配额
- 等待配额重置
- 升级账户套餐

#### 4. 模型不可用
**症状**: 特定模型无法使用
**解决方案**:
- 切换到其他可用模型
- 检查模型服务状态
- 联系服务提供商

### 调试技巧

1. **查看控制台日志**:
   - 打开VS Code开发者工具 (`Help > Toggle Developer Tools`)
   - 查看Console标签页的错误信息

2. **检查网络请求**:
   - 在开发者工具的Network标签页查看API请求状态
   - 检查请求头和响应内容

3. **验证配置**:
   - 使用命令面板重新配置API密钥
   - 检查VS Code设置中的配置项

## 性能优化

### 响应速度优化
- 选择地理位置较近的模型服务
- 使用较小的模型进行简单任务
- 合理设置请求超时时间

### 成本控制
- 根据任务复杂度选择合适的模型
- 避免重复发送相同请求
- 定期检查API使用情况

### 质量提升
- 编写清晰、具体的提示词
- 提供充分的上下文信息
- 根据模型特点调整交互方式

## 安全注意事项

1. **API密钥安全**:
   - 不要在代码中硬编码API密钥
   - 定期更换API密钥
   - 不要分享API密钥给他人

2. **数据隐私**:
   - 注意敏感信息的处理
   - 了解各服务商的数据政策
   - 避免发送机密信息

3. **使用合规**:
   - 遵守各平台的使用条款
   - 注意内容生成的合规性
   - 尊重知识产权

## 更新日志

### v1.0.0 (2024-01-XX)
- ✅ 新增ModelScope (Qwen)支持
- ✅ 新增DeepSeek支持
- ✅ 新增Kimi (Moonshot AI)支持
- ✅ 新增GLM (智谱AI)支持
- ✅ 统一的API密钥配置界面
- ✅ 模型选择器UI组件
- ✅ 完整的错误处理机制

## 技术支持

如果您在使用过程中遇到问题，可以通过以下方式获取帮助：

1. **查看文档**: 仔细阅读本指南和各平台的API文档
2. **检查日志**: 查看VS Code控制台的错误信息
3. **社区支持**: 在相关技术社区寻求帮助
4. **联系开发者**: 通过GitHub Issues报告问题

## 贡献指南

欢迎为SuperDesign的中国大模型支持贡献代码：

1. Fork项目仓库
2. 创建功能分支
3. 提交代码更改
4. 创建Pull Request
5. 等待代码审查

---

**注意**: 本指南会随着功能更新而持续完善，请关注最新版本。