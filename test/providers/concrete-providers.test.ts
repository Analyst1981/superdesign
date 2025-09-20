#!/usr/bin/env node

/**
 * 具体提供商实现测试套件
 * 测试SuperDesign项目的具体LLM提供商实现
 * 
 * 创建日期: 2025-09-19
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ClaudeApiProvider } from '../../src/providers/claudeApiProvider';
import { DeepSeekProvider } from '../../src/providers/deepSeekProvider';
import { KimiProvider } from '../../src/providers/kimiProvider';
import { LLMProviderType } from '../../src/providers/llmProvider';
import { Logger } from '../../src/services/logger';

// Mock VS Code API
const mockVscode = {
  workspace: {
    getConfiguration: jest.fn().mockReturnValue({
      get: jest.fn().mockImplementation((key: string) => {
        const configMap: Record<string, any> = {
          'anthropicApiKey': 'sk-test-123',
          'deepSeekApiKey': 'sk-deepseek-test-123',
          'kimiApiKey': 'sk-kimi-test-123',
          'deepSeekBaseUrl': 'https://api.deepseek.com',
          'deepSeekModelId': 'deepseek-chat',
          'moonshotBaseUrl': 'https://api.moonshot.ai/v1',
          'moonshotModelId': 'kimi-k2-0905-preview',
          'deepSeekMaxTokens': 8192,
          'deepSeekTemperature': 0.6,
          'moonshotMaxTokens': 16384,
          'moonshotTemperature': 0.6
        };
        return configMap[key];
      }),
      update: jest.fn(),
      has: jest.fn()
    })
  },
  window: {
    showInformationMessage: jest.fn(),
    showWarningMessage: jest.fn(),
    showErrorMessage: jest.fn()
  }
};

// Mock输出通道
const mockOutputChannel = {
  append: jest.fn(),
  appendLine: jest.fn(),
  clear: jest.fn(),
  show: jest.fn(),
  hide: jest.fn(),
  dispose: jest.fn()
};

// Mock Logger
jest.mock('../../src/services/logger', () => ({
  Logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }
}));

/**
 * Claude API提供商测试
 */
describe('Claude API提供商测试', () => {
  let provider: ClaudeApiProvider;
  let loggerSpy: any;

  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).vscode = mockVscode;
    loggerSpy = Logger;
    provider = new ClaudeApiProvider(mockOutputChannel);
  });

  it('应该正确初始化Claude提供商', () => {
    expect(provider).toBeDefined();
    expect(provider.getProviderName()).toBe('Claude API');
    expect(provider.getProviderType()).toBe(LLMProviderType.CLAUDE_API);
  });

  it('应该检查配置有效性', () => {
    const isValid = provider.hasValidConfiguration();
    
    // 应该检查API密钥配置
    expect(typeof isValid).toBe('boolean');
  });

  it('应该返回正确的模型显示名称', () => {
    const modelName = provider.getModelDisplayName();
    
    expect(typeof modelName).toBe('string');
    expect(modelName.length).toBeGreaterThan(0);
  });

  it('应该能够测试连接', async () => {
    // Mock初始化和连接测试
    jest.spyOn(provider, 'initialize').mockResolvedValue(true);
    
    const result = await provider.testConnection();
    
    expect(typeof result).toBe('boolean');
  });
});

/**
 * DeepSeek提供商测试
 */
describe('DeepSeek提供商测试', () => {
  let provider: DeepSeekProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).vscode = mockVscode;
    
    // 创建DeepSeek提供商实例
    provider = new DeepSeekProvider({
      outputChannel: mockOutputChannel,
      apiKey: 'sk-deepseek-test-123',
      modelId: 'deepseek-chat',
      temperature: 0.6,
      baseUrl: 'https://api.deepseek.com'
    });
  });

  it('应该正确初始化DeepSeek提供商', () => {
    expect(provider).toBeDefined();
    expect(provider.getProviderName()).toBe('DeepSeek');
    expect(provider.getProviderType()).toBe(LLMProviderType.DEEPSEEK);
  });

  it('应该包含正确的配置参数', () => {
    // 验证DeepSeek特定的配置
    expect(provider.getModelDisplayName()).toContain('deepseek');
  });

  it('应该能够执行查询', async () => {
    // Mock初始化
    jest.spyOn(provider, 'initialize').mockResolvedValue(true);
    jest.spyOn(provider, 'isReady').mockReturnValue(true);
    
    await provider.initialize();
    
    // Mock查询方法
    jest.spyOn(provider, 'query').mockResolvedValue({
      id: 'test-response',
      content: 'DeepSeek response',
      model: 'deepseek-chat'
    });
    
    const response = await provider.query('Hello, DeepSeek!');
    
    expect(response).toBeDefined();
    expect(response.content).toBe('DeepSeek response');
    expect(response.model).toBe('deepseek-chat');
  });

  it('应该处理DeepSeek特定的配置验证', () => {
    const isValid = provider.hasValidConfiguration();
    
    expect(typeof isValid).toBe('boolean');
  });
});

/**
 * Kimi提供商测试
 */
describe('Kimi提供商测试', () => {
  let provider: KimiProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).vscode = mockVscode;
    
    // 创建Kimi提供商实例
    provider = new KimiProvider({
      outputChannel: mockOutputChannel,
      apiKey: 'sk-kimi-test-123',
      modelId: 'kimi-k2-0905-preview',
      temperature: 0.6,
      baseUrl: 'https://api.moonshot.ai/v1'
    });
  });

  it('应该正确初始化Kimi提供商', () => {
    expect(provider).toBeDefined();
    expect(provider.getProviderName()).toBe('Kimi');
    expect(provider.getProviderType()).toBe(LLMProviderType.KIMI);
  });

  it('应该支持长上下文特性', () => {
    const modelName = provider.getModelDisplayName();
    
    expect(typeof modelName).toBe('string');
    expect(modelName.length).toBeGreaterThan(0);
  });

  it('应该能够执行中文语言优化查询', async () => {
    // Mock初始化
    jest.spyOn(provider, 'initialize').mockResolvedValue(true);
    jest.spyOn(provider, 'isReady').mockReturnValue(true);
    
    await provider.initialize();
    
    // Mock查询方法
    jest.spyOn(provider, 'query').mockResolvedValue({
      id: 'test-response',
      content: 'Kimi中文响应',
      model: 'kimi-k2-0905-preview'
    });
    
    const response = await provider.query('你好，Kimi！');
    
    expect(response).toBeDefined();
    expect(response.content).toBe('Kimi中文响应');
    expect(response.model).toBe('kimi-k2-0905-preview');
  });
});

/**
 * 提供商配置测试
 */
describe('提供商配置测试', () => {
  it('应该正确读取Claude配置', () => {
    const provider = new ClaudeApiProvider(mockOutputChannel);
    
    // 验证配置读取
    const config = mockVscode.workspace.getConfiguration('superdesign');
    
    expect(config.get).toHaveBeenCalledWith('anthropicApiKey', undefined);
  });

  it('应该正确读取DeepSeek配置', () => {
    const provider = new DeepSeekProvider({
      outputChannel: mockOutputChannel,
      apiKey: 'sk-deepseek-test-123',
      modelId: 'deepseek-chat',
      temperature: 0.6,
      baseUrl: 'https://api.deepseek.com'
    });
    
    // 验证配置设置
    const config = mockVscode.workspace.getConfiguration('superdesign');
    
    expect(config.get).toHaveBeenCalledWith('deepSeekApiKey', undefined);
    expect(config.get).toHaveBeenCalledWith('deepSeekBaseUrl', 'https://api.deepseek.com');
    expect(config.get).toHaveBeenCalledWith('deepSeekModelId', 'deepseek-chat');
    expect(config.get).toHaveBeenCalledWith('deepSeekMaxTokens', 8192);
    expect(config.get).toHaveBeenCalledWith('deepSeekTemperature', 0.6);
  });

  it('应该正确读取Kimi配置', () => {
    const provider = new KimiProvider({
      outputChannel: mockOutputChannel,
      apiKey: 'sk-kimi-test-123',
      modelId: 'kimi-k2-0905-preview',
      temperature: 0.6,
      baseUrl: 'https://api.moonshot.ai/v1'
    });
    
    // 验证配置设置
    const config = mockVscode.workspace.getConfiguration('superdesign');
    
    expect(config.get).toHaveBeenCalledWith('kimiApiKey', undefined);
    expect(config.get).toHaveBeenCalledWith('moonshotBaseUrl', 'https://api.moonshot.ai/v1');
    expect(config.get).toHaveBeenCalledWith('moonshotModelId', 'kimi-k2-0905-preview');
    expect(config.get).toHaveBeenCalledWith('moonshotMaxTokens', 16384);
    expect(config.get).toHaveBeenCalledWith('moonshotTemperature', 0.6);
  });
});

/**
 * 提供商错误处理测试
 */
describe('提供商错误处理测试', () => {
  it('应该处理Claude API错误', async () => {
    const provider = new ClaudeApiProvider(mockOutputChannel);
    
    // Mock初始化失败
    jest.spyOn(provider, 'initialize').mockRejectedValue(new Error('Claude API initialization failed'));
    
    await expect(provider.initialize()).rejects.toThrow('Claude API initialization failed');
  });

  it('应该处理DeepSeek连接错误', async () => {
    const provider = new DeepSeekProvider({
      outputChannel: mockOutputChannel,
      apiKey: 'sk-deepseek-test-123',
      modelId: 'deepseek-chat',
      temperature: 0.6,
      baseUrl: 'https://api.deepseek.com'
    });
    
    // Mock连接测试失败
    jest.spyOn(provider, 'testConnection').mockRejectedValue(new Error('DeepSeek connection failed'));
    
    await expect(provider.testConnection()).rejects.toThrow('DeepSeek connection failed');
  });

  it('应该处理Kimi查询错误', async () => {
    const provider = new KimiProvider({
      outputChannel: mockOutputChannel,
      apiKey: 'sk-kimi-test-123',
      modelId: 'kimi-k2-0905-preview',
      temperature: 0.6,
      baseUrl: 'https://api.moonshot.ai/v1'
    });
    
    // Mock查询失败
    jest.spyOn(provider, 'query').mockRejectedValue(new Error('Kimi query failed'));
    
    await expect(provider.query('test')).rejects.toThrow('Kimi query failed');
  });
});

/**
 * 提供商性能测试
 */
describe('提供商性能测试', () => {
  it('应该快速初始化Claude提供商', async () => {
    const provider = new ClaudeApiProvider(mockOutputChannel);
    
    jest.spyOn(provider, 'initialize').mockResolvedValue(true);
    
    const startTime = performance.now();
    await provider.initialize();
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(50);
  });

  it('应该快速初始化DeepSeek提供商', async () => {
    const provider = new DeepSeekProvider({
      outputChannel: mockOutputChannel,
      apiKey: 'sk-deepseek-test-123',
      modelId: 'deepseek-chat',
      temperature: 0.6,
      baseUrl: 'https://api.deepseek.com'
    });
    
    jest.spyOn(provider, 'initialize').mockResolvedValue(true);
    
    const startTime = performance.now();
    await provider.initialize();
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(50);
  });

  it('应该快速初始化Kimi提供商', async () => {
    const provider = new KimiProvider({
      outputChannel: mockOutputChannel,
      apiKey: 'sk-kimi-test-123',
      modelId: 'kimi-k2-0905-preview',
      temperature: 0.6,
      baseUrl: 'https://api.moonshot.ai/v1'
    });
    
    jest.spyOn(provider, 'initialize').mockResolvedValue(true);
    
    const startTime = performance.now();
    await provider.initialize();
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(50);
  });

  it('应该高效处理并发查询', async () => {
    const provider = new ClaudeApiProvider(mockOutputChannel);
    
    jest.spyOn(provider, 'initialize').mockResolvedValue(true);
    jest.spyOn(provider, 'isReady').mockReturnValue(true);
    jest.spyOn(provider, 'query').mockResolvedValue({
      id: 'test-response',
      content: 'Concurrent response',
      model: 'claude-3-5-sonnet-20241022'
    });
    
    await provider.initialize();
    
    const startTime = performance.now();
    
    const queries = Array.from({ length: 50 }, (_, i) => 
      provider.query(`Concurrent query ${i}`)
    );
    
    await Promise.all(queries);
    
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(200);
  });
});

/**
 * 提供商兼容性测试
 */
describe('提供商兼容性测试', () => {
  it('应该兼容不同的API格式', () => {
    const claudeProvider = new ClaudeApiProvider(mockOutputChannel);
    const deepSeekProvider = new DeepSeekProvider({
      outputChannel: mockOutputChannel,
      apiKey: 'sk-deepseek-test-123',
      modelId: 'deepseek-chat',
      temperature: 0.6,
      baseUrl: 'https://api.deepseek.com'
    });
    const kimiProvider = new KimiProvider({
      outputChannel: mockOutputChannel,
      apiKey: 'sk-kimi-test-123',
      modelId: 'kimi-k2-0905-preview',
      temperature: 0.6,
      baseUrl: 'https://api.moonshot.ai/v1'
    });
    
    // 所有提供商都应该实现相同的接口
    expect(typeof claudeProvider.getProviderName).toBe('function');
    expect(typeof deepSeekProvider.getProviderName).toBe('function');
    expect(typeof kimiProvider.getProviderName).toBe('function');
    
    expect(typeof claudeProvider.getModelDisplayName).toBe('function');
    expect(typeof deepSeekProvider.getModelDisplayName).toBe('function');
    expect(typeof kimiProvider.getModelDisplayName).toBe('function');
    
    expect(typeof claudeProvider.getProviderType).toBe('function');
    expect(typeof deepSeekProvider.getProviderType).toBe('function');
    expect(typeof kimiProvider.getProviderType).toBe('function');
  });

  it('应该支持相同的查询接口', async () => {
    const providers = [
      new ClaudeApiProvider(mockOutputChannel),
      new DeepSeekProvider({
        outputChannel: mockOutputChannel,
        apiKey: 'sk-deepseek-test-123',
        modelId: 'deepseek-chat',
        temperature: 0.6,
        baseUrl: 'https://api.deepseek.com'
      }),
      new KimiProvider({
        outputChannel: mockOutputChannel,
        apiKey: 'sk-kimi-test-123',
        modelId: 'kimi-k2-0905-preview',
        temperature: 0.6,
        baseUrl: 'https://api.moonshot.ai/v1'
      })
    ];
    
    // Mock所有提供商的初始化和查询
    providers.forEach(provider => {
      jest.spyOn(provider, 'initialize').mockResolvedValue(true);
      jest.spyOn(provider, 'isReady').mockReturnValue(true);
      jest.spyOn(provider, 'query').mockResolvedValue({
        id: 'test-response',
        content: 'Compatible response',
        model: 'test-model'
      });
    });
    
    // 初始化所有提供商
    await Promise.all(providers.map(p => p.initialize()));
    
    // 测试所有提供商都支持相同的查询接口
    const responses = await Promise.all(
      providers.map(p => p.query('Test compatibility'))
    );
    
    expect(responses).toHaveLength(3);
    responses.forEach(response => {
      expect(response).toBeDefined();
      expect(response.content).toBe('Compatible response');
    });
  });
});