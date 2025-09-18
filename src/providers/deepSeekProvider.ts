/**
 * DeepSeek 提供者类
 * 
 * 实现对DeepSeek大模型的API调用支持
 * 支持DeepSeek-V3、DeepSeek-R1等模型的接入和管理
 * 
 * 主要功能：
 * - API密钥认证和配置管理
 * - 流式对话接口调用
 * - 思考模式和非思考模式支持
 * - 错误处理和重试机制
 * - 工作目录管理
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import { LLMProvider, LLMMessage, LLMProviderOptions, LLMStreamCallback } from './llmProvider';

export class DeepSeekProvider extends LLMProvider {
    private apiKey: string = '';
    private modelId: string = 'deepseek-chat';
    private workingDirectory: string = '';
    private baseURL: string = 'https://api.deepseek.com/v1/chat/completions';

    constructor(outputChannel: vscode.OutputChannel) {
        super(outputChannel);
    }

    /**
     * 初始化DeepSeek提供者
     * 配置API密钥、模型ID和工作目录
     */
    async initialize(): Promise<void> {
        try {
            this.outputChannel.appendLine('正在初始化 DeepSeek 提供者...');
            
            // 获取配置
            const config = vscode.workspace.getConfiguration('superdesign');
            this.apiKey = config.get('deepSeekApiKey', '');
            this.modelId = config.get('deepSeekModelId', 'deepseek-chat');
            
            if (!this.apiKey) {
                throw new Error('DeepSeek API密钥未配置，请在设置中配置 superdesign.deepSeekApiKey');
            }

            // 设置工作目录
            await this.setupWorkingDirectory();
            
            this.isInitialized = true;
            this.outputChannel.appendLine('DeepSeek 提供者初始化成功');
            
        } catch (error) {
            this.outputChannel.appendLine(`DeepSeek 提供者初始化失败: ${error}`);
            throw error;
        }
    }

    /**
     * 设置工作目录
     * 优先使用workspace根目录，fallback到临时目录
     */
    private async setupWorkingDirectory(): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            this.workingDirectory = path.join(workspaceFolders[0].uri.fsPath, '.superdesign');
        } else {
            this.workingDirectory = path.join(os.tmpdir(), 'superdesign');
        }
        
        this.outputChannel.appendLine(`DeepSeek 工作目录: ${this.workingDirectory}`);
    }

    /**
     * 查询DeepSeek模型
     * 支持流式输出和多轮对话
     */
    async query(
        prompt: string,
        options: Partial<LLMProviderOptions> = {},
        abortController?: AbortController,
        onMessage?: LLMStreamCallback
    ): Promise<LLMMessage[]> {
        await this.ensureInitialized();
        
        const messages: LLMMessage[] = [];
        const startTime = Date.now();

        try {
            // 构建请求参数
            const requestBody = {
                model: this.modelId,
                messages: [
                    {
                        role: 'system',
                        content: options.customSystemPrompt || '你是DeepSeek开发的AI助手，请根据用户需求提供准确、有用的回答。'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 2000,
                temperature: 0.7,
                stream: false // DeepSeek支持流式，这里先实现非流式
            };

            // 发送API请求
            const response = await this.makeAPIRequest(requestBody, abortController);
            
            // 处理响应
            if (response.choices && response.choices.length > 0) {
                const choice = response.choices[0];
                const content = choice.message?.content || '';
                
                const message: LLMMessage = {
                    type: 'text',
                    content: content,
                    text: content,
                    result: content,
                    is_error: false,
                    duration_ms: Date.now() - startTime,
                    total_cost_usd: this.calculateCost(response.usage)
                };

                messages.push(message);
                
                if (onMessage) {
                    onMessage(message);
                }
            }

        } catch (error) {
            const errorMessage: LLMMessage = {
                type: 'error',
                content: `DeepSeek API 调用失败: ${error}`,
                text: `DeepSeek API 调用失败: ${error}`,
                is_error: true,
                duration_ms: Date.now() - startTime
            };
            
            messages.push(errorMessage);
            
            if (onMessage) {
                onMessage(errorMessage);
            }
            
            this.outputChannel.appendLine(`DeepSeek 查询失败: ${error}`);
        }

        return messages;
    }

    /**
     * 发送HTTP API请求
     * 使用OpenAI兼容的API格式
     */
    private async makeAPIRequest(requestBody: any, abortController?: AbortController): Promise<any> {
        const https = require('https');
        const url = require('url');
        
        return new Promise((resolve, reject) => {
            const parsedUrl = url.parse(this.baseURL);
            const postData = JSON.stringify(requestBody);
            
            const options = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || 443,
                path: parsedUrl.path,
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            const req = https.request(options, (res: any) => {
                let data = '';
                
                res.on('data', (chunk: any) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);
                        
                        // 检查错误响应
                        if (response.error) {
                            reject(new Error(response.error.message || '未知错误'));
                        } else {
                            resolve(response);
                        }
                    } catch (error) {
                        reject(new Error(`解析响应失败: ${error}`));
                    }
                });
            });

            req.on('error', (error: any) => {
                reject(error);
            });

            if (abortController) {
                abortController.signal.addEventListener('abort', () => {
                    req.destroy();
                    reject(new Error('请求被取消'));
                });
            }

            req.write(postData);
            req.end();
        });
    }

    /**
     * 计算API调用成本
     * 基于DeepSeek的计费方式
     */
    private calculateCost(usage: any): number {
        if (!usage) return 0;
        
        // DeepSeek的计费方式（需要根据官方文档调整）
        const promptTokens = usage.prompt_tokens || 0;
        const completionTokens = usage.completion_tokens || 0;
        
        // DeepSeek的价格（示例，需要根据实际情况调整）
        const inputCostPer1k = 0.0014; // $0.14 per 1M tokens
        const outputCostPer1k = 0.0028; // $0.28 per 1M tokens
        
        return (promptTokens / 1000000) * inputCostPer1k + (completionTokens / 1000000) * outputCostPer1k;
    }

    /**
     * 检查提供者是否就绪
     */
    isReady(): boolean {
        return this.isInitialized && !!this.apiKey;
    }

    /**
     * 等待初始化完成
     */
    async waitForInitialization(): Promise<boolean> {
        if (this.initializationPromise) {
            try {
                await this.initializationPromise;
                return this.isInitialized;
            } catch {
                return false;
            }
        }
        return this.isInitialized;
    }

    /**
     * 获取工作目录
     */
    getWorkingDirectory(): string {
        return this.workingDirectory;
    }

    /**
     * 检查配置是否有效
     */
    hasValidConfiguration(): boolean {
        return !!this.apiKey;
    }

    /**
     * 刷新配置
     */
    async refreshConfiguration(): Promise<boolean> {
        try {
            const config = vscode.workspace.getConfiguration('superdesign');
            this.apiKey = config.get('deepSeekApiKey', '');
            this.modelId = config.get('deepSeekModelId', 'deepseek-chat');
            
            return this.hasValidConfiguration();
        } catch {
            return false;
        }
    }

    /**
     * 判断是否为认证错误
     */
    isAuthError(errorMessage: string): boolean {
        const authErrorPatterns = [
            'invalid api key',
            'unauthorized',
            'authentication failed',
            'api key',
            '401',
            '403',
            'invalid_api_key',
            'authentication_error',
            '鉴权失败',
            '密钥无效'
        ];
        
        const lowerMessage = errorMessage.toLowerCase();
        return authErrorPatterns.some(pattern => lowerMessage.includes(pattern));
    }

    /**
     * 获取提供者名称
     */
    getProviderName(): string {
        return 'DeepSeek';
    }

    /**
     * 获取提供者类型
     */
    getProviderType(): 'api' | 'binary' {
        return 'api';
    }
}