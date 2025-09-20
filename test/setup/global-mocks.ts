#!/usr/bin/env node

/**
 * 全局Mock配置文件
 * 为所有测试提供统一的Mock对象和工具函数
 * 
 * 创建日期: 2025-09-19
 */

import { jest } from '@jest/globals';

/**
 * Mock VS Code API
 */
export const mockVscode = {
  workspace: {
    getConfiguration: jest.fn().mockReturnValue({
      get: jest.fn(),
      update: jest.fn(),
      has: jest.fn(),
      inspect: jest.fn()
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
    onDidChangeTextEditorViewColumn: jest.fn(),
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

/**
 * Mock文件系统
 */
export const mockFs = {
  readFile: jest.fn(),
  writeFile: jest.fn(),
  exists: jest.fn(),
  mkdir: jest.fn(),
  readdir: jest.fn(),
  stat: jest.fn(),
  unlink: jest.fn(),
  rmdir: jest.fn(),
  access: jest.fn(),
  copyFile: jest.fn(),
  rename: jest.fn(),
  createReadStream: jest.fn(),
  createWriteStream: jest.fn(),
  watch: jest.fn(),
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
    readdir: jest.fn(),
    stat: jest.fn(),
    unlink: jest.fn(),
    rmdir: jest.fn(),
    access: jest.fn(),
    copyFile: jest.fn(),
    rename: jest.fn()
  }
};

/**
 * Mock HTTP客户端
 */
export const mockHttpClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  head: jest.fn(),
  options: jest.fn(),
  request: jest.fn(),
  create: jest.fn(),
  defaults: {
    headers: {},
    baseURL: ''
  },
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() }
  }
};

/**
 * Mock Child Process
 */
export const mockChildProcess = {
  exec: jest.fn(),
  execFile: jest.fn(),
  fork: jest.fn(),
  spawn: jest.fn(),
  execSync: jest.fn(),
  execFileSync: jest.fn(),
  spawnSync: jest.fn()
};

/**
 * Mock文件系统监控
 */
export const mockFileWatcher = {
  onDidChange: jest.fn(),
  onDidCreate: jest.fn(),
  onDidDelete: jest.fn(),
  dispose: jest.fn()
};

/**
 * Mock输出通道
 */
export const mockOutputChannel = {
  append: jest.fn(),
  appendLine: jest.fn(),
  clear: jest.fn(),
  show: jest.fn(),
  hide: jest.fn(),
  dispose: jest.fn()
};

/**
 * Mock状态栏项目
 */
export const mockStatusBarItem = {
  text: '',
  tooltip: '',
  command: '',
  color: '',
  backgroundColor: '',
  alignment: 1,
  priority: 0,
  show: jest.fn(),
  hide: jest.fn(),
  dispose: jest.fn()
};

/**
 * Mock WebView面板
 */
export const mockWebviewPanel = {
  webview: {
    html: '',
    postMessage: jest.fn(),
    asWebviewUri: jest.fn(),
    onDidReceiveMessage: jest.fn()
  },
  title: '',
  viewType: '',
  viewColumn: 1,
  visible: false,
  active: false,
  reveal: jest.fn(),
  show: jest.fn(),
  hide: jest.fn(),
  dispose: jest.fn(),
  onDidChangeViewState: jest.fn(),
  onDidDispose: jest.fn()
};

/**
 * 测试工具函数
 */
export const testUtils = {
  /**
   * 创建延迟
   */
  delay: (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * 创建测试临时目录
   */
  createTempDir: async (): Promise<string> => {
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
  cleanupTempDir: async (tempDir: string): Promise<void> => {
    const fs = require('fs-extra');
    await fs.remove(tempDir);
  },

  /**
   * 创建模拟的LLM响应
   */
  createMockLLMResponse: (content: string, model: string = 'test-model') => ({
    id: `test-${Date.now()}`,
    object: 'chat.completion',
    created: Date.now(),
    model: model,
    choices: [{
      index: 0,
      message: {
        role: 'assistant',
        content: content
      },
      finish_reason: 'stop'
    }],
    usage: {
      prompt_tokens: 10,
      completion_tokens: 20,
      total_tokens: 30
    }
  }),

  /**
   * 创建模拟的流式LLM响应
   */
  createMockStreamingLLMResponse: (chunks: string[]) => {
    return {
      [Symbol.asyncIterator]: async function* () {
        for (const chunk of chunks) {
          await testUtils.delay(10);
          yield {
            id: `test-${Date.now()}`,
            object: 'chat.completion.chunk',
            created: Date.now(),
            model: 'test-model',
            choices: [{
              index: 0,
              delta: { content: chunk },
              finish_reason: null
            }]
          };
        }
        // 发送结束信号
        yield {
          id: `test-${Date.now()}`,
          object: 'chat.completion.chunk',
          created: Date.now(),
          model: 'test-model',
          choices: [{
            index: 0,
            delta: {},
            finish_reason: 'stop'
          }]
        };
      }
    };
  },

  /**
   * 重置所有Mock
   */
  resetAllMocks: () => {
    jest.clearAllMocks();
    mockVscode.workspace.getConfiguration.mockClear();
    mockVscode.window.showInformationMessage.mockClear();
    mockVscode.window.showErrorMessage.mockClear();
    mockVscode.commands.registerCommand.mockClear();
    mockVscode.commands.executeCommand.mockClear();
    mockFs.readFile.mockClear();
    mockFs.writeFile.mockClear();
    mockHttpClient.get.mockClear();
    mockHttpClient.post.mockClear();
  },

  /**
   * 设置Mock返回值
   */
  setupMockConfiguration: (config: Record<string, any>) => {
    mockVscode.workspace.getConfiguration.mockReturnValue({
      get: jest.fn().mockImplementation((key: string) => config[key]),
      update: jest.fn(),
      has: jest.fn().mockImplementation((key: string) => config.hasOwnProperty(key)),
      inspect: jest.fn()
    });
  },

  /**
   * 创建模拟的错误
   */
  createMockError: (message: string, code: string = 'TEST_ERROR'): Error => {
    const error = new Error(message);
    (error as any).code = code;
    return error;
  }
};

// 导出全局Mock对象
export default {
  vscode: mockVscode,
  fs: mockFs,
  http: mockHttpClient,
  childProcess: mockChildProcess,
  fileWatcher: mockFileWatcher,
  outputChannel: mockOutputChannel,
  statusBarItem: mockStatusBarItem,
  webviewPanel: mockWebviewPanel,
  utils: testUtils
};