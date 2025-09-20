#!/usr/bin/env node

/**
 * 测试工具函数库
 * 提供通用的测试辅助函数和Mock工具
 * 
 * 创建日期: 2025-09-19
 */

import { jest } from '@jest/globals';
import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * 测试数据生成器
 */
export class TestDataGenerator {
  /**
   * 生成随机的API密钥
   */
  static generateApiKey(): string {
    return `sk-test-${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * 生成随机的模型ID
   */
  static generateModelId(): string {
    const models = ['claude-3-sonnet', 'gpt-4', 'deepseek-chat', 'qwen-turbo', 'glm-4-plus'];
    return models[Math.floor(Math.random() * models.length)];
  }

  /**
   * 生成随机的用户消息
   */
  static generateUserMessage(): string {
    const messages = [
      '请帮我创建一个React组件',
      '如何优化这个函数的性能？',
      '解释这个设计模式的应用',
      '帮我修复这个bug',
      '重构这段代码'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * 生成随机的AI响应
   */
  static generateAIResponse(): string {
    const responses = [
      '这是一个很好的问题，让我来为你解答...',
      '根据你的需求，我建议采用以下方案...',
      '我理解你的困惑，让我详细说明...',
      '这个问题的解决方案如下...',
      '基于最佳实践，我推荐...'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

/**
 * 文件系统测试工具
 */
export class FileSystemTestUtils {
  private testTempDir: string;

  constructor() {
    this.testTempDir = '';
  }

  /**
   * 初始化测试临时目录
   */
  async initialize(): Promise<string> {
    const os = require('os');
    this.testTempDir = path.join(os.tmpdir(), `superdesign-test-${Date.now()}`);
    await fs.ensureDir(this.testTempDir);
    return this.testTempDir;
  }

  /**
   * 清理测试临时目录
   */
  async cleanup(): Promise<void> {
    if (this.testTempDir && await fs.pathExists(this.testTempDir)) {
      await fs.remove(this.testTempDir);
    }
  }

  /**
   * 创建测试文件
   */
  async createTestFile(filename: string, content: string = 'test content'): Promise<string> {
    const filePath = path.join(this.testTempDir, filename);
    await fs.writeFile(filePath, content);
    return filePath;
  }

  /**
   * 创建测试目录
   */
  async createTestDir(dirname: string): Promise<string> {
    const dirPath = path.join(this.testTempDir, dirname);
    await fs.ensureDir(dirPath);
    return dirPath;
  }

  /**
   * 获取测试文件路径
   */
  getTestPath(filename: string): string {
    return path.join(this.testTempDir, filename);
  }
}

/**
 * Mock验证工具
 */
export class MockValidator {
  /**
   * 验证函数是否被调用
   */
  static expectCalled(mock: jest.Mock, times: number = 1): void {
    expect(mock).toHaveBeenCalledTimes(times);
  }

  /**
   * 验证函数是否被特定参数调用
   */
  static expectCalledWith(mock: jest.Mock, ...args: any[]): void {
    expect(mock).toHaveBeenCalledWith(...args);
  }

  /**
   * 验证函数是否被特定参数调用（最后一次）
   */
  static expectLastCalledWith(mock: jest.Mock, ...args: any[]): void {
    expect(mock).toHaveBeenLastCalledWith(...args);
  }

  /**
   * 验证函数返回值
   */
  static expectReturned(mock: jest.Mock, value: any): void {
    expect(mock).toHaveReturnedWith(value);
  }

  /**
   * 验证函数抛出异常
   */
  static expectThrown(mock: jest.Mock, error: any): void {
    expect(mock).toThrow(error);
  }
}

/**
 * 异步测试工具
 */
export class AsyncTestUtils {
  /**
   * 等待指定时间
   */
  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 等待条件满足
   */
  static async waitFor(
    condition: () => boolean | Promise<boolean>,
    timeout: number = 5000,
    interval: number = 100
  ): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return;
      }
      await this.delay(interval);
    }
    
    throw new Error(`条件在 ${timeout}ms 内未满足`);
  }

  /**
   * 等待Promise完成
   */
  static async waitForPromise<T>(
    promise: Promise<T>,
    timeout: number = 5000
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Promise 在 ${timeout}ms 内未完成`)), timeout)
      )
    ]);
  }

  /**
   * 重试异步操作
   */
  static async retry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    delayMs: number = 100
  ): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (i < maxAttempts - 1) {
          await this.delay(delayMs);
        }
      }
    }
    
    throw lastError!;
  }
}

/**
 * 性能测试工具
 */
export class PerformanceTestUtils {
  /**
   * 测量函数执行时间
   */
  static async measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; timeMs: number }> {
    const start = Date.now();
    const result = await fn();
    const end = Date.now();
    
    return {
      result,
      timeMs: end - start
    };
  }

  /**
   * 测量同步函数执行时间
   */
  static measureTimeSync<T>(fn: () => T): { result: T; timeMs: number } {
    const start = Date.now();
    const result = fn();
    const end = Date.now();
    
    return {
      result,
      timeMs: end - start
    };
  }

  /**
   * 验证函数执行时间不超过指定阈值
   */
  static async expectExecutionTimeUnder(
    fn: () => Promise<void>,
    maxTimeMs: number
  ): Promise<void> {
    const { timeMs } = await this.measureTime(fn);
    expect(timeMs).toBeLessThan(maxTimeMs);
  }

  /**
   * 性能基准测试
   */
  static async benchmark<T>(
    fn: () => Promise<T>,
    iterations: number = 100
  ): Promise<{ avgTimeMs: number; minTimeMs: number; maxTimeMs: number; results: T[] }> {
    const times: number[] = [];
    const results: T[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const { timeMs, result } = await this.measureTime(fn);
      times.push(timeMs);
      results.push(result);
    }
    
    return {
      avgTimeMs: times.reduce((sum, time) => sum + time, 0) / times.length,
      minTimeMs: Math.min(...times),
      maxTimeMs: Math.max(...times),
      results
    };
  }
}

/**
 * 测试数据工厂
 */
export class TestDataFactory {
  /**
   * 创建测试用户配置
   */
  static createUserConfig(overrides: Partial<any> = {}): any {
    return {
      superdesign: {
        activeProvider: 'claude-api',
        anthropicApiKey: TestDataGenerator.generateApiKey(),
        enableModelSwitching: true,
        showModelInfo: true,
        ...overrides
      }
    };
  }

  /**
   * 创建测试LLM消息
   */
  static createLLMMessage(role: string, content: string): any {
    return {
      id: `msg-${Date.now()}`,
      role,
      content,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 创建测试聊天会话
   */
  static createChatSession(messages: any[] = []): any {
    return {
      id: `session-${Date.now()}`,
      messages: messages.length > 0 ? messages : [
        this.createLLMMessage('user', 'Hello'),
        this.createLLMMessage('assistant', 'Hi there!')
      ],
      model: 'claude-3-sonnet',
      provider: 'claude-api',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * 创建测试文件事件
   */
  static createFileEvent(type: 'create' | 'change' | 'delete', filePath: string): any {
    return {
      type,
      path: filePath,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * 测试断言扩展
 */
export class TestAssertions {
  /**
   * 验证对象具有特定属性
   */
  static toHaveProperty(actual: any, property: string): void {
    expect(actual).toHaveProperty(property);
  }

  /**
   * 验证对象是特定类型
   */
  static toBeType(actual: any, type: string): void {
    expect(typeof actual).toBe(type);
  }

  /**
   * 验证数组包含特定元素
   */
  static toContainElement<T>(array: T[], element: T): void {
    expect(array).toContain(element);
  }

  /**
   * 验证数组包含匹配元素
   */
  static toContainMatching<T>(array: T[], predicate: (item: T) => boolean): void {
    expect(array.some(predicate)).toBe(true);
  }

  /**
   * 验证Promise被拒绝
   */
  static async toBeRejected(promise: Promise<any>, errorType?: any): Promise<void> {
    await expect(promise).rejects.toThrow(errorType);
  }

  /**
   * 验证Promise被解决
   */
  static async toBeResolved<T>(promise: Promise<T>): Promise<T> {
    await expect(promise).resolves.not.toThrow();
    return promise;
  }
}

// 导出所有工具类
export {
  TestDataGenerator,
  FileSystemTestUtils,
  MockValidator,
  AsyncTestUtils,
  PerformanceTestUtils,
  TestDataFactory,
  TestAssertions
};