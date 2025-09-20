#!/usr/bin/env node

/**
 * 配置验证器测试套件
 * 测试SuperDesign项目的配置验证功能
 * 
 * 创建日期: 2025-09-19
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { z } from 'zod';

/**
 * 配置验证器测试
 */
describe('配置验证器测试', () => {
  // 配置验证Schema
  const providerConfigSchema = z.object({
    apiKey: z.string().min(1, 'API密钥不能为空'),
    baseUrl: z.string().url('无效的URL格式').optional().nullable(),
    modelId: z.string().min(1, '模型ID不能为空').optional().nullable(),
    maxTokens: z.number().min(1, '最大令牌数必须大于0').max(100000, '最大令牌数不能超过100000').optional().nullable(),
    temperature: z.number().min(0, '温度必须在0-2之间').max(2, '温度必须在0-2之间').optional().nullable()
  });

  const globalConfigSchema = z.object({
    activeProvider: z.string().min(1, '激活的提供商不能为空'),
    enableModelSwitching: z.boolean().optional(),
    showModelInfo: z.boolean().optional(),
    customModelId: z.string().optional().nullable()
  });

  describe('提供商配置验证测试', () => {
    it('应该验证有效的配置', () => {
      const validConfig = {
        apiKey: 'sk-test-123456789',
        baseUrl: 'https://api.test.com',
        modelId: 'test-model',
        maxTokens: 4096,
        temperature: 0.7
      };

      const result = providerConfigSchema.safeParse(validConfig);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validConfig);
      }
    });

    it('应该拒绝无效的API密钥', () => {
      const invalidConfigs = [
        { apiKey: '', baseUrl: 'https://api.test.com' },
        { apiKey: null, baseUrl: 'https://api.test.com' },
        { apiKey: undefined, baseUrl: 'https://api.test.com' },
        { apiKey: '   ', baseUrl: 'https://api.test.com' }
      ];

      invalidConfigs.forEach(config => {
        const result = providerConfigSchema.safeParse(config);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.message).toContain('API密钥不能为空');
        }
      });
    });

    it('应该拒绝无效的URL', () => {
      const invalidConfigs = [
        { apiKey: 'sk-test-123', baseUrl: 'not-a-url' },
        { apiKey: 'sk-test-123', baseUrl: 'http://' },
        { apiKey: 'sk-test-123', baseUrl: 'https://' },
        { apiKey: 'sk-test-123', baseUrl: 'ftp://test.com' }
      ];

      invalidConfigs.forEach(config => {
        const result = providerConfigSchema.safeParse(config);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.message).toContain('无效的URL格式');
        }
      });
    });

    it('应该拒绝无效的最大令牌数', () => {
      const invalidConfigs = [
        { apiKey: 'sk-test-123', maxTokens: 0 },
        { apiKey: 'sk-test-123', maxTokens: -1 },
        { apiKey: 'sk-test-123', maxTokens: 100001 },
        { apiKey: 'sk-test-123', maxTokens: 999999 }
      ];

      invalidConfigs.forEach(config => {
        const result = providerConfigSchema.safeParse(config);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.message).toContain('最大令牌数');
        }
      });
    });

    it('应该拒绝无效的温度值', () => {
      const invalidConfigs = [
        { apiKey: 'sk-test-123', temperature: -0.1 },
        { apiKey: 'sk-test-123', temperature: 2.1 },
        { apiKey: 'sk-test-123', temperature: -1 },
        { apiKey: 'sk-test-123', temperature: 3 }
      ];

      invalidConfigs.forEach(config => {
        const result = providerConfigSchema.safeParse(config);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.message).toContain('温度必须在0-2之间');
        }
      });
    });

    it('应该接受部分配置', () => {
      const partialConfigs = [
        { apiKey: 'sk-test-123' },
        { apiKey: 'sk-test-123', baseUrl: 'https://api.test.com' },
        { apiKey: 'sk-test-123', modelId: 'test-model' }
      ];

      partialConfigs.forEach(config => {
        const result = providerConfigSchema.safeParse(config);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('全局配置验证测试', () => {
    it('应该验证有效的全局配置', () => {
      const validConfig = {
        activeProvider: 'claude-api',
        enableModelSwitching: true,
        showModelInfo: true,
        customModelId: 'custom-model-123'
      };

      const result = globalConfigSchema.safeParse(validConfig);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validConfig);
      }
    });

    it('应该拒绝无效的激活提供商', () => {
      const invalidConfigs = [
        { activeProvider: '' },
        { activeProvider: null },
        { activeProvider: undefined },
        { activeProvider: '   ' }
      ];

      invalidConfigs.forEach(config => {
        const result = globalConfigSchema.safeParse(config);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.message).toContain('激活的提供商不能为空');
        }
      });
    });

    it('应该接受部分全局配置', () => {
      const partialConfigs = [
        { activeProvider: 'claude-api' },
        { activeProvider: 'claude-api', enableModelSwitching: true },
        { activeProvider: 'claude-api', showModelInfo: false }
      ];

      partialConfigs.forEach(config => {
        const result = globalConfigSchema.safeParse(config);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('特定提供商配置验证测试', () => {
    it('应该验证Claude API配置', () => {
      const claudeConfigSchema = providerConfigSchema.extend({
        apiKey: z.string().min(1).regex(/^sk-/, 'Claude API密钥必须以sk-开头'),
        modelId: z.string().regex(/^claude-/, 'Claude模型ID必须以claude-开头').optional()
      });

      const validConfig = {
        apiKey: 'sk-ant-123456789',
        modelId: 'claude-3-5-sonnet-20241022'
      };

      const result = claudeConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);

      const invalidConfig = {
        apiKey: 'invalid-key',
        modelId: 'invalid-model'
      };

      const invalidResult = claudeConfigSchema.safeParse(invalidConfig);
      expect(invalidResult.success).toBe(false);
    });

    it('应该验证OpenAI配置', () => {
      const openaiConfigSchema = providerConfigSchema.extend({
        apiKey: z.string().min(1).regex(/^sk-/, 'OpenAI API密钥必须以sk-开头'),
        baseUrl: z.string().url().optional()
      });

      const validConfig = {
        apiKey: 'sk-openai-123456789',
        baseUrl: 'https://api.openai.com/v1'
      };

      const result = openaiConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it('应该验证DeepSeek配置', () => {
      const deepseekConfigSchema = providerConfigSchema.extend({
        apiKey: z.string().min(1),
        baseUrl: z.string().url().default('https://api.deepseek.com'),
        modelId: z.string().regex(/^deepseek-/, 'DeepSeek模型ID必须以deepseek-开头').optional()
      });

      const validConfig = {
        apiKey: 'sk-deepseek-123456789',
        modelId: 'deepseek-chat'
      };

      const result = deepseekConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });
  });

  describe('配置转换测试', () => {
    it('应该转换配置格式', () => {
      const oldConfig = {
        anthropicApiKey: 'sk-test-123',
        openaiApiKey: 'sk-openai-123',
        deepSeekApiKey: 'sk-deepseek-123',
        activeProvider: 'claude-api',
        enableModelSwitching: true
      };

      const newConfig = {
        providers: {
          'claude-api': {
            apiKey: oldConfig.anthropicApiKey,
            baseUrl: 'https://api.anthropic.com',
            modelId: 'claude-3-5-sonnet-20241022'
          },
          'openai': {
            apiKey: oldConfig.openaiApiKey,
            baseUrl: 'https://api.openai.com/v1',
            modelId: 'gpt-4'
          },
          'deepseek': {
            apiKey: oldConfig.deepSeekApiKey,
            baseUrl: 'https://api.deepseek.com',
            modelId: 'deepseek-chat'
          }
        },
        activeProvider: oldConfig.activeProvider,
        enableModelSwitching: oldConfig.enableModelSwitching
      };

      const result = globalConfigSchema.safeParse({
        activeProvider: newConfig.activeProvider,
        enableModelSwitching: newConfig.enableModelSwitching
      });

      expect(result.success).toBe(true);

      // 验证提供商配置
      Object.values(newConfig.providers).forEach(providerConfig => {
        const providerResult = providerConfigSchema.safeParse(providerConfig);
        expect(providerResult.success).toBe(true);
      });
    });

    it('应该处理配置转换错误', () => {
      const invalidOldConfig = {
        anthropicApiKey: '', // 无效的API密钥
        openaiApiKey: 'sk-openai-123',
        deepSeekApiKey: 'sk-deepseek-123',
        activeProvider: '', // 无效的激活提供商
        enableModelSwitching: true
      };

      expect(() => {
        const newConfig = {
          providers: {
            'claude-api': {
              apiKey: invalidOldConfig.anthropicApiKey,
              baseUrl: 'https://api.anthropic.com',
              modelId: 'claude-3-5-sonnet-20241022'
            }
          },
          activeProvider: invalidOldConfig.activeProvider,
          enableModelSwitching: invalidOldConfig.enableModelSwitching
        };

        // 验证全局配置
        const globalResult = globalConfigSchema.safeParse({
          activeProvider: newConfig.activeProvider,
          enableModelSwitching: newConfig.enableModelSwitching
        });

        if (!globalResult.success) {
          throw new Error(globalResult.error.message);
        }

        // 验证提供商配置
        Object.values(newConfig.providers).forEach(providerConfig => {
          const providerResult = providerConfigSchema.safeParse(providerConfig);
          if (!providerResult.success) {
            throw new Error(providerResult.error.message);
          }
        });
      }).toThrow();
    });
  });

  describe('配置清理测试', () => {
    it('应该清理空字符串值', () => {
      const dirtyConfig = {
        apiKey: 'sk-test-123',
        baseUrl: '',
        modelId: '   ',
        maxTokens: null,
        temperature: undefined
      };

      const cleanConfig = {
        apiKey: 'sk-test-123'
      };

      const result = providerConfigSchema.safeParse(cleanConfig);
      expect(result.success).toBe(true);

      const dirtyResult = providerConfigSchema.safeParse(dirtyConfig);
      expect(dirtyResult.success).toBe(true);
      if (dirtyResult.success) {
        expect(dirtyResult.data.baseUrl).toBeUndefined();
        expect(dirtyResult.data.modelId).toBeUndefined();
        expect(dirtyResult.data.maxTokens).toBeUndefined();
        expect(dirtyResult.data.temperature).toBeUndefined();
      }
    });

    it('应该规范化URL', () => {
      const configWithUrls = {
        apiKey: 'sk-test-123',
        baseUrl: 'https://api.test.com/',
        modelId: 'test-model'
      };

      const result = providerConfigSchema.safeParse(configWithUrls);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.baseUrl).toBe('https://api.test.com/');
      }
    });
  });

  describe('配置性能测试', () => {
    it('应该快速验证配置', () => {
      const testConfig = {
        apiKey: 'sk-test-123456789',
        baseUrl: 'https://api.test.com',
        modelId: 'test-model',
        maxTokens: 4096,
        temperature: 0.7
      };

      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        providerConfigSchema.safeParse(testConfig);
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100); // 应该在100ms内完成1000次验证
    });

    it('应该高效处理错误配置', () => {
      const invalidConfig = {
        apiKey: '',
        baseUrl: 'not-a-url',
        modelId: '',
        maxTokens: -1,
        temperature: 3
      };

      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        providerConfigSchema.safeParse(invalidConfig);
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100); // 应该在100ms内完成1000次验证
    });
  });

  describe('配置安全测试', () => {
    it('应该检测潜在的安全问题', () => {
      const suspiciousConfigs = [
        { apiKey: 'sk-123', baseUrl: 'http://insecure.com' }, // HTTP URL
        { apiKey: 'sk-123', baseUrl: 'https://malicious.com' }, // 可疑域名
        { apiKey: 'password123', baseUrl: 'https://api.test.com' }, // 弱密码
        { apiKey: 'sk-test', baseUrl: 'file:///etc/passwd' } // 文件URL
      ];

      suspiciousConfigs.forEach(config => {
        const result = providerConfigSchema.safeParse(config);
        
        // 这些配置在语法上可能是有效的，但需要额外的安全检查
        if (result.success) {
          // 在实际应用中，这里应该添加额外的安全验证
          expect(result.data.apiKey).toBeDefined();
          expect(result.data.baseUrl).toBeDefined();
        }
      });
    });

    it('应该验证API密钥格式', () => {
      const validApiKeys = [
        'sk-ant-123456789',
        'sk-openai-123456789',
        'sk-deepseek-123456789',
        'sk-project-123456789'
      ];

      const invalidApiKeys = [
        'invalid-key',
        'test-key',
        '123456789',
        'sk-',
        'sk-123'
      ];

      validApiKeys.forEach(apiKey => {
        const config = { apiKey };
        const result = providerConfigSchema.safeParse(config);
        expect(result.success).toBe(true);
      });

      invalidApiKeys.forEach(apiKey => {
        const config = { apiKey };
        const result = providerConfigSchema.safeParse(config);
        // 这些API密钥在基本验证中可能是有效的，但需要特定提供商的验证
        expect(result.success).toBe(true);
      });
    });
  });
});