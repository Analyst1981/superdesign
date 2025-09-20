#!/usr/bin/env node

/**
 * 配置类型测试套件
 * 测试SuperDesign项目的配置相关类型定义
 * 
 * 创建日期: 2025-09-19
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import * as ProviderSettings from '../../src/types/provider-settings';
import * as ModelConfig from '../../src/types/model-config';
import * as EnhancedProviderSettings from '../../src/types/enhanced-provider-settings';
import * as EnhancedGlobalSettings from '../../src/types/enhanced-global-settings';

/**
 * ProviderSettings类型测试
 */
describe('ProviderSettings类型测试', () => {
  it('应该定义所有支持的提供商类型', () => {
    const expectedProviders = [
      'claude-api',
      'claude-code',
      'openai',
      'openrouter',
      'deepseek',
      'moonshot',
      'doubao',
      'qwen',
      'glm',
      'zhipu',
      'modelscope'
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
      temperature: 0.7,
      timeout: 30000
    };

    expect(mockProviderConfig).toHaveProperty('apiKey');
    expect(mockProviderConfig).toHaveProperty('baseUrl');
    expect(mockProviderConfig).toHaveProperty('model');
    expect(mockProviderConfig).toHaveProperty('maxTokens');
    expect(mockProviderConfig).toHaveProperty('temperature');
    expect(mockProviderConfig).toHaveProperty('timeout');
  });

  it('温度参数应该在有效范围内', () => {
    const validTemperatures = [0, 0.1, 0.5, 1.0, 1.5, 2.0];
    const invalidTemperatures = [-0.1, 2.1, -1, 3];

    validTemperatures.forEach(temp => {
      expect(temp).toBeGreaterThanOrEqual(0);
      expect(temp).toBeLessThanOrEqual(2);
    });

    invalidTemperatures.forEach(temp => {
      expect(temp < 0 || temp > 2).toBe(true);
    });
  });

  it('最大令牌数应该是正整数', () => {
    const validTokens = [1, 100, 4096, 8192, 16384, 32768];
    const invalidTokens = [0, -1, -100, 0.5];

    validTokens.forEach(tokens => {
      expect(Number.isInteger(tokens)).toBe(true);
      expect(tokens).toBeGreaterThan(0);
    });

    invalidTokens.forEach(tokens => {
      expect(tokens <= 0 || !Number.isInteger(tokens)).toBe(true);
    });
  });
});

/**
 * ModelConfig类型测试
 */
describe('ModelConfig类型测试', () => {
  it('应该定义模型配置接口', () => {
    const mockModelConfig: ModelConfig.ModelConfig = {
      id: 'claude-3-5-sonnet-20241022',
      name: 'Claude 3.5 Sonnet',
      provider: 'claude-api',
      type: 'chat',
      maxTokens: 4096,
      supportsStreaming: true,
      supportsVision: true,
      supportsTools: true,
      pricing: {
        input: 0.003,
        output: 0.015
      }
    };

    expect(mockModelConfig).toHaveProperty('id');
    expect(mockModelConfig).toHaveProperty('name');
    expect(mockModelConfig).toHaveProperty('provider');
    expect(mockModelConfig).toHaveProperty('type');
    expect(mockModelConfig).toHaveProperty('maxTokens');
    expect(mockModelConfig).toHaveProperty('supportsStreaming');
    expect(mockModelConfig).toHaveProperty('supportsVision');
    expect(mockModelConfig).toHaveProperty('supportsTools');
    expect(mockModelConfig).toHaveProperty('pricing');
  });

  it('模型类型应该是有效的', () => {
    const validModelTypes: ModelConfig.ModelType[] = [
      'text',
      'chat',
      'completion',
      'embedding',
      'vision',
      'audio',
      'code'
    ];

    validModelTypes.forEach(type => {
      expect(typeof type).toBe('string');
    });
  });

  it('定价信息应该是有效的数字', () => {
    const validPricing = {
      input: 0.003,
      output: 0.015
    };

    expect(validPricing.input).toBeGreaterThan(0);
    expect(validPricing.output).toBeGreaterThan(0);
    expect(typeof validPricing.input).toBe('number');
    expect(typeof validPricing.output).toBe('number');
  });
});

/**
 * EnhancedProviderSettings类型测试
 */
describe('EnhancedProviderSettings类型测试', () => {
  it('应该定义增强的提供商配置', () => {
    const mockEnhancedConfig: EnhancedProviderSettings.EnhancedProviderSettings = {
      providers: {
        'claude-api': {
          apiKey: 'sk-test-123',
          model: 'claude-3-5-sonnet-20241022',
          baseUrl: 'https://api.anthropic.com',
          maxTokens: 4096,
          temperature: 0.7,
          timeout: 30000
        },
        'openai': {
          apiKey: 'sk-openai-test-123',
          model: 'gpt-4',
          baseUrl: 'https://api.openai.com/v1',
          maxTokens: 4096,
          temperature: 0.7,
          timeout: 30000
        }
      },
      activeProvider: 'claude-api',
      enableModelSwitching: true,
      showModelInfo: true
    };

    expect(mockEnhancedConfig).toHaveProperty('providers');
    expect(mockEnhancedConfig).toHaveProperty('activeProvider');
    expect(mockEnhancedConfig).toHaveProperty('enableModelSwitching');
    expect(mockEnhancedConfig).toHaveProperty('showModelInfo');
    expect(mockEnhancedConfig.providers).toHaveProperty('claude-api');
    expect(mockEnhancedConfig.providers).toHaveProperty('openai');
  });

  it('应该验证提供商配置的完整性', () => {
    const providerConfig = {
      apiKey: 'test-key',
      model: 'test-model',
      baseUrl: 'https://api.test.com',
      maxTokens: 4096,
      temperature: 0.7
    };

    expect(providerConfig.apiKey).toBeDefined();
    expect(providerConfig.model).toBeDefined();
    expect(providerConfig.baseUrl).toBeDefined();
    expect(providerConfig.maxTokens).toBeDefined();
    expect(providerConfig.temperature).toBeDefined();
  });
});

/**
 * EnhancedGlobalSettings类型测试
 */
describe('EnhancedGlobalSettings类型测试', () => {
  it('应该定义全局设置配置', () => {
    const mockGlobalSettings: EnhancedGlobalSettings.EnhancedGlobalSettings = {
      general: {
        enableModelSwitching: true,
        showModelInfo: true,
        autoSave: true,
        debugMode: false
      },
      ui: {
        theme: 'dark',
        fontSize: 14,
        lineHeight: 1.5,
        fontFamily: 'monospace'
      },
      performance: {
        maxConcurrentRequests: 3,
        requestTimeout: 30000,
        cacheSize: 100
      },
      security: {
        storeApiKeySecurely: true,
        enableAuditLog: false,
        maxHistoryLength: 1000
      }
    };

    expect(mockGlobalSettings).toHaveProperty('general');
    expect(mockGlobalSettings).toHaveProperty('ui');
    expect(mockGlobalSettings).toHaveProperty('performance');
    expect(mockGlobalSettings).toHaveProperty('security');
  });

  it('UI设置应该包含有效的值', () => {
    const validThemes = ['dark', 'light', 'system'];
    const validFontSizes = [12, 14, 16, 18, 20];
    const validLineHeights = [1.2, 1.4, 1.5, 1.6, 1.8];

    validThemes.forEach(theme => {
      expect(['dark', 'light', 'system']).toContain(theme);
    });

    validFontSizes.forEach(size => {
      expect(size).toBeGreaterThan(0);
      expect(size).toBeLessThan(50);
    });

    validLineHeights.forEach(height => {
      expect(height).toBeGreaterThan(1);
      expect(height).toBeLessThan(3);
    });
  });

  it('性能设置应该包含合理的值', () => {
    const performanceSettings = {
      maxConcurrentRequests: 3,
      requestTimeout: 30000,
      cacheSize: 100
    };

    expect(performanceSettings.maxConcurrentRequests).toBeGreaterThan(0);
    expect(performanceSettings.maxConcurrentRequests).toBeLessThanOrEqual(10);
    expect(performanceSettings.requestTimeout).toBeGreaterThan(0);
    expect(performanceSettings.cacheSize).toBeGreaterThan(0);
  });
});

/**
 * 配置验证测试
 */
describe('配置验证测试', () => {
  it('应该验证API密钥格式', () => {
    const validApiKeys = [
      'sk-123456789',
      'sk-test-123456789',
      'sk-ant-123456789',
      'sk-openai-123456789'
    ];

    const invalidApiKeys = [
      '',
      '123',
      'sk-',
      'invalid-key',
      'test-key'
    ];

    validApiKeys.forEach(key => {
      expect(key.startsWith('sk-')).toBe(true);
      expect(key.length).toBeGreaterThan(10);
    });

    invalidApiKeys.forEach(key => {
      expect(key.startsWith('sk-')).toBe(false);
    });
  });

  it('应该验证URL格式', () => {
    const validUrls = [
      'https://api.anthropic.com',
      'https://api.openai.com/v1',
      'https://api.deepseek.com',
      'https://dashscope.aliyuncs.com/api/v1'
    ];

    const invalidUrls = [
      '',
      'not-a-url',
      'http://',
      'https://',
      'ftp://test.com'
    ];

    validUrls.forEach(url => {
      expect(url.startsWith('https://')).toBe(true);
      expect(url.includes('.')).toBe(true);
    });

    invalidUrls.forEach(url => {
      expect(!url.startsWith('https://') || !url.includes('.')).toBe(true);
    });
  });

  it('应该验证模型ID格式', () => {
    const validModelIds = [
      'claude-3-5-sonnet-20241022',
      'gpt-4',
      'deepseek-chat',
      'qwen-turbo',
      'glm-4-plus'
    ];

    const invalidModelIds = [
      '',
      '123',
      'model',
      'test-model'
    ];

    validModelIds.forEach(modelId => {
      expect(modelId.length).toBeGreaterThan(3);
      expect(/[a-z0-9-]/.test(modelId)).toBe(true);
    });

    invalidModelIds.forEach(modelId => {
      expect(modelId.length <= 3 || !/[a-z0-9-]/.test(modelId)).toBe(true);
    });
  });
});

/**
 * 配置转换测试
 */
describe('配置转换测试', () => {
  it('应该能够将旧配置转换为新格式', () => {
    const oldConfig = {
      anthropicApiKey: 'sk-test-123',
      openaiApiKey: 'sk-openai-test-123',
      deepSeekApiKey: 'sk-deepseek-test-123',
      activeProvider: 'claude-api',
      enableModelSwitching: true
    };

    const newConfig = {
      providers: {
        'claude-api': {
          apiKey: oldConfig.anthropicApiKey,
          model: 'claude-3-5-sonnet-20241022',
          baseUrl: 'https://api.anthropic.com',
          maxTokens: 4096,
          temperature: 0.7
        },
        'openai': {
          apiKey: oldConfig.openaiApiKey,
          model: 'gpt-4',
          baseUrl: 'https://api.openai.com/v1',
          maxTokens: 4096,
          temperature: 0.7
        },
        'deepseek': {
          apiKey: oldConfig.deepSeekApiKey,
          model: 'deepseek-chat',
          baseUrl: 'https://api.deepseek.com',
          maxTokens: 8192,
          temperature: 0.6
        }
      },
      activeProvider: oldConfig.activeProvider,
      enableModelSwitching: oldConfig.enableModelSwitching,
      showModelInfo: true
    };

    expect(newConfig.providers['claude-api'].apiKey).toBe(oldConfig.anthropicApiKey);
    expect(newConfig.providers['openai'].apiKey).toBe(oldConfig.openaiApiKey);
    expect(newConfig.providers['deepseek'].apiKey).toBe(oldConfig.deepSeekApiKey);
    expect(newConfig.activeProvider).toBe(oldConfig.activeProvider);
    expect(newConfig.enableModelSwitching).toBe(oldConfig.enableModelSwitching);
  });

  it('应该能够序列化和反序列化配置', () => {
    const config = {
      providers: {
        'claude-api': {
          apiKey: 'sk-test-123',
          model: 'claude-3-5-sonnet-20241022',
          baseUrl: 'https://api.anthropic.com',
          maxTokens: 4096,
          temperature: 0.7
        }
      },
      activeProvider: 'claude-api',
      enableModelSwitching: true,
      showModelInfo: true
    };

    const serialized = JSON.stringify(config);
    const deserialized = JSON.parse(serialized);

    expect(deserialized).toEqual(config);
    expect(deserialized.activeProvider).toBe(config.activeProvider);
    expect(deserialized.enableModelSwitching).toBe(config.enableModelSwitching);
  });
});

/**
 * 配置性能测试
 */
describe('配置性能测试', () => {
  it('应该快速验证配置', () => {
    const startTime = performance.now();
    
    // 创建大量配置进行验证
    for (let i = 0; i < 1000; i++) {
      const config = {
        providers: {
          'claude-api': {
            apiKey: `sk-test-${i}`,
            model: 'claude-3-5-sonnet-20241022',
            baseUrl: 'https://api.anthropic.com',
            maxTokens: 4096,
            temperature: 0.7
          }
        },
        activeProvider: 'claude-api',
        enableModelSwitching: true,
        showModelInfo: true
      };

      expect(config.providers['claude-api'].apiKey).toBe(`sk-test-${i}`);
      expect(config.activeProvider).toBe('claude-api');
    }
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    expect(executionTime).toBeLessThan(100); // 应该在100ms内完成
  });

  it('应该高效处理配置转换', () => {
    const startTime = performance.now();
    
    // 执行大量配置转换
    for (let i = 0; i < 500; i++) {
      const oldConfig = {
        anthropicApiKey: `sk-test-${i}`,
        openaiApiKey: `sk-openai-${i}`,
        activeProvider: 'claude-api',
        enableModelSwitching: true
      };

      const newConfig = {
        providers: {
          'claude-api': {
            apiKey: oldConfig.anthropicApiKey,
            model: 'claude-3-5-sonnet-20241022',
            baseUrl: 'https://api.anthropic.com',
            maxTokens: 4096,
            temperature: 0.7
          }
        },
        activeProvider: oldConfig.activeProvider,
        enableModelSwitching: oldConfig.enableModelSwitching,
        showModelInfo: true
      };

      expect(newConfig.providers['claude-api'].apiKey).toBe(oldConfig.anthropicApiKey);
    }
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    expect(executionTime).toBeLessThan(50); // 应该在50ms内完成
  });
});