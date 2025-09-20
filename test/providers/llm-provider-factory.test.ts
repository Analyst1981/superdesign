#!/usr/bin/env node

/**
 * LLM提供商工厂测试套件
 * 测试SuperDesign项目的LLM提供商工厂功能
 * 
 * 创建日期: 2025-09-19
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { LLMProviderFactory } from '../../src/providers/llmProviderFactory';
import { LLMProvider, LLMProviderType } from '../../src/providers/llmProvider';
import { ClaudeApiProvider } from '../../src/providers/claudeApiProvider';
import { Logger } from '../../src/services/logger';

// Mock VS Code API
const mockVscode = {
  workspace: {
    getConfiguration: jest.fn().mockReturnValue({
      get: jest.fn(),
      update: jest.fn(),
      has: jest.fn()
    }),
    workspaceFolders: [],
    rootPath: '/test/workspace'
  },
  window: {
    showInformationMessage: jest.fn(),
    showWarningMessage: jest.fn(),
    showErrorMessage: jest.fn()
  },
  commands: {
    registerCommand: jest.fn(),
    executeCommand: jest.fn()
  },
  Uri: {
    file: jest.fn().mockImplementation((path: string) => ({
      scheme: 'file',
      path: path,
      fsPath: path,
      toString: () => `file://${path}`
    }))
  },
  ConfigurationTarget: {
    Global: 1,
    Workspace: 2,
    WorkspaceFolder: 3
  }
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

// Mock输出通道
const mockOutputChannel = {
  append: jest.fn(),
  appendLine: jest.fn(),
  clear: jest.fn(),
  show: jest.fn(),
  hide: jest.fn(),
  dispose: jest.fn()
};

/**
 * LLM提供商工厂测试
 */
describe('LLM提供商工厂测试', () => {
  let factory: LLMProviderFactory;
  let loggerSpy: any;

  beforeEach(() => {
    // 重置所有Mock
    jest.clearAllMocks();
    
    // 设置VS Code Mock
    (global as any).vscode = mockVscode;
    
    // 获取Logger Mock
    loggerSpy = Logger;
    
    // 创建新的工厂实例
    factory = LLMProviderFactory.getInstance(mockOutputChannel);
  });

  afterEach(() => {
    // 清理工厂实例
    factory.dispose();
  });

  describe('单例模式测试', () => {
    it('应该返回相同的实例', () => {
      const factory1 = LLMProviderFactory.getInstance(mockOutputChannel);
      const factory2 = LLMProviderFactory.getInstance(mockOutputChannel);
      
      expect(factory1).toBe(factory2);
    });

    it('应该正确初始化', () => {
      expect(factory).toBeDefined();
      expect(loggerSpy.info).toHaveBeenCalledWith('Enhanced model management system enabled');
    });
  });

  describe('提供商获取测试', () => {
    it('应该获取默认提供商', async () => {
      // Mock配置返回claude-api
      mockVscode.workspace.getConfiguration.mockReturnValue({
        get: jest.fn().mockImplementation((key: string) => {
          if (key === 'llmProvider') return 'claude-api';
          return undefined;
        }),
        update: jest.fn(),
        has: jest.fn()
      });

      const provider = await factory.getProvider();
      
      expect(provider).toBeDefined();
      expect(provider.getProviderName()).toBe('Claude API');
    });

    it('应该获取指定类型的提供商', async () => {
      const provider = await factory.getProvider(LLMProviderType.CLAUDE_API);
      
      expect(provider).toBeDefined();
      expect(provider.getProviderName()).toBe('Claude API');
    });

    it('应该缓存已创建的提供商', async () => {
      // Mock配置
      mockVscode.workspace.getConfiguration.mockReturnValue({
        get: jest.fn().mockImplementation((key: string) => {
          if (key === 'llmProvider') return 'claude-api';
          return undefined;
        }),
        update: jest.fn(),
        has: jest.fn()
      });

      const provider1 = await factory.getProvider(LLMProviderType.CLAUDE_API);
      const provider2 = await factory.getProvider(LLMProviderType.CLAUDE_API);
      
      expect(provider1).toBe(provider2);
    });

    it('应该创建不同类型的提供商', async () => {
      const claudeProvider = await factory.getProvider(LLMProviderType.CLAUDE_API);
      const codeProvider = await factory.getProvider(LLMProviderType.CLAUDE_CODE);
      
      expect(claudeProvider).toBeDefined();
      expect(codeProvider).toBeDefined();
      expect(claudeProvider).not.toBe(codeProvider);
    });
  });

  describe('提供商切换测试', () => {
    it('应该切换到指定的提供商', async () => {
      const newProvider = await factory.switchProvider(LLMProviderType.DEEPSEEK);
      
      expect(newProvider).toBeDefined();
      expect(loggerSpy.info).toHaveBeenCalledWith('Switching to provider: DEEPSEEK');
      
      // 验证配置更新
      expect(mockVscode.workspace.getConfiguration().update).toHaveBeenCalledWith(
        'llmProvider',
        LLMProviderType.DEEPSEEK,
        mockVscode.ConfigurationTarget.Global
      );
    });

    it('应该保持当前提供商', () => {
      const currentProvider = factory.getCurrentProvider();
      
      // 初始状态应该为null
      expect(currentProvider).toBeNull();
    });
  });

  describe('提供商验证测试', () => {
    it('应该验证有效的提供商', async () => {
      // Mock一个有效的提供商
      jest.spyOn(factory as any, 'createProvider').mockResolvedValue({
        waitForInitialization: jest.fn().mockResolvedValue(true),
        hasValidConfiguration: jest.fn().mockReturnValue(true),
        getProviderName: jest.fn().mockReturnValue('Test Provider')
      });

      const validation = await factory.validateProvider(LLMProviderType.CLAUDE_API);
      
      expect(validation.isValid).toBe(true);
      expect(validation.error).toBeUndefined();
    });

    it('应该验证无效的提供商', async () => {
      // Mock一个无效的提供商
      jest.spyOn(factory as any, 'createProvider').mockResolvedValue({
        waitForInitialization: jest.fn().mockResolvedValue(false),
        hasValidConfiguration: jest.fn().mockReturnValue(false),
        getProviderName: jest.fn().mockReturnValue('Test Provider')
      });

      const validation = await factory.validateProvider(LLMProviderType.CLAUDE_API);
      
      expect(validation.isValid).toBe(false);
      expect(validation.error).toBeDefined();
      expect(validation.error).toBe('Failed to initialize Test Provider');
    });

    it('应该处理验证异常', async () => {
      jest.spyOn(factory as any, 'createProvider').mockRejectedValue(new Error('Test error'));

      const validation = await factory.validateProvider(LLMProviderType.CLAUDE_API);
      
      expect(validation.isValid).toBe(false);
      expect(validation.error).toBe('Test error');
    });
  });

  describe('可用提供商列表测试', () => {
    it('应该返回所有可用的提供商', () => {
      const availableProviders = factory.getAvailableProviders();
      
      expect(availableProviders).toBeDefined();
      expect(Array.isArray(availableProviders)).toBe(true);
      expect(availableProviders.length).toBeGreaterThan(0);
      
      // 验证包含所有预期的提供商
      const providerTypes = availableProviders.map(p => p.type);
      expect(providerTypes).toContain(LLMProviderType.CLAUDE_API);
      expect(providerTypes).toContain(LLMProviderType.CLAUDE_CODE);
      expect(providerTypes).toContain(LLMProviderType.DEEPSEEK);
      expect(providerTypes).toContain(LLMProviderType.KIMI);
      expect(providerTypes).toContain(LLMProviderType.GLM);
    });

    it('应该提供商包含正确的信息', () => {
      const availableProviders = factory.getAvailableProviders();
      
      availableProviders.forEach(provider => {
        expect(provider).toHaveProperty('type');
        expect(provider).toHaveProperty('name');
        expect(provider).toHaveProperty('description');
        expect(typeof provider.name).toBe('string');
        expect(typeof provider.description).toBe('string');
      });
    });
  });

  describe('提供商状态测试', () => {
    it('应该获取当前提供商状态', async () => {
      // Mock配置
      mockVscode.workspace.getConfiguration.mockReturnValue({
        get: jest.fn().mockImplementation((key: string) => {
          if (key === 'llmProvider') return 'claude-api';
          return undefined;
        }),
        update: jest.fn(),
        has: jest.fn()
      });

      // Mock验证结果
      jest.spyOn(factory, 'validateProvider').mockResolvedValue({ isValid: true });

      const status = await factory.getProviderStatus();
      
      expect(status).toHaveProperty('current');
      expect(status).toHaveProperty('providers');
      expect(Array.isArray(status.providers)).toBe(true);
      expect(status.providers.length).toBeGreaterThan(0);
    });

    it('应该正确处理提供商状态', async () => {
      // Mock验证结果
      jest.spyOn(factory, 'validateProvider')
        .mockResolvedValueOnce({ isValid: true })
        .mockResolvedValueOnce({ isValid: false, error: 'Configuration error' });

      const status = await factory.getProviderStatus();
      
      expect(status.providers[0].status).toBe('ready');
      expect(status.providers[1].status).toBe('error');
      expect(status.providers[1].error).toBe('Configuration error');
    });
  });

  describe('配置管理测试', () => {
    it('应该正确读取配置值', () => {
      const config = {
        get: jest.fn().mockImplementation((key: string) => {
          if (key === 'testKey') return 'testValue';
          return 'defaultValue';
        }),
        update: jest.fn(),
        has: jest.fn()
      };

      mockVscode.workspace.getConfiguration.mockReturnValue(config);

      const factoryInstance = LLMProviderFactory.getInstance(mockOutputChannel);
      const result = (factoryInstance as any).getConfigValue('testKey', 'defaultValue');
      
      expect(result).toBe('testValue');
      expect(config.get).toHaveBeenCalledWith('testKey', 'defaultValue');
    });

    it('应该正确映射配置字符串到枚举', () => {
      const config = {
        get: jest.fn().mockImplementation((key: string) => {
          if (key === 'llmProvider') return 'deepseek';
          return undefined;
        }),
        update: jest.fn(),
        has: jest.fn()
      };

      mockVscode.workspace.getConfiguration.mockReturnValue(config);

      const factoryInstance = LLMProviderFactory.getInstance(mockOutputChannel);
      const result = (factoryInstance as any).getConfiguredProviderType();
      
      expect(result).toBe(LLMProviderType.DEEPSEEK);
    });

    it('应该处理未知的提供商类型', () => {
      const config = {
        get: jest.fn().mockImplementation((key: string) => {
          if (key === 'llmProvider') return 'unknown-provider';
          return undefined;
        }),
        update: jest.fn(),
        has: jest.fn()
      };

      mockVscode.workspace.getConfiguration.mockReturnValue(config);

      const factoryInstance = LLMProviderFactory.getInstance(mockOutputChannel);
      const result = (factoryInstance as any).getConfiguredProviderType();
      
      expect(result).toBe(LLMProviderType.CLAUDE_API); // 默认值
    });
  });

  describe('错误处理测试', () => {
    it('应该处理提供商创建错误', async () => {
      jest.spyOn(factory as any, 'createProvider').mockRejectedValue(new Error('Creation failed'));

      await expect(factory.getProvider(LLMProviderType.CLAUDE_API)).rejects.toThrow('Creation failed');
    });

    it('应该处理提供商刷新错误', async () => {
      const mockProvider = {
        refreshConfiguration: jest.fn().mockRejectedValue(new Error('Refresh failed'))
      };

      (factory as any).currentProvider = mockProvider;

      const result = await factory.refreshCurrentProvider();
      
      expect(result).toBe(false);
      expect(loggerSpy.error).toHaveBeenCalledWith('Failed to refresh current provider: Refresh failed');
    });
  });

  describe('清理测试', () => {
    it('应该正确清理资源', () => {
      // 添加一些模拟的提供商
      (factory as any).providers.set(LLMProviderType.CLAUDE_API, {
        dispose: jest.fn()
      });
      (factory as any).providers.set(LLMProviderType.DEEPSEEK, {
        dispose: jest.fn()
      });
      (factory as any).currentProvider = {};

      factory.dispose();
      
      expect((factory as any).providers.size).toBe(0);
      expect((factory as any).currentProvider).toBeNull();
    });
  });

  describe('增强系统测试', () => {
    it('应该启用增强系统', () => {
      factory.enableEnhancedSystem();
      
      expect((factory as any).useEnhancedSystem).toBe(true);
      expect(loggerSpy.info).toHaveBeenCalledWith('Enhanced model management system enabled');
    });

    it('应该禁用增强系统', () => {
      factory.enableEnhancedSystem();
      factory.disableEnhancedSystem();
      
      expect((factory as any).useEnhancedSystem).toBe(false);
      expect(loggerSpy.info).toHaveBeenCalledWith('Enhanced model management system disabled');
    });

    it('应该获取增强系统状态', () => {
      const status = factory.getEnhancedSystemStatus();
      
      expect(status).toHaveProperty('enabled');
      expect(typeof status.enabled).toBe('boolean');
    });

    it('应该显示当前模型信息', () => {
      // Mock当前提供商
      const mockProvider = {
        getProviderName: jest.fn().mockReturnValue('Test Provider'),
        getModelDisplayName: jest.fn().mockReturnValue('Test Model'),
        isReady: jest.fn().mockReturnValue(true)
      };

      (factory as any).currentProvider = mockProvider;

      factory.showCurrentModelInfo();
      
      expect(mockVscode.window.showInformationMessage).toHaveBeenCalledWith(
        '当前提供商: Test Provider\n模型: Test Model\n状态: 就绪'
      );
    });
  });

  describe('性能测试', () => {
    it('应该快速创建提供商', async () => {
      const startTime = performance.now();
      
      // Mock快速初始化
      jest.spyOn(factory as any, 'createProvider').mockResolvedValue({
        waitForInitialization: jest.fn().mockResolvedValue(true),
        isReady: jest.fn().mockReturnValue(true)
      });

      await factory.getProvider(LLMProviderType.CLAUDE_API);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(100); // 应该在100ms内完成
    });

    it('应该高效处理多个提供商请求', async () => {
      const startTime = performance.now();
      
      // Mock快速初始化
      jest.spyOn(factory as any, 'createProvider').mockResolvedValue({
        waitForInitialization: jest.fn().mockResolvedValue(true),
        isReady: jest.fn().mockReturnValue(true)
      });

      const promises = [
        factory.getProvider(LLMProviderType.CLAUDE_API),
        factory.getProvider(LLMProviderType.DEEPSEEK),
        factory.getProvider(LLMProviderType.KIMI)
      ];

      await Promise.all(promises);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(200); // 应该在200ms内完成
    });
  });
});