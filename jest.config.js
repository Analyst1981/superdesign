#!/usr/bin/env node

/**
 * 测试配置文件 - Jest配置
 * 为SuperDesign项目提供完整的测试框架配置
 * 
 * 创建日期: 2025-09-19
 * 开发环境: Node.js 18+ | Jest 29+ | TypeScript 5+
 */

module.exports = {
  // 测试环境
  testEnvironment: 'node',
  
  // 测试匹配模式
  testMatch: [
    '**/test/**/*.test.ts',
    '**/test/**/*.spec.ts',
    '**/src/test/**/*.test.ts',
    '**/src/test/**/*.spec.ts'
  ],
  
  // 覆盖率收集配置
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'clover',
    'json',
    'html'
  ],
  
  // 覆盖率路径白名单
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/webview/**/*.ts', // WebView组件使用React Testing Library
    '!src/test/**/*'
  ],
  
  // 覆盖率阈值要求
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    // 不同模块的覆盖率要求
    './src/types/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/core/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './src/providers/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/services/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // 模块名称映射
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@providers/(.*)$': '<rootDir>/src/providers/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1'
  },
  
  // 设置文件
  setupFilesAfterEnv: [
    '<rootDir>/test/setup/jest.setup.ts',
    '<rootDir>/test/setup/global-mocks.ts'
  ],
  
  // 转换配置
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
        isolatedModules: true
      }
    ],
    '^.+\\.jsx?$': 'babel-jest'
  },
  
  // 模块文件扩展名
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'node'
  ],
  
  // 全局变量
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json'
    }
  },
  
  // 测试超时设置
  testTimeout: 30000,
  
  // 缓存设置
  cache: true,
  cacheDirectory: '.jest-cache',
  
  // 详细输出配置
  verbose: true,
  
  // 颜色输出
  colors: true,
  
  // 显示测试名称模式
  testNamePattern: '',
  
  // 并行测试
  maxWorkers: '50%',
  
  // 忽略模式
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/dist-test/',
    '/out/',
    '/coverage/',
    '/\\.vscode-test/'
  ],
  
  // 监视忽略模式
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/dist-test/',
    '/out/',
    '/coverage/'
  ]
};