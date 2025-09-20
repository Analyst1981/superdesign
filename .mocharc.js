#!/usr/bin/env node

/**
 * Mocha测试配置
 * 为SuperDesign项目提供Mocha测试框架配置
 * 主要用于集成测试和端到端测试
 * 
 * 创建日期: 2025-09-19
 */

module.exports = {
  // 测试文件匹配模式
  spec: 'test/**/*.test.ts',
  
  // 递归查找测试文件
  recursive: true,
  
  // 测试超时时间（毫秒）
  timeout: 30000,
  
  // 慢测试阈值（毫秒）
  slow: 1000,
  
  // 颜色输出
  colors: true,
  
  // 并行测试
  parallel: false,
  
  // 需要的文件
  require: [
    'ts-node/register',
    'test/setup/mocha.setup.ts',
    'test/setup/global-mocks.ts'
  ],
  
  // 排除的文件或目录
  exclude: [
    'node_modules/**/*',
    'dist/**/*',
    'dist-test/**/*',
    'out/**/*',
    'coverage/**/*'
  ],
  
  // 测试报告器
  reporter: 'spec',
  
  // 报告器选项
  reporterOptions: {
    // 可以添加特定报告器的选项
  },
  
  // 全局变量
  globals: {
    // 可以添加全局测试变量
  },
  
  // 测试环境
  ui: 'bdd',
  
  // 增量测试
  forbidPending: false,
  forbidOnly: false,
  
  // 退出代码
  exit: true
};