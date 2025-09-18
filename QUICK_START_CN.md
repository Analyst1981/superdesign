# 中国大模型快速开始指南

## 🚀 5分钟快速配置

### 1. 选择您的模型提供商

| 提供商 | 特点 | 获取API密钥 |
|--------|------|-------------|
| **ModelScope** | 阿里云通义千问，中文能力强 | [获取密钥](https://modelscope.cn/my/myaccesstoken) |
| **DeepSeek** | 专业代码生成，推理能力强 | [获取密钥](https://platform.deepseek.com/api_keys) |
| **Kimi** | 超长文本处理，200万字上下文 | [获取密钥](https://platform.moonshot.cn/console/api-keys) |
| **GLM** | 智谱AI，多模态能力 | [获取密钥](https://open.bigmodel.cn/usercenter/apikeys) |

### 2. 配置API密钥

1. 在VS Code中按 `Ctrl+Shift+P`
2. 输入 `Configure` 并选择对应的配置命令：
   ```
   Configure ModelScope API Key    # 配置ModelScope
   Configure DeepSeek API Key      # 配置DeepSeek  
   Configure Kimi API Key          # 配置Kimi
   Configure GLM API Key           # 配置GLM
   ```
3. 粘贴您的API密钥并按回车

### 3. 开始使用

1. 打开SuperDesign聊天界面
2. 在模型选择器中选择中国大模型
3. 开始对话！

## 🎯 推荐配置

### 新手推荐
- **ModelScope (Qwen-Turbo)**: 响应快，中文友好
- 适合：日常编程问题、中文内容生成

### 专业开发者
- **DeepSeek-Coder**: 专业代码生成
- 适合：复杂算法、代码重构、技术架构

### 文档处理
- **Kimi**: 超长文本处理
- 适合：大型文档分析、需求整理

### 多模态任务
- **GLM-4**: 图文理解
- 适合：UI设计、图像分析

## ⚡ 常用命令

```bash
# 快速配置所有API密钥
Ctrl+Shift+P → Configure ModelScope API Key
Ctrl+Shift+P → Configure DeepSeek API Key  
Ctrl+Shift+P → Configure Kimi API Key
Ctrl+Shift+P → Configure GLM API Key
```

## 🔧 故障排除

| 问题 | 解决方案 |
|------|----------|
| API密钥无效 | 重新复制密钥，检查账户状态 |
| 连接超时 | 检查网络，尝试切换模型 |
| 配额用完 | 查看账户余额，升级套餐 |

## 📞 需要帮助？

- 📖 详细文档：查看 `CHINESE_LLM_GUIDE.md`
- 🐛 问题反馈：GitHub Issues
- 💬 社区讨论：相关技术论坛

---
**提示**: 首次使用建议先配置ModelScope，体验最佳的中文AI编程助手！