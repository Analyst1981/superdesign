#!/usr/bin/env node

/**
 * 配置管理器测试套件
 * 测试SuperDesign项目的配置管理功能
 * 
 * 创建日期: 2025-09-19
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { ConfigManager } from '../../src/core/config-manager';
import type { ProviderConfig } from '../../src/types/model';

// Mock VS Code API
const mockVscode = {
  workspace: {
    getConfiguration: jest.fn().mockReturnValue({
      get: jest.fn(),
      update: jest.fn(),
      has: jest.fn()
    }),
    onDidChangeConfiguration: jest.fn()
  },
  ConfigurationTarget: {
    Global: 1,
    Workspace: 2,
    WorkspaceFolder: 3
  }
};

// Mock文件系统
const mockFs = {
  promises: {
    writeFile: jest.fn(),
    readFile: jest.fn()
  }
};

// Mock扩展上下文
const mockExtensionContext = {
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
  extensionMode: 1
};

/**
 * 配置管理器测试
 */
describe('配置管理器测试', () => {
  let configManager: ConfigManager;

  beforeEach(() => {
    // 重置所有Mock
    jest.clearAllMocks();
    
    // 设置全局Mock
    (global as any).vscode = mockVscode;
    (global as any).require = () => mockFs;
    
    // 创建新的配置管理器实例
    configManager = ConfigManager.getInstance();
  });

  afterEach(() => {
    // 清理配置管理器状态
    configManager.clearAllConfigs();
  });

  describe('单例模式测试', () => {
    it('应该返回相同的实例', () => {
      const manager1 = ConfigManager.getInstance();
      const manager2 = ConfigManager.getInstance();
      
      expect(manager1).toBe(manager2);
    });

    it('应该正确初始化', () => {
      expect(configManager).toBeDefined();
      expect(configManager).toBeInstanceOf(ConfigManager);
    });
  });

  describe('初始化测试', () => {
    it('应该初始化扩展上下文', () => {
      // Mock配置读取
      mockVscode.workspace.getConfiguration.mockReturnValue({
        get: jest.fn().mockImplementation((key: string) => {
          const configMap: Record<string, any> = {
            'deepseekApiKey': 'sk-deepseek-test',
            'moonshotApiKey': 'sk-moonshot-test',
            'activeProvider': 'claude-api'
          };
          return configMap[key];
        }),
        update: jest.fn(),
        has: jest.fn()
      });

      configManager.initialize(mockExtensionContext);
      
      expect(configManager).toBeDefined();
      expect(mockVscode.workspace.onDidChangeConfiguration).toHaveBeenCalled();
    });

    it('应该监听配置变化', () => {
      configManager.initialize(mockExtensionContext);
      
      expect(mockExtensionContext.subscriptions.length).toBeGreaterThan(0);
    });
  });

  describe('配置加载测试', () => {
    it('应该从VS Code设置加载配置', async () => {
      // Mock配置数据
      const mockConfig = {
        get: jest.fn().mockImplementation((key: string) => {
          const configMap: Record<string, any> = {
            'deepseekApiKey': 'sk-deepseek-test',
            'deepseekBaseUrl': 'https://api.deepseek.com',
            'deepseekModelId': 'deepseek-chat',
            'deepseekMaxTokens': 8192,
            'deepseekTemperature': 0.6,
            'moonshotApiKey': 'sk-moonshot-test',
            'moonshotBaseUrl': 'https://api.moonshot.ai/v1',
            'moonshotModelId': 'kimi-k2-0905-preview',
            'moonshotMaxTokens': 16384,
            'moonshotTemperature': 0.6,
            'activeProvider': 'claude-api'
          };
          return configMap[key];
        }),
        update: jest.fn(),
        has: jest.fn()
      };

      mockVscode.workspace.getConfiguration.mockReturnValue(mockConfig);

      await configManager.loadFromVSCodeSettings();

      expect(configManager.getConfiguredProviders()).toContain('deepseek');
      expect(configManager.getConfiguredProviders()).toContain('moonshot');
      
      const deepseekConfig = configManager.getConfig('deepseek');
      expect(deepseekConfig).toEqual({
        apiKey: 'sk-deepseek-test',
        baseUrl: 'https://api.deepseek.com',
        modelId: 'deepseek-chat',
        maxTokens: 8192,
        temperature: 0.6
      });
    });

    it('应该跳过没有API密钥的配置', async () => {
      const mockConfig = {
        get: jest.fn().mockImplementation((key: string) => {
          const configMap: Record<string, any> = {
            'deepseekApiKey': '', // 空API密钥
            'moonshotApiKey': undefined, // 未定义
            'activeProvider': 'claude-api'
          };
          return configMap[key];
        }),
        update: jest.fn(),
        has: jest.fn()
      };

      mockVscode.workspace.getConfiguration.mockReturnValue(mockConfig);

      await configManager.loadFromVSCodeSettings();

      expect(configManager.getConfiguredProviders()).toHaveLength(0);
    });
  });

  describe('配置管理测试', () => {
    it('应该设置和获取配置', () => {
      const testConfig: ProviderConfig = {
        apiKey: 'sk-test-123',
        baseUrl: 'https://api.test.com',
        modelId: 'test-model',
        maxTokens: 4096,
        temperature: 0.7
      };

      configManager.setConfig('test-provider', testConfig);

      const retrievedConfig = configManager.getConfig('test-provider');
      expect(retrievedConfig).toEqual(testConfig);
    });

    it('应该检查提供商是否已配置', () => {
      const testConfig: ProviderConfig = {
        apiKey: 'sk-test-123',
        baseUrl: 'https://api.test.com',
        modelId: 'test-model',
        maxTokens: 4096,
        temperature: 0.7
      };

      expect(configManager.isProviderConfigured('test-provider')).toBe(false);

      configManager.setConfig('test-provider', testConfig);

      expect(configManager.isProviderConfigured('test-provider')).toBe(true);
    });

    it('应该获取所有已配置的提供商', () => {
      const testConfig1: ProviderConfig = {
        apiKey: 'sk-test-123',
        baseUrl: 'https://api.test1.com',
        modelId: 'test-model-1',
        maxTokens: 4096,
        temperature: 0.7
      };

      const testConfig2: ProviderConfig = {
        apiKey: 'sk-test-456',
        baseUrl: 'https://api.test2.com',
        modelId: 'test-model-2',
        maxTokens: 8192,
        temperature: 0.6
      };

      configManager.setConfig('provider1', testConfig1);
      configManager.setConfig('provider2', testConfig2);

      const configuredProviders = configManager.getConfiguredProviders();
      expect(configuredProviders).toContain('provider1');
      expect(configuredProviders).toContain('provider2');
      expect(configuredProviders).toHaveLength(2);
    });

    it('应该获取所有配置', () => {
      const testConfig: ProviderConfig = {
        apiKey: 'sk-test-123',
        baseUrl: 'https://api.test.com',
        modelId: 'test-model',
        maxTokens: 4096,
        temperature: 0.7
      };

      configManager.setConfig('test-provider', testConfig);

      const allConfigs = configManager.getAllConfigs();
      expect(allConfigs.has('test-provider')).toBe(true);
      expect(allConfigs.get('test-provider')).toEqual(testConfig);
    });
  });

  describe('激活提供商测试', () => {
    it('应该获取和设置激活的提供商', () => {
      // Mock配置
      mockVscode.workspace.getConfiguration.mockReturnValue({
        get: jest.fn().mockImplementation((key: string) => {
          if (key === 'activeProvider') return 'claude-api';
          return undefined;
        }),
        update: jest.fn(),
        has: jest.fn()
      });

      const activeProvider = configManager.getActiveProvider();
      expect(activeProvider).toBe('claude-api');

      // Mock update
      configManager.setActiveProvider('deepseek');
      
      expect(mockVscode.workspace.getConfiguration().update).toHaveBeenCalledWith(
        'activeProvider',
        'deepseek',
        mockVscode.ConfigurationTarget.Global
      );
    });
  });

  describe('自定义模型ID测试', () => {
    it('应该获取和设置自定义模型ID', () => {
      // Mock配置
      mockVscode.workspace.getConfiguration.mockReturnValue({
        get: jest.fn().mockImplementation((key: string) => {
          if (key === 'customModelId') return 'custom-model-123';
          return undefined;
        }),
        update: jest.fn(),
        has: jest.fn()
      });

      const customModelId = configManager.getCustomModelId();
      expect(customModelId).toBe('custom-model-123');

      // Mock update
      configManager.setCustomModelId('new-custom-model');
      
      expect(mockVscode.workspace.getConfiguration().update).toHaveBeenCalledWith(
        'customModelId',
        'new-custom-model',
        mockVscode.ConfigurationTarget.Global
      );
    });
  });

  describe('模型切换功能测试', () => {
    it('应该检查是否启用模型切换', () => {
      // Mock配置
      mockVscode.workspace.getConfiguration.mockReturnValue({
        get: jest.fn().mockImplementation((key: string) => {
          if (key === 'enableModelSwitching') return true;
          return undefined;
        }),
        update: jest.fn(),
        has: jest.fn()
      });

      const isEnabled = configManager.isModelSwitchingEnabled();
      expect(isEnabled).toBe(true);
    });
  });

  describe('配置删除测试', () => {
    it('应该删除提供商配置', async () => {
      const testConfig: ProviderConfig = {
        apiKey: 'sk-test-123',
        baseUrl: 'https://api.test.com',
        modelId: 'test-model',
        maxTokens: 4096,
        temperature: 0.7
      };

      configManager.setConfig('test-provider', testConfig);
      expect(configManager.isProviderConfigured('test-provider')).toBe(true);

      await configManager.removeProviderConfig('test-provider');
      
      expect(configManager.isProviderConfigured('test-provider')).toBe(false);
    });

    it('应该清除所有配置', async () => {
      const testConfig1: ProviderConfig = {
        apiKey: 'sk-test-123',
        baseUrl: 'https://api.test1.com',
        modelId: 'test-model-1',
        maxTokens: 4096,
        temperature: 0.7
      };

      const testConfig2: ProviderConfig = {
        apiKey: 'sk-test-456',
        baseUrl: 'https://api.test2.com',
        modelId: 'test-model-2',
        maxTokens: 8192,
        temperature: 0.6
      };

      configManager.setConfig('provider1', testConfig1);
      configManager.setConfig('provider2', testConfig2);

      expect(configManager.getConfiguredProviders()).toHaveLength(2);

      await configManager.clearAllConfigs();
      
      expect(configManager.getConfiguredProviders()).toHaveLength(0);
    });
  });

  describe('配置导出导入测试', () => {
    it('应该导出配置到文件', async () => {
      const testConfig: ProviderConfig = {
        apiKey: 'sk-test-123',
        baseUrl: 'https://api.test.com',
        modelId: 'test-model',
        maxTokens: 4096,
        temperature: 0.7
      };

      configManager.setConfig('test-provider', testConfig);

      // Mock配置
      mockVscode.workspace.getConfiguration.mockReturnValue({
        get: jest.fn().mockImplementation((key: string) => {
          if (key === 'activeProvider') return 'test-provider';
          if (key === 'customModelId') return 'custom-model-123';
          return undefined;
        }),
        update: jest.fn(),
        has: jest.fn()
      });

      await configManager.exportConfigs('/test/config.json');

      expect(mockFs.promises.writeFile).toHaveBeenCalledWith(
        '/test/config.json',
        JSON.stringify({
          activeProvider: 'test-provider',
          customModelId: 'custom-model-123',
          providers: {
            'test-provider': testConfig
          }
        }, null, 2)
      );
    });

    it('应该从文件导入配置', async () => {
      const importData = {
        activeProvider: 'test-provider',
        customModelId: 'custom-model-123',
        providers: {
          'test-provider': {
            apiKey: 'sk-test-123',
            baseUrl: 'https://api.test.com',
            modelId: 'test-model',
            maxTokens: 4096,
            temperature: 0.7
          }
        }
      };

      mockFs.promises.readFile.mockResolvedValue(JSON.stringify(importData));

      await configManager.importConfigs('/test/config.json');

      expect(configManager.getActiveProvider()).toBe('test-provider');
      expect(configManager.getCustomModelId()).toBe('custom-model-123');
      expect(configManager.isProviderConfigured('test-provider')).toBe(true);
    });

    it('应该处理导入错误', async () => {
      mockFs.promises.readFile.mockRejectedValue(new Error('File not found'));

      await expect(configManager.importConfigs('/test/config.json')).rejects.toThrow();
    });
  });

  describe('配置统计测试', () => {
    it('应该获取配置统计信息', () => {
      const testConfig1: ProviderConfig = {
        apiKey: 'sk-test-123',
        baseUrl: 'https://api.test1.com',
        modelId: 'test-model-1',
        maxTokens: 4096,
        temperature: 0.7
      };

      const testConfig2: ProviderConfig = {
        apiKey: 'sk-test-456',
        baseUrl: 'https://api.test2.com',
        modelId: 'test-model-2',
        maxTokens: 8192,
        temperature: 0.6
      };

      configManager.setConfig('provider1', testConfig1);
      configManager.setConfig('provider2', testConfig2);

      // Mock配置
      mockVscode.workspace.getConfiguration.mockReturnValue({
        get: jest.fn().mockImplementation((key: string) => {
          if (key === 'activeProvider') return 'provider1';
          if (key === 'customModelId') return 'custom-model-123';
          return undefined;
        }),
        update: jest.fn(),
        has: jest.fn()
      });

      const stats = configManager.getStats();

      expect(stats.configuredProviders).toBe(2);
      expect(stats.activeProvider).toBe('provider1');
      expect(stats.customModelId).toBe('custom-model-123');
      expect(stats.providerNames).toContain('provider1');
      expect(stats.providerNames).toContain('provider2');
    });
  });

  describe('错误处理测试', () => {
    it('应该处理保存配置时的错误', async () => {
      const testConfig: ProviderConfig = {
        apiKey: 'sk-test-123',
        baseUrl: 'https://api.test.com',
        modelId: 'test-model',
        maxTokens: 4096,
        temperature: 0.7
      };

      // Mock update失败
      mockVscode.workspace.getConfiguration.mockReturnValue({
        get: jest.fn(),
        update: jest.fn().mockRejectedValue(new Error('Update failed')),
        has: jest.fn()
      });

      await expect(configManager.setConfig('test-provider', testConfig)).resolves.not.toThrow();
    });

    it('应该处理删除配置时的错误', async () => {
      // Mock update失败
      mockVscode.workspace.getConfiguration.mockReturnValue({
        get: jest.fn(),
        update: jest.fn().mockRejectedValue(new Error('Delete failed')),
        has: jest.fn()
      });

      await expect(configManager.removeProviderConfig('test-provider')).resolves.not.toThrow();
    });
  });

  describe('性能测试', () => {
    it('应该快速加载配置', async () => {
      // Mock大量配置数据
      const mockConfig = {
        get: jest.fn().mockImplementation((key: string) => {
          if (key.endsWith('ApiKey')) return `sk-test-${key}`;
          if (key.endsWith('BaseUrl')) return 'https://api.test.com';
          if (key.endsWith('ModelId')) return 'test-model';
          if (key.endsWith('MaxTokens')) return 4096;
          if (key.endsWith('Temperature')) return 0.7;
          return undefined;
        }),
        update: jest.fn(),
        has: jest.fn()
      };

      mockVscode.workspace.getConfiguration.mockReturnValue(mockConfig);

      const startTime = performance.now();
      await configManager.loadFromVSCodeSettings();
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
    });

    it('应该高效处理多个配置操作', () => {
      const startTime = performance.now();

      // 执行大量配置操作
      for (let i = 0; i < 1000; i++) {
        const testConfig: ProviderConfig = {
          apiKey: `sk-test-${i}`,
          baseUrl: 'https://api.test.com',
          modelId: 'test-model',
          maxTokens: 4096,
          temperature: 0.7
        };
        configManager.setConfig(`provider-${i}`, testConfig);
      }

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200); // 应该在200ms内完成1000次操作
    });
  });
});