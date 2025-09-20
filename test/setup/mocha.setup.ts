#!/usr/bin/env node

/**
 * Mocha测试设置文件
 * 为Mocha测试框架提供环境配置和工具函数
 * 
 * 创建日期: 2025-09-19
 */

import * as assert from 'assert';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';

// 配置Chai
chai.use(chaiAsPromised);

// 全局断言库
global.assert = assert;
global.expect = chai.expect;
global.should = chai.should();

// 全局Sinon
global.sinon = sinon;

// 测试工具函数
global.testHelpers = {
  /**
   * 创建模拟的VS Code工作空间
   */
  createMockWorkspace() {
    return {
      getConfiguration: () => ({
        get: sinon.stub(),
        update: sinon.stub(),
        has: sinon.stub()
      }),
      workspaceFolders: [],
      rootPath: '/test/workspace'
    };
  },

  /**
   * 创建模拟的扩展上下文
   */
  createMockExtensionContext() {
    return {
      subscriptions: [],
      workspaceState: {
        get: sinon.stub(),
        update: sinon.stub(),
        keys: sinon.stub().returns([])
      },
      globalState: {
        get: sinon.stub(),
        update: sinon.stub(),
        keys: sinon.stub().returns([])
      },
      secrets: {
        get: sinon.stub(),
        store: sinon.stub(),
        delete: sinon.stub()
      },
      extensionUri: { fsPath: '/test/extension' },
      extensionPath: '/test/extension',
      asAbsolutePath: (relativePath: string) => `/test/extension/${relativePath}`,
      storageUri: { fsPath: '/test/storage' },
      globalStorageUri: { fsPath: '/test/global-storage' },
      logUri: { fsPath: '/test/logs' },
      extensionMode: 1 // ExtensionMode.Test
    };
  },

  /**
   * 等待指定时间
   */
  async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * 创建测试临时目录
   */
  async createTempDir(): Promise<string> {
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    
    const tempDir = path.join(os.tmpdir(), `superdesign-test-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });
    return tempDir;
  },

  /**
   * 清理临时目录
   */
  async cleanupTempDir(tempDir: string): Promise<void> {
    const fs = require('fs-extra');
    await fs.remove(tempDir);
  },

  /**
   * 创建模拟的文件系统
   */
  createMockFileSystem() {
    const mockFs = {
      readFile: sinon.stub(),
      writeFile: sinon.stub(),
      exists: sinon.stub(),
      mkdir: sinon.stub(),
      readdir: sinon.stub(),
      stat: sinon.stub(),
      unlink: sinon.stub(),
      rmdir: sinon.stub()
    };

    // 默认返回空值
    mockFs.readFile.resolves('');
    mockFs.exists.resolves(false);
    mockFs.readdir.resolves([]);
    mockFs.stat.resolves({ isFile: () => true, isDirectory: () => false });

    return mockFs;
  },

  /**
   * 创建模拟的HTTP客户端
   */
  createMockHttpClient() {
    return {
      get: sinon.stub(),
      post: sinon.stub(),
      put: sinon.stub(),
      delete: sinon.stub(),
      patch: sinon.stub()
    };
  },

  /**
   * 验证函数调用次数
   */
  expectCallCount(stub: sinon.SinonStub, expectedCount: number) {
    assert.strictEqual(
      stub.callCount,
      expectedCount,
      `期望调用次数 ${expectedCount}，实际调用次数 ${stub.callCount}`
    );
  },

  /**
   * 验证函数调用参数
   */
  expectCalledWith(stub: sinon.SinonStub, ...expectedArgs: any[]) {
    sinon.assert.calledWith(stub, ...expectedArgs);
  },

  /**
   * 验证函数抛出异常
   */
  async expectThrows<T>(asyncFn: () => Promise<T>, errorType?: new (...args: any[]) => Error) {
    if (errorType) {
      await chai.expect(asyncFn()).to.be.rejectedWith(errorType);
    } else {
      await chai.expect(asyncFn()).to.be.rejected;
    }
  }
};

// 全局测试钩子
beforeEach(function() {
  // 在每个测试前创建Sinon沙盒
  this.sandbox = sinon.createSandbox();
});

afterEach(function() {
  // 在每个测试后清理Sinon沙盒
  this.sandbox.restore();
});

// 设置测试环境变量
process.env.NODE_ENV = 'test';
process.env.VSCODE_TEST = 'true';

// 全局错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  console.error('Promise:', promise);
});

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
});

console.log('✅ Mocha测试环境初始化完成');