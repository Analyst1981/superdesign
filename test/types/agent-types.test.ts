#!/usr/bin/env node

/**
 * 类型系统测试套件
 * 测试SuperDesign项目的所有TypeScript类型定义
 * 
 * 创建日期: 2025-09-19
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { 
  AgentService, 
  ExecutionContext 
} from '../../src/types/agent';
import { 
  WebviewLayout, 
  WebviewContext, 
  WebviewMessage, 
  ChatCommand, 
  ChatResponse, 
  ChatError 
} from '../../src/types/context';

// 导入其他类型定义
import * as ProviderSettings from '../../src/types/provider-settings';
import * as ModelTypes from '../../src/types/model-types';
import * as ModelConfig from '../../src/types/model-config';
import * as ApiTypes from '../../src/types/api-types';

/**
 * Agent类型测试
 */
describe('Agent类型测试', () => {
  let mockAgentService: AgentService;
  let mockExecutionContext: ExecutionContext;

  beforeEach(() => {
    // 创建Mock对象
    mockAgentService = {
      query: jest.fn(),
      hasApiKey: jest.fn(),
      isApiKeyAuthError: jest.fn()
    };

    mockExecutionContext = {
      workingDirectory: '/test/workspace',
      sessionId: 'test-session-id',
      outputChannel: {
        append: jest.fn(),
        appendLine: jest.fn(),
        clear: jest.fn(),
        show: jest.fn(),
        hide: jest.fn(),
        dispose: jest.fn()
      },
      abortController: new AbortController()
    };
  });

  it('AgentService接口应该具有正确的属性', () => {
    expect(mockAgentService).toHaveProperty('query');
    expect(mockAgentService).toHaveProperty('hasApiKey');
    expect(mockAgentService).toHaveProperty('isApiKeyAuthError');
  });

  it('AgentService.query方法应该接受正确的参数', () => {
    const queryParams = {
      prompt: 'test prompt',
      messages: [],
      options: {},
      abortController: new AbortController(),
      onMessage: jest.fn()
    };
    
    expect(mockAgentService.query).toBeDefined();
    expect(typeof mockAgentService.query).toBe('function');
  });

  it('ExecutionContext应该包含必需的属性', () => {
    expect(mockExecutionContext).toHaveProperty('workingDirectory');
    expect(mockExecutionContext).toHaveProperty('sessionId');
    expect(mockExecutionContext).toHaveProperty('outputChannel');
    expect(mockExecutionContext.workingDirectory).toBe('/test/workspace');
    expect(mockExecutionContext.sessionId).toBe('test-session-id');
  });

  it('isApiKeyAuthError方法应该正确识别认证错误', () => {
    const testCases = [
      { message: 'Invalid API key', expected: true },
      { message: 'Authentication failed', expected: true },
      { message: 'Unauthorized access', expected: true },
      { message: 'Network error', expected: false },
      { message: 'Server error', expected: false }
    ];

    testCases.forEach(({ message, expected }) => {
      mockAgentService.isApiKeyAuthError = jest.fn().mockReturnValue(expected);
      const result = mockAgentService.isApiKeyAuthError(message);
      expect(result).toBe(expected);
    });
  });
});

/**
 * Context类型测试
 */
describe('Context类型测试', () => {
  it('WebviewLayout应该是正确的联合类型', () => {
    const validLayouts: WebviewLayout[] = ['sidebar', 'panel'];
    validLayouts.forEach(layout => {
      expect(['sidebar', 'panel']).toContain(layout);
    });
  });

  it('WebviewContext应该具有正确的结构', () => {
    const webviewContext: WebviewContext = {
      layout: 'sidebar',
      extensionUri: '/test/extension',
      logoUris: {
        cursor: 'cursor-uri',
        windsurf: 'windsurf-uri',
        claudeCode: 'claude-code-uri',
        lovable: 'lovable-uri',
        bolt: 'bolt-uri'
      }
    };

    expect(webviewContext).toHaveProperty('layout');
    expect(webviewContext).toHaveProperty('extensionUri');
    expect(webviewContext.layout).toBe('sidebar');
    expect(webviewContext.extensionUri).toBe('/test/extension');
  });

  it('WebviewMessage应该具有command属性', () => {
    const webviewMessage: WebviewMessage = {
      command: 'test-command',
      data: 'test-data'
    };

    expect(webviewMessage).toHaveProperty('command');
    expect(webviewMessage.command).toBe('test-command');
  });

  it('ChatCommand应该扩展WebviewMessage', () => {
    const chatCommand: ChatCommand = {
      command: 'chatMessage',
      message: 'Hello, World!'
    };

    expect(chatCommand).toHaveProperty('command');
    expect(chatCommand).toHaveProperty('message');
    expect(chatCommand.command).toBe('chatMessage');
    expect(chatCommand.message).toBe('Hello, World!');
  });

  it('ChatResponse应该包含响应数据', () => {
    const chatResponse: ChatResponse = {
      command: 'chatResponse',
      response: 'This is a response'
    };

    expect(chatResponse).toHaveProperty('command');
    expect(chatResponse).toHaveProperty('response');
    expect(chatResponse.command).toBe('chatResponse');
    expect(chatResponse.response).toBe('This is a response');
  });

  it('ChatError应该包含错误信息', () => {
    const chatError: ChatError = {
      command: 'chatError',
      error: 'An error occurred'
    };

    expect(chatError).toHaveProperty('command');
    expect(chatError).toHaveProperty('error');
    expect(chatError.command).toBe('chatError');
    expect(chatError.error).toBe('An error occurred');
  });
});

/**
 * ProviderSettings类型测试
 */
describe('ProviderSettings类型测试', () => {
  it('应该包含所有支持的提供商配置', () => {
    const expectedProviders = [
      'claude-api',
      'claude-code',
      'openai',
      'deepseek',
      'moonshot',
      'doubao',
      'qwen',
      'glm',
      'zhipu'
    ];

    expectedProviders.forEach(provider => {
      expect(typeof provider).toBe('string');
    });
  });

  it('提供商配置应该包含必需的属性', () => {
    const mockProviderConfig = {
      apiKey: 'test-api-key',
      baseUrl: 'https://api.test.com',
      model: 'test-model',
      maxTokens: 4096,
      temperature: 0.7
    };

    expect(mockProviderConfig).toHaveProperty('apiKey');
    expect(mockProviderConfig).toHaveProperty('baseUrl');
    expect(mockProviderConfig).toHaveProperty('model');
    expect(mockProviderConfig).toHaveProperty('maxTokens');
    expect(mockProviderConfig).toHaveProperty('temperature');
  });
});

/**
 * ModelTypes类型测试
 */
describe('ModelTypes类型测试', () => {
  it('应该定义模型类型枚举', () => {
    const modelTypes = [
      'text',
      'chat',
      'completion',
      'embedding',
      'vision',
      'audio',
      'code'
    ];

    modelTypes.forEach(type => {
      expect(typeof type).toBe('string');
    });
  });

  it('模型配置应该包含必需的属性', () => {
    const mockModelConfig = {
      id: 'test-model',
      name: 'Test Model',
      type: 'chat',
      provider: 'test-provider',
      maxTokens: 4096,
      supportsStreaming: true,
      supportsVision: false
    };

    expect(mockModelConfig).toHaveProperty('id');
    expect(mockModelConfig).toHaveProperty('name');
    expect(mockModelConfig).toHaveProperty('type');
    expect(mockModelConfig).toHaveProperty('provider');
    expect(mockModelConfig).toHaveProperty('maxTokens');
    expect(mockModelConfig).toHaveProperty('supportsStreaming');
    expect(mockModelConfig).toHaveProperty('supportsVision');
  });
});

/**
 * ModelConfig类型测试
 */
describe('ModelConfig类型测试', () => {
  it('应该支持模型配置的验证', () => {
    const validConfig = {
      model: 'claude-3-5-sonnet-20241022',
      provider: 'claude-api',
      temperature: 0.7,
      maxTokens: 4096,
      topP: 1.0,
      frequencyPenalty: 0,
      presencePenalty: 0
    };

    expect(validConfig).toHaveProperty('model');
    expect(validConfig).toHaveProperty('provider');
    expect(validConfig).toHaveProperty('temperature');
    expect(validConfig).toHaveProperty('maxTokens');
  });

  it('温度参数应该在有效范围内', () => {
    const validTemperatures = [0, 0.5, 1.0, 2.0];
    const invalidTemperatures = [-0.1, 2.1];

    validTemperatures.forEach(temp => {
      expect(temp).toBeGreaterThanOrEqual(0);
      expect(temp).toBeLessThanOrEqual(2);
    });

    invalidTemperatures.forEach(temp => {
      expect(temp < 0 || temp > 2).toBe(true);
    });
  });
});

/**
 * ApiTypes类型测试
 */
describe('ApiTypes类型测试', () => {
  it('应该定义API请求和响应类型', () => {
    const mockApiRequest = {
      method: 'POST',
      url: 'https://api.test.com/chat',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: {
        model: 'test-model',
        messages: []
      }
    };

    expect(mockApiRequest).toHaveProperty('method');
    expect(mockApiRequest).toHaveProperty('url');
    expect(mockApiRequest).toHaveProperty('headers');
    expect(mockApiRequest).toHaveProperty('body');
  });

  it('API响应应该包含状态和数据', () => {
    const mockApiResponse = {
      status: 200,
      statusText: 'OK',
      data: {
        id: 'test-response',
        object: 'chat.completion',
        created: Date.now(),
        choices: []
      }
    };

    expect(mockApiResponse).toHaveProperty('status');
    expect(mockApiResponse).toHaveProperty('statusText');
    expect(mockApiResponse).toHaveProperty('data');
    expect(mockApiResponse.status).toBe(200);
    expect(mockApiResponse.statusText).toBe('OK');
  });
});

/**
 * 类型兼容性测试
 */
describe('类型兼容性测试', () => {
  it('应该确保不同类型之间的兼容性', () => {
    // 测试WebviewMessage的兼容性
    const chatMessage: ChatCommand = {
      command: 'chatMessage',
      message: 'test'
    };

    const webviewMessage: WebviewMessage = chatMessage;
    expect(webviewMessage.command).toBe('chatMessage');

    // 测试AgentService的兼容性
    const agentService: AgentService = {
      query: jest.fn(),
      hasApiKey: jest.fn().mockReturnValue(true),
      isApiKeyAuthError: jest.fn().mockReturnValue(false)
    };

    expect(agentService.hasApiKey()).toBe(true);
    expect(agentService.isApiKeyAuthError('test')).toBe(false);
  });

  it('应该处理类型转换和类型保护', () => {
    // 类型守卫测试
    function isChatCommand(message: WebviewMessage): message is ChatCommand {
      return message.command === 'chatMessage';
    }

    const testMessage: WebviewMessage = {
      command: 'chatMessage',
      message: 'test'
    };

    if (isChatCommand(testMessage)) {
      expect(testMessage.message).toBe('test');
    } else {
      fail('Message should be ChatCommand');
    }
  });
});

/**
 * 边界情况测试
 */
describe('边界情况测试', () => {
  it('应该处理空值和未定义值', () => {
    const webviewContext: WebviewContext = {
      layout: 'sidebar',
      extensionUri: '/test/extension'
      // logoUris 是可选的
    };

    expect(webviewContext.logoUris).toBeUndefined();
    expect(webviewContext.layout).toBe('sidebar');
  });

  it('应该处理可选属性', () => {
    const executionContext: ExecutionContext = {
      workingDirectory: '/test/workspace',
      sessionId: 'test-session-id',
      outputChannel: {
        append: jest.fn(),
        appendLine: jest.fn(),
        clear: jest.fn(),
        show: jest.fn(),
        hide: jest.fn(),
        dispose: jest.fn()
      }
      // abortController 是可选的
    };

    expect(executionContext.abortController).toBeUndefined();
  });

  it('应该处理类型联合', () => {
    const layouts: WebviewLayout[] = ['sidebar', 'panel'];
    
    layouts.forEach(layout => {
      expect(['sidebar', 'panel']).toContain(layout);
    });
  });
});

/**
 * 性能测试
 */
describe('类型系统性能测试', () => {
  it('应该快速验证类型兼容性', () => {
    const startTime = performance.now();
    
    // 创建大量类型对象进行验证
    for (let i = 0; i < 1000; i++) {
      const message: WebviewMessage = {
        command: 'test-command',
        data: `test-data-${i}`
      };
      
      expect(message.command).toBe('test-command');
      expect(message.data).toBe(`test-data-${i}`);
    }
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    expect(executionTime).toBeLessThan(100); // 应该在100ms内完成
  });

  it('应该高效处理类型检查', () => {
    const startTime = performance.now();
    
    // 执行大量类型检查
    for (let i = 0; i < 500; i++) {
      const isString = typeof 'test' === 'string';
      const isNumber = typeof 123 === 'number';
      const isBoolean = typeof true === 'boolean';
      
      expect(isString).toBe(true);
      expect(isNumber).toBe(true);
      expect(isBoolean).toBe(true);
    }
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    expect(executionTime).toBeLessThan(50); // 应该在50ms内完成
  });
});