#!/usr/bin/env node

/**
 * 测试fixtures配置
 * 提供测试所需的模拟数据和配置
 * 
 * 创建日期: 2025-09-19
 */

/**
 * 测试用户配置
 */
export const testUserConfig = {
  superdesign: {
    activeProvider: 'claude-api',
    anthropicApiKey: 'sk-test-123456789',
    enableModelSwitching: true,
    showModelInfo: true,
    claudeCodePath: 'claude',
    claudeCodeModelId: 'claude-sonnet-4-20250514',
    claudeCodeThinkingBudget: 50000,
    openaiApiKey: 'sk-openai-test-123',
    openaiUrl: 'https://api.openai.com/v1',
    openrouterApiKey: 'sk-openrouter-test-123',
    aiModelProvider: 'anthropic',
    aiModel: 'claude-3-5-sonnet-20241022',
    modelScopeApiKey: 'sk-modelscope-test-123',
    modelScopeModelId: 'qwen-turbo',
    deepSeekApiKey: 'sk-deepseek-test-123',
    deepSeekBaseUrl: 'https://api.deepseek.com',
    deepSeekModelId: 'deepseek-chat',
    deepSeekMaxTokens: 8192,
    deepSeekTemperature: 0.6,
    moonshotApiKey: 'sk-moonshot-test-123',
    moonshotBaseUrl: 'https://api.moonshot.ai/v1',
    moonshotModelId: 'kimi-k2-0905-preview',
    moonshotMaxTokens: 16384,
    moonshotTemperature: 0.6,
    doubaoApiKey: 'sk-doubao-test-123',
    doubaoBaseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    doubaoModelId: 'doubao-lite-4k',
    doubaoMaxTokens: 32768,
    doubaoTemperature: 0.7,
    kimiApiKey: 'sk-kimi-test-123',
    kimiModelId: 'moonshot-v1-8k',
    qwenApiKey: 'sk-qwen-test-123',
    qwenBaseUrl: 'https://dashscope.aliyuncs.com/api/v1',
    qwenModelId: 'qwen-plus',
    qwenMaxTokens: 8192,
    qwenTemperature: 0.7,
    glmApiKey: 'sk-glm-test-123',
    glmBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    glmModelId: 'glm-4-plus',
    glmMaxTokens: 8192,
    glmTemperature: 0.7,
    zhipuApiKey: 'sk-zhipu-test-123',
    zhipuModelId: 'glm-4-plus',
    doubaoEndpointId: 'ep-test-123'
  }
};

/**
 * 测试LLM提供商配置
 */
export const testProviderConfigs = {
  'claude-api': {
    apiKey: 'sk-test-123456789',
    model: 'claude-3-5-sonnet-20241022',
    baseUrl: 'https://api.anthropic.com',
    maxTokens: 4096,
    temperature: 0.7
  },
  'claude-code': {
    binaryPath: 'claude',
    model: 'claude-sonnet-4-20250514',
    thinkingBudget: 50000
  },
  'openai': {
    apiKey: 'sk-openai-test-123',
    model: 'gpt-4',
    baseUrl: 'https://api.openai.com/v1',
    maxTokens: 4096,
    temperature: 0.7
  },
  'deepseek': {
    apiKey: 'sk-deepseek-test-123',
    model: 'deepseek-chat',
    baseUrl: 'https://api.deepseek.com',
    maxTokens: 8192,
    temperature: 0.6
  },
  'moonshot': {
    apiKey: 'sk-moonshot-test-123',
    model: 'kimi-k2-0905-preview',
    baseUrl: 'https://api.moonshot.ai/v1',
    maxTokens: 16384,
    temperature: 0.6
  },
  'doubao': {
    apiKey: 'sk-doubao-test-123',
    model: 'doubao-lite-4k',
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    maxTokens: 32768,
    temperature: 0.7
  },
  'qwen': {
    apiKey: 'sk-qwen-test-123',
    model: 'qwen-plus',
    baseUrl: 'https://dashscope.aliyuncs.com/api/v1',
    maxTokens: 8192,
    temperature: 0.7
  },
  'glm': {
    apiKey: 'sk-glm-test-123',
    model: 'glm-4-plus',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    maxTokens: 8192,
    temperature: 0.7
  },
  'zhipu': {
    apiKey: 'sk-zhipu-test-123',
    model: 'glm-4-plus',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    maxTokens: 8192,
    temperature: 0.7
  }
};

/**
 * 测试聊天消息
 */
export const testChatMessages = [
  {
    id: 'msg-1',
    role: 'user',
    content: '请帮我创建一个React按钮组件',
    timestamp: '2024-01-01T10:00:00Z'
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content: '我来帮你创建一个React按钮组件',
    timestamp: '2024-01-01T10:00:01Z'
  },
  {
    id: 'msg-3',
    role: 'user',
    content: '我想要一个带有动画效果的按钮',
    timestamp: '2024-01-01T10:00:02Z'
  },
  {
    id: 'msg-4',
    role: 'assistant',
    content: '我为你创建一个带有CSS动画的按钮组件',
    timestamp: '2024-01-01T10:00:03Z'
  }
];

/**
 * 测试聊天会话
 */
export const testChatSessions = [
  {
    id: 'session-1',
    title: 'React按钮组件开发',
    messages: testChatMessages,
    model: 'claude-3-5-sonnet-20241022',
    provider: 'claude-api',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:03Z'
  },
  {
    id: 'session-2',
    title: '性能优化讨论',
    messages: [
      {
        id: 'msg-5',
        role: 'user',
        content: '如何优化这个函数的性能？',
        timestamp: '2024-01-01T11:00:00Z'
      },
      {
        id: 'msg-6',
        role: 'assistant',
        content: '让我分析一下这个函数的性能瓶颈',
        timestamp: '2024-01-01T11:00:01Z'
      }
    ],
    model: 'gpt-4',
    provider: 'openai',
    createdAt: '2024-01-01T11:00:00Z',
    updatedAt: '2024-01-01T11:00:01Z'
  }
];

/**
 * 测试文件内容
 */
export const testFileContents = {
  'react-component.tsx': `
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium'
}) => {
  return (
    <button
      className={\`button button-\${variant} button-\${size}\`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
`,
  'styles.css': `
.button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.button-primary {
  background-color: #007acc;
  color: white;
}

.button-secondary {
  background-color: #f0f0f0;
  color: #333;
}

.button-small {
  padding: 4px 8px;
  font-size: 12px;
}

.button-large {
  padding: 12px 24px;
  font-size: 16px;
}

.button:hover {
  opacity: 0.9;
}
`,
  'package.json': `
{
  "name": "test-project",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
`
};

/**
 * 测试API响应
 */
export const testApiResponses = {
  'claude-success': {
    id: 'msg_123456789',
    type: 'message',
    role: 'assistant',
    content: [
      {
        type: 'text',
        text: '这是一个成功的响应'
      }
    ],
    model: 'claude-3-5-sonnet-20241022',
    stop_reason: 'end_turn',
    stop_sequence: null,
    usage: {
      input_tokens: 10,
      output_tokens: 20
    }
  },
  'openai-success': {
    id: 'chatcmpl-123456789',
    object: 'chat.completion',
    created: 1234567890,
    model: 'gpt-4',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: '这是一个成功的OpenAI响应'
        },
        finish_reason: 'stop'
      }
    ],
    usage: {
      prompt_tokens: 10,
      completion_tokens: 20,
      total_tokens: 30
    }
  },
  'error-response': {
    error: {
      message: 'Invalid API key',
      type: 'authentication_error',
      code: 'invalid_api_key'
    }
  },
  'rate-limit-error': {
    error: {
      message: 'Rate limit exceeded',
      type: 'rate_limit_error',
      code: 'rate_limit_exceeded'
    }
  }
};

/**
 * 测试错误场景
 */
export const testErrorScenarios = {
  'missing-api-key': {
    error: 'API key is required',
    code: 'MISSING_API_KEY'
  },
  'invalid-api-key': {
    error: 'Invalid API key',
    code: 'INVALID_API_KEY'
  },
  'network-error': {
    error: 'Network error',
    code: 'NETWORK_ERROR'
  },
  'timeout-error': {
    error: 'Request timeout',
    code: 'TIMEOUT_ERROR'
  },
  'rate-limit-error': {
    error: 'Rate limit exceeded',
    code: 'RATE_LIMIT_ERROR'
  },
  'model-not-found': {
    error: 'Model not found',
    code: 'MODEL_NOT_FOUND'
  },
  'invalid-request': {
    error: 'Invalid request',
    code: 'INVALID_REQUEST'
  }
};

/**
 * 测试工作空间配置
 */
export const testWorkspaceConfig = {
  name: 'test-workspace',
  folders: [
    {
      uri: { fsPath: '/test/workspace' },
      name: 'test-workspace',
      index: 0
    }
  ],
  settings: {
    'superdesign.activeProvider': 'claude-api',
    'superdesign.anthropicApiKey': 'sk-test-123456789',
    'superdesign.enableModelSwitching': true
  }
};

/**
 * 测试扩展上下文
 */
export const testExtensionContext = {
  subscriptions: [],
  workspaceState: {
    get: jest.fn(),
    update: jest.fn(),
    keys: jest.fn().mockReturnValue([])
  },
  globalState: {
    get: jest.fn(),
    update: jest.fn(),
    keys: jest.fn().mockReturnValue([])
  },
  secrets: {
    get: jest.fn(),
    store: jest.fn(),
    delete: jest.fn()
  },
  extensionUri: { fsPath: '/test/extension' },
  extensionPath: '/test/extension',
  asAbsolutePath: (relativePath: string) => `/test/extension/${relativePath}`,
  storageUri: { fsPath: '/test/storage' },
  globalStorageUri: { fsPath: '/test/global-storage' },
  logUri: { fsPath: '/test/logs' },
  extensionMode: 1 // ExtensionMode.Test
};

/**
 * 测试性能基准
 */
export const testPerformanceBenchmarks = {
  'api-response-time': {
    target: 2000, // 2秒
    threshold: 5000 // 5秒
  },
  'file-read-time': {
    target: 100, // 100ms
    threshold: 500 // 500ms
  },
  'file-write-time': {
    target: 200, // 200ms
    threshold: 1000 // 1秒
  },
  'ui-render-time': {
    target: 16, // 16ms (60fps)
    threshold: 100 // 100ms
  },
  'memory-usage': {
    target: 100 * 1024 * 1024, // 100MB
    threshold: 500 * 1024 * 1024 // 500MB
  }
};

// 导出所有fixtures
export default {
  testUserConfig,
  testProviderConfigs,
  testChatMessages,
  testChatSessions,
  testFileContents,
  testApiResponses,
  testErrorScenarios,
  testWorkspaceConfig,
  testExtensionContext,
  testPerformanceBenchmarks
};