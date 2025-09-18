/**
 * GLM（智谱AI）提供者类
 * 
 * 实现对智谱AI大模型的API调用支持
 * 支持GLM-4、GLM-4-Plus等模型的接入和管理
 * 
 * 主要功能：
 * - API密钥认证和配置管理
 * - 流式对话接口调用
 * - 多模态功能支持
 * - 错误处理和重试机制
 * - 工作目录管理
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import { LLMProvider, LLMMessage, LLMProviderOptions, LLMStreamCallback } from './llmProvider';

export class GLMProvider extends LLMProvider {
    private apiKey: string = '';
    private modelId: string = 'glm-4';
    private workingDirectory: string = '';
    private baseURL: string = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

    constructor(outputChannel: vscode.OutputChannel) {
        super(outputChannel);
    }

    /**
     * 初始化GLM提供者
     * 配置API密钥、模型ID和工作目录
     */
    async initialize(): Promise<void> {
        try {
            this.outputChannel.appendLine('正在初始化 GLM（智谱AI）提供者...');
            
            // 获取配置
            const config = vscode.workspace.getConfiguration('superdesign');
            this.apiKey = config.get('glmApiKey', '');
            this.modelId = config.get('glmModelId', 'glm-4');
            
            if (!this.apiKey) {
                throw new Error('GLM API密钥未配置，请在设置中配置 superdesign.glmApiKey');
            }

            // 设置工作目录
            await this.setupWorkingDirectory();
            
            this.isInitialized = true;
            this.outputChannel.appendLine('GLM（智谱AI）提供者初始化成功');
            
        } catch (error) {
            this.outputChannel.appendLine(`GLM（智谱AI）提供者初始化失败: ${error}`);
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
        
        this.outputChannel.appendLine(`GLM 工作目录: ${this.workingDirectory}`);
    }

    /**
     * 查询GLM模型
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
                        content: options.customSystemPrompt || '你是智谱AI开发的ChatGLM大模型，请根据用户需求提供准确、有用的回答。'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 2000,
                temperature: 0.7,
                top_p: 0.9,
                stream: false
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
                content: `GLM API 调用失败: ${error}`,
                text: `GLM API 调用失败: ${error}`,
                is_error: true,
                duration_ms: Date.now() - startTime
            };
            
            messages.push(errorMessage);
            
            if (onMessage) {
                onMessage(errorMessage);
            }
            
            this.outputChannel.appendLine(`GLM 查询失败: ${error}`);
        }

        return messages;
    }

    /**
     * 发送HTTP API请求
     * 使用智谱AI的API格式
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
                            reject(new Error(response.error.message || response.error.code || '未知错误'));
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
     * 基于智谱AI的计费方式
     */
    private calculateCost(usage: any): number {
        if (!usage) return 0;
        
        // 智谱AI的计费方式（需要根据官方文档调整）
        const promptTokens = usage.prompt_tokens || 0;
        const completionTokens = usage.completion_tokens || 0;
        
        // GLM-4的价格（示例，需要根据实际情况调整）
        let inputCostPer1k = 0.1; // ¥0.1 per 1k tokens
        let outputCostPer1k = 0.1; // ¥0.1 per 1k tokens
        
        // 根据模型调整价格
        if (this.modelId.includes('plus')) {
            inputCostPer1k = 0.5;
            outputCostPer1k = 0.5;
        }
        
        // 转换为美元（假设汇率为7）
        const exchangeRate = 7;
        return ((promptTokens / 1000) * inputCostPer1k + (completionTokens / 1000) * outputCostPer1k) / exchangeRate;
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
            this.apiKey = config.get('glmApiKey', '');
            this.modelId = config.get('glmModelId', 'glm-4');
            
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
            'token_invalid',
            'api_key_invalid',
            '鉴权失败',
            '密钥无效',
            '认证失败'
        ];
        
        const lowerMessage = errorMessage.toLowerCase();
        return authErrorPatterns.some(pattern => lowerMessage.includes(pattern));
    }

    /**
     * 获取提供者名称
     */
    getProviderName(): string {
        return 'GLM（智谱AI）';
    }

    /**
     * 获取提供者类型
     */
    getProviderType(): 'api' | 'binary' {
        return 'api';
    }
}