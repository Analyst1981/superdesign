#!/usr/bin/env node

/**
 * Jest全局设置文件
 * 为所有测试提供统一的环境设置和Mock配置
 * 
 * 创建日期: 2025-09-19
 */

import * as vscode from 'vscode';
import { jest } from '@jest/globals';

// 全局Mock VS Code API
const mockVscode = createMockVscode();

// 全局测试工具
global.testUtils = {
  createMockVscode,
  createMockWorkspace,
  createMockConfiguration,
  createMockContext,
  mockFsUtils,
  delay,
  createTestTempDir,
  cleanupTestTempDir
};

// 全局Mock对象
global.mockVscode = mockVscode;

/**
 * 创建Mock VS Code API
 */
function createMockVscode() {
  return {
    workspace: {
      getConfiguration: jest.fn().mockReturnValue({
        get: jest.fn(),
        update: jest.fn(),
        has: jest.fn()
      }),
      workspaceFolders: [],
      rootPath: '/test/workspace',
      asRelativePath: jest.fn().mockImplementation((path: string) => path),
      openTextDocument: jest.fn(),
      saveAll: jest.fn(),
      applyEdit: jest.fn(),
      onDidChangeConfiguration: jest.fn(),
      onDidChangeTextDocument: jest.fn(),
      onDidChangeWorkspaceFolders: jest.fn(),
      onDidSaveTextDocument: jest.fn(),
      onDidCloseTextDocument: jest.fn(),
      createFileSystemWatcher: jest.fn(),
      findFiles: jest.fn(),
      findTextInFiles: jest.fn(),
      getWorkspaceFolder: jest.fn(),
      getWorkspaceFolders: jest.fn()
    },
    window: {
      showInformationMessage: jest.fn(),
      showWarningMessage: jest.fn(),
      showErrorMessage: jest.fn(),
      showInputBox: jest.fn(),
      showQuickPick: jest.fn(),
      showOpenDialog: jest.fn(),
      showSaveDialog: jest.fn(),
      withProgress: jest.fn(),
      createStatusBarItem: jest.fn(),
      createOutputChannel: jest.fn(),
      createWebviewPanel: jest.fn(),
      activeTextEditor: null,
      visibleTextEditors: [],
      onDidChangeActiveTextEditor: jest.fn(),
      onDidChangeVisibleTextEditors: jest.fn(),
      onDidChangeTextEditorSelection: jest.fn(),
      onDidChangeTextEditorVisibleRanges: jest.fn(),
      onDidChangeTextEditorOptions: jest.fn(),
      onDidChangeTextEditorViewColumn: jest.fn(),
      showTextDocument: jest.fn()
    },
    commands: {
      registerCommand: jest.fn(),
      executeCommand: jest.fn()
    },
    extensions: {
      getExtension: jest.fn(),
      all: []
    },
    env: {
      appName: 'VS Code Test',
      appRoot: '/test/vscode',
      appHost: 'desktop',
      machineId: 'test-machine-id',
      sessionId: 'test-session-id',
      language: 'en',
      clipboard: {
        writeText: jest.fn(),
        readText: jest.fn()
      },
      openExternal: jest.fn(),
      uriScheme: 'vscode'
    },
    Uri: {
      file: jest.fn().mockImplementation((path: string) => ({
        scheme: 'file',
        path: path,
        fsPath: path,
        toString: () => `file://${path}`,
        with: jest.fn()
      })),
      parse: jest.fn(),
      joinPath: jest.fn()
    },
    Range: jest.fn(),
    Position: jest.fn(),
    Location: jest.fn(),
    Diagnostic: jest.fn(),
    DiagnosticSeverity: {
      Error: 0,
      Warning: 1,
      Information: 2,
      Hint: 3
    },
    StatusBarAlignment: {
      Left: 1,
      Right: 2
    },
    ViewColumn: {
      One: 1,
      Two: 2,
      Three: 3,
      Four: 4,
      Five: 5,
      Six: 6,
      Seven: 7,
      Eight: 8,
      Nine: 9,
      Active: -1
    },
    ProgressLocation: {
      SourceControl: 1,
      Window: 10,
      Notification: 15
    },
    Disposable: {
      from: jest.fn()
    },
    EventEmitter: jest.fn(),
    ConfigurationTarget: {
      Global: 1,
      Workspace: 2,
      WorkspaceFolder: 3
    }
  };
}

/**
 * 创建Mock工作空间
 */
function createMockWorkspace() {
  return {
    name: 'test-workspace',
    uri: { fsPath: '/test/workspace' },
    index: 0
  };
}

/**
 * 创建Mock配置
 */
function createMockConfiguration() {
  return {
    get: jest.fn(),
    update: jest.fn(),
    has: jest.fn(),
    inspect: jest.fn()
  };
}

/**
 * 创建Mock上下文
 */
function createMockContext() {
  return {
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
    asAbsolutePath: jest.fn().mockImplementation((relativePath: string) => `/test/extension/${relativePath}`),
    storageUri: { fsPath: '/test/storage' },
    globalStorageUri: { fsPath: '/test/global-storage' },
    logUri: { fsPath: '/test/logs' },
    extensionMode: 1 // ExtensionMode.Test
  };
}

/**
 * Mock文件系统工具
 */
function mockFsUtils() {
  return {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    exists: jest.fn(),
    mkdir: jest.fn(),
    readdir: jest.fn(),
    stat: jest.fn(),
    unlink: jest.fn(),
    rmdir: jest.fn()
  };
}

/**
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 创建测试临时目录
 */
async function createTestTempDir(): Promise<string> {
  const fs = require('fs');
  const path = require('path');
  const os = require('os');
  
  const tempDir = path.join(os.tmpdir(), `superdesign-test-${Date.now()}`);
  fs.mkdirSync(tempDir, { recursive: true });
  return tempDir;
}

/**
 * 清理测试临时目录
 */
async function cleanupTestTempDir(tempDir: string): Promise<void> {
  const fs = require('fs-extra');
  await fs.remove(tempDir);
}

// 设置全局VS Code Mock
Object.defineProperty(global, 'vscode', {
  value: mockVscode,
  writable: false
});

// 设置Node.js环境变量
process.env.NODE_ENV = 'test';
process.env.VSCODE_TEST = 'true';

// 设置控制台输出
console.log('✅ Jest测试环境初始化完成');