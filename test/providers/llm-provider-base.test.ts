#!/usr/bin/env node

/**
 * LLM提供商基础接口测试套件
 * 测试SuperDesign项目的LLM提供商基础接口功能
 * 
 * 创建日期: 2025-09-19
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { LLMProvider, LLMProviderType } from '../../src/providers/llmProvider';

// 创建一个测试用的Mock提供商类
class MockLLMProvider extends LLMProvider {
  private _isReady: boolean = false;
  private _isValidConfig: boolean = false;

  constructor(outputChannel: any, config: any = {}) {
    super(outputChannel);
    this._isValidConfig = config.isValidConfig || false;
  }

  async initialize(): Promise<boolean> {
    this._isReady = true;
    return true;
  }

  async query(
    prompt: string,
    options?: any,
    abortController?: AbortController
  ): Promise<any> {
    if (!this._isReady) {
      throw new Error('Provider not ready');
    }
    
    return {
      id: 'test-response',
      content: `Mock response to: ${prompt}`,
      model: 'mock-model'
    };
  }

  async refreshConfiguration(): Promise<boolean> {
    this._isReady = true;
    return true;
  }

  isReady(): boolean {
    return this._isReady;
  }

  hasValidConfiguration(): boolean {
    return this._isValidConfig;
  }

  getProviderName(): string {
    return 'Mock Provider';
  }

  getModelDisplayName(): string {
    return 'Mock Model';
  }

  getProviderType(): LLMProviderType {
    return LLMProviderType.CLAUDE_API;
  }

  async testConnection(): Promise<boolean> {
    return this._isReady && this._isValidConfig;
  }

  dispose(): void {
    this._isReady = false;
  }
}

/**
 * LLM提供商基础接口测试
 */
describe('LLM提供商基础接口测试', () => {
  let mockOutputChannel: any;
  let mockProvider: MockLLMProvider;

  beforeEach(() => {
    mockOutputChannel = {
      append: jest.fn(),
      appendLine: jest.fn(),
      clear: jest.fn(),
      show: jest.fn(),
      hide: jest.fn(),
      dispose: jest.fn()
    };

    mockProvider = new MockLLMProvider(mockOutputChannel, { isValidConfig: true });
  });

  describe('提供商类型测试', () => {
    it('应该定义所有支持的提供商类型', () => {
      const expectedTypes = [
        LLMProviderType.CLAUDE_API,
        LLMProviderType.CLAUDE_CODE,
        LLMProviderType.MODELSCOPE,
        LLMProviderType.DEEPSEEK,
        LLMProviderType.KIMI,
        LLMProviderType.GLM,
        LLMProviderType.ZHIPU,
        LLMProviderType.QWEN,
        LLMProviderType.DOUBAO
      ];

      expectedTypes.forEach(type => {
        expect(typeof type).toBe('string');
        expect(type.length).toBeGreaterThan(0);
      });
    });

    it('应该包含唯一的类型值', () => {
      const types = Object.values(LLMProviderType);
      const uniqueTypes = new Set(types);
      
      expect(types.length).toBe(uniqueTypes.size);
    });
  });

  describe('提供商初始化测试', () => {
    it('应该正确初始化提供商', async () => {
      const uninitializedProvider = new MockLLMProvider(mockOutputChannel, { isValidConfig: true });
      
      expect(uninitializedProvider.isReady()).toBe(false);
      
      const result = await uninitializedProvider.initialize();
      
      expect(result).toBe(true);
      expect(uninitializedProvider.isReady()).toBe(true);
    });

    it('应该处理初始化失败', async () => {
      class FailingProvider extends MockLLMProvider {
        async initialize(): Promise<boolean> {
          throw new Error('Initialization failed');
        }
      }

      const failingProvider = new FailingProvider(mockOutputChannel, { isValidConfig: true });
      
      await expect(failingProvider.initialize()).rejects.toThrow('Initialization failed');
    });
  });

  describe('查询功能测试', () => {
    it('应该执行查询并返回结果', async () => {
      await mockProvider.initialize();
      
      const prompt = 'Hello, World!';
      const response = await mockProvider.query(prompt);
      
      expect(response).toBeDefined();
      expect(response.id).toBe('test-response');
      expect(response.content).toBe(`Mock response to: ${prompt}`);
      expect(response.model).toBe('mock-model');
    });

    it('应该处理未初始化的查询', async () => {
      const uninitializedProvider = new MockLLMProvider(mockOutputChannel, { isValidConfig: true });
      
      await expect(uninitializedProvider.query('test')).rejects.toThrow('Provider not ready');
    });

    it('应该支持查询选项', async () => {
      await mockProvider.initialize();
      
      const options = {
        temperature: 0.7,
        maxTokens: 1000,
        model: 'custom-model'
      };
      
      const response = await mockProvider.query('test', options);
      
      expect(response).toBeDefined();
    });

    it('应该支持中止控制器', async () => {
      await mockProvider.initialize();
      
      const abortController = new AbortController();
      const response = await mockProvider.query('test', {}, abortController);
      
      expect(response).toBeDefined();
    });
  });

  describe('配置管理测试', () => {
    it('应该检查配置有效性', () => {
      const validProvider = new MockLLMProvider(mockOutputChannel, { isValidConfig: true });
      const invalidProvider = new MockLLMProvider(mockOutputChannel, { isValidConfig: false });
      
      expect(validProvider.hasValidConfiguration()).toBe(true);
      expect(invalidProvider.hasValidConfiguration()).toBe(false);
    });

    it('应该刷新配置', async () => {
      const provider = new MockLLMProvider(mockOutputChannel, { isValidConfig: true });
      
      expect(provider.isReady()).toBe(false);
      
      const result = await provider.refreshConfiguration();
      
      expect(result).toBe(true);
      expect(provider.isReady()).toBe(true);
    });
  });

  describe('提供商信息测试', () => {
    it('应该返回正确的提供商信息', () => {
      const provider = new MockLLMProvider(mockOutputChannel, { isValidConfig: true });
      
      expect(provider.getProviderName()).toBe('Mock Provider');
      expect(provider.getModelDisplayName()).toBe('Mock Model');
      expect(provider.getProviderType()).toBe(LLMProviderType.CLAUDE_API);
    });

    it('应该包含必需的信息属性', () => {
      const provider = new MockLLMProvider(mockOutputChannel, { isValidConfig: true });
      
      expect(typeof provider.getProviderName()).toBe('string');
      expect(typeof provider.getModelDisplayName()).toBe('string');
      expect(typeof provider.getProviderType()).toBe('string');
      
      expect(provider.getProviderName().length).toBeGreaterThan(0);
      expect(provider.getModelDisplayName().length).toBeGreaterThan(0);
    });
  });

  describe('连接测试测试', () => {
    it('应该测试连接并返回结果', async () => {
      const validProvider = new MockLLMProvider(mockOutputChannel, { isValidConfig: true });
      await validProvider.initialize();
      
      const result = await validProvider.testConnection();
      
      expect(result).toBe(true);
    });

    it('应该处理连接测试失败', async () => {
      const invalidProvider = new MockLLMProvider(mockOutputChannel, { isValidConfig: false });
      await invalidProvider.initialize();
      
      const result = await invalidProvider.testConnection();
      
      expect(result).toBe(false);
    });
  });

  describe('资源清理测试', () => {
    it('应该正确清理资源', () => {
      const provider = new MockLLMProvider(mockOutputChannel, { isValidConfig: true });
      
      provider.dispose();
      
      expect(provider.isReady()).toBe(false);
    });

    it('应该可以安全地多次调用dispose', () => {
      const provider = new MockLLMProvider(mockOutputChannel, { isValidConfig: true });
      
      provider.dispose();
      provider.dispose();
      provider.dispose();
      
      expect(provider.isReady()).toBe(false);
    });
  });

  describe('错误处理测试', () => {
    it('应该处理查询中的异常', async () => {
      class ErrorProvider extends MockLLMProvider {
        async query(prompt: string, options?: any, abortController?: AbortController): Promise<any> {
          throw new Error('Query failed');
        }
      }

      const errorProvider = new ErrorProvider(mockOutputChannel, { isValidConfig: true });
      await errorProvider.initialize();
      
      await expect(errorProvider.query('test')).rejects.toThrow('Query failed');
    });

    it('应该处理配置刷新中的异常', async () => {
      class ErrorRefreshProvider extends MockLLMProvider {
        async refreshConfiguration(): Promise<boolean> {
          throw new Error('Refresh failed');
        }
      }

      const errorProvider = new ErrorRefreshProvider(mockOutputChannel, { isValidConfig: true });
      
      await expect(errorProvider.refreshConfiguration()).rejects.toThrow('Refresh failed');
    });
  });

  describe('异步操作测试', () => {
    it('应该正确处理并发初始化', async () => {
      const provider = new MockLLMProvider(mockOutputChannel, { isValidConfig: true });
      
      const initPromises = [
        provider.initialize(),
        provider.initialize(),
        provider.initialize()
      ];

      const results = await Promise.all(initPromises);
      
      expect(results).toEqual([true, true, true]);
      expect(provider.isReady()).toBe(true);
    });

    it('应该正确处理并发查询', async () => {
      await mockProvider.initialize();
      
      const queryPromises = [
        mockProvider.query('query 1'),
        mockProvider.query('query 2'),
        mockProvider.query('query 3')
      ];

      const responses = await Promise.all(queryPromises);
      
      expect(responses).toHaveLength(3);
      expect(responses[0].content).toBe('Mock response to: query 1');
      expect(responses[1].content).toBe('Mock response to: query 2');
      expect(responses[2].content).toBe('Mock response to: query 3');
    });
  });

  describe('状态管理测试', () => {
    it('应该跟踪提供商状态', () => {
      const provider = new MockLLMProvider(mockOutputChannel, { isValidConfig: true });
      
      expect(provider.isReady()).toBe(false);
      
      provider.dispose();
      
      expect(provider.isReady()).toBe(false);
    });

    it('应该响应配置变化', async () => {
      const provider = new MockLLMProvider(mockOutputChannel, { isValidConfig: false });
      
      expect(provider.hasValidConfiguration()).toBe(false);
      expect(provider.isReady()).toBe(false);
      
      await provider.refreshConfiguration();
      
      expect(provider.isReady()).toBe(true);
      // 配置有效性不会因为刷新而改变
      expect(provider.hasValidConfiguration()).toBe(false);
    });
  });

  describe('性能测试', () => {
    it('应该快速执行查询', async () => {
      await mockProvider.initialize();
      
      const startTime = performance.now();
      
      await mockProvider.query('test query');
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(50); // 应该在50ms内完成
    });

    it('应该高效处理多个并发查询', async () => {
      await mockProvider.initialize();
      
      const startTime = performance.now();
      
      const queries = Array.from({ length: 100 }, (_, i) => 
        mockProvider.query(`query ${i}`)
      );
      
      await Promise.all(queries);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(500); // 应该在500ms内完成100个查询
    });

    it('应该快速初始化', async () => {
      const provider = new MockLLMProvider(mockOutputChannel, { isValidConfig: true });
      
      const startTime = performance.now();
      
      await provider.initialize();
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(20); // 应该在20ms内完成初始化
    });
  });
});