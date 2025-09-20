import * as vscode from 'vscode';
import { LLMProvider, LLMProviderType } from './llmProvider';
import { ClaudeApiProvider } from './claudeApiProvider';
import { ClaudeCodeProvider } from './claudeCodeProvider';
import { ModelScopeProvider } from './modelScopeProvider';
import { DeepSeekProvider } from './deepSeekProvider';
import { KimiProvider } from './kimiProvider';
import { GLMProvider } from './glmProvider';
import { DoubaoProvider } from './doubaoProvider';
import { QwenProvider } from './qwenProvider';
import { ZhipuProvider } from './zhipuProvider';
import { EnhancedLLMFactory, type EnhancedLLMProvider } from './enhanced-llm-factory.js';
import { EnhancedProviderFactory } from './enhanced-provider-factory';
import { Logger } from '../services/logger';

export class LLMProviderFactory {
    private static instance: LLMProviderFactory;
    private providers: Map<LLMProviderType, LLMProvider> = new Map();
    private currentProvider: LLMProvider | null = null;
    private enhancedFactory: EnhancedLLMFactory | null = null;
    private enhancedProviderFactory: EnhancedProviderFactory | null = null;
    private useEnhancedSystem: boolean = false;

    private constructor(private outputChannel: vscode.OutputChannel) {
        // 初始化增强系统
        this.enhancedFactory = EnhancedLLMFactory.getInstance(outputChannel);
        this.enhancedProviderFactory = EnhancedProviderFactory.getInstance(outputChannel);
    }

    static getInstance(outputChannel: vscode.OutputChannel): LLMProviderFactory {
        if (!LLMProviderFactory.instance) {
            LLMProviderFactory.instance = new LLMProviderFactory(outputChannel);
        }
        return LLMProviderFactory.instance;
    }

    async getProvider(providerType?: LLMProviderType): Promise<LLMProvider> {
        // If no provider type specified, get from configuration
        if (!providerType) {
            providerType = this.getConfiguredProviderType();
        }

        // Check if provider is already initialized
        if (this.providers.has(providerType)) {
            const provider = this.providers.get(providerType)!;
            if (provider.isReady()) {
                this.currentProvider = provider;
                return provider;
            }
        }

        // Create new provider
        const provider = await this.createProvider(providerType);
        
        // Initialize the provider
        await provider.waitForInitialization();
        
        // Store the provider
        this.providers.set(providerType, provider);
        this.currentProvider = provider;
        
        return provider;
    }

    private async createProvider(providerType: LLMProviderType): Promise<LLMProvider> {
        Logger.info(`Creating provider of type: ${providerType}`);
        
        switch (providerType) {
            case LLMProviderType.CLAUDE_API:
                return new ClaudeApiProvider(this.outputChannel);
            
            case LLMProviderType.CLAUDE_CODE:
                return new ClaudeCodeProvider(this.outputChannel);
            
            case LLMProviderType.MODELSCOPE:
                return new ModelScopeProvider(this.outputChannel);
            
            case LLMProviderType.DEEPSEEK:
                return new DeepSeekProvider(this.outputChannel);
            
            case LLMProviderType.KIMI:
                return new KimiProvider(this.outputChannel);
            
            case LLMProviderType.GLM:
                return new GLMProvider(this.outputChannel);
            
            case LLMProviderType.ZHIPU:
                return new ZhipuProvider({
                    outputChannel: this.outputChannel,
                    apiKey: this.getConfigValue('zhipuApiKey', ''),
                    modelId: this.getConfigValue('zhipuModelId', 'glm-4'),
                    temperature: 0.7
                });
            
            case LLMProviderType.QWEN:
                return new QwenProvider({
                    outputChannel: this.outputChannel,
                    apiKey: this.getConfigValue('qwenApiKey', ''),
                    modelId: this.getConfigValue('qwenModelId', 'qwen-plus'),
                    temperature: 0.7
                });
            
            case LLMProviderType.DOUBAO:
                return new DoubaoProvider({
                    outputChannel: this.outputChannel,
                    apiKey: this.getConfigValue('doubaoApiKey', ''),
                    modelId: this.getConfigValue('doubaoModelId', 'doubao-pro-32k'),
                    temperature: 0.7
                });
            
            default:
                throw new Error(`Unknown provider type: ${providerType}`);
        }
    }
    
    /**
     * 获取配置值
     */
    private getConfigValue(key: string, defaultValue: any): any {
        const config = vscode.workspace.getConfiguration('superdesign');
        return config.get(key, defaultValue);
    }

    private getConfiguredProviderType(): LLMProviderType {
        const config = vscode.workspace.getConfiguration('superdesign');
        const providerType = config.get<string>('llmProvider', 'claude-api');
        
        // Map string to enum
        switch (providerType.toLowerCase()) {
            case 'claude-code':
                return LLMProviderType.CLAUDE_CODE;
            case 'modelscope':
                return LLMProviderType.MODELSCOPE;
            case 'deepseek':
                return LLMProviderType.DEEPSEEK;
            case 'kimi':
                return LLMProviderType.KIMI;
            case 'glm':
                return LLMProviderType.GLM;
            case 'zhipu':
                return LLMProviderType.ZHIPU;
            case 'qwen':
                return LLMProviderType.QWEN;
            case 'doubao':
                return LLMProviderType.DOUBAO;
            case 'claude-api':
            default:
                return LLMProviderType.CLAUDE_API;
        }
    }

    getCurrentProvider(): LLMProvider | null {
        return this.currentProvider;
    }

    async refreshCurrentProvider(): Promise<boolean> {
        if (!this.currentProvider) {
            return false;
        }

        try {
            return await this.currentProvider.refreshConfiguration();
        } catch (error) {
            Logger.error(`Failed to refresh current provider: ${error}`);
            return false;
        }
    }

    async switchProvider(providerType: LLMProviderType): Promise<LLMProvider> {
        Logger.info(`Switching to provider: ${providerType}`);
        
        // Update configuration
        const config = vscode.workspace.getConfiguration('superdesign');
        await config.update('llmProvider', providerType, vscode.ConfigurationTarget.Global);
        
        // Get the new provider
        return await this.getProvider(providerType);
    }

    getAvailableProviders(): { type: LLMProviderType; name: string; description: string }[] {
        return [
            {
                type: LLMProviderType.CLAUDE_API,
                name: 'Claude API',
                description: 'Uses Anthropic API key to communicate with Claude via SDK'
            },
            {
                type: LLMProviderType.CLAUDE_CODE,
                name: 'Claude Code Binary',
                description: 'Uses local claude-code binary for enhanced code execution capabilities'
            },
            {
                type: LLMProviderType.MODELSCOPE,
                name: 'ModelScope (魔搭社区)',
                description: 'Uses ModelScope API for Chinese AI models like Qwen series'
            },
            {
                type: LLMProviderType.DEEPSEEK,
                name: 'DeepSeek',
                description: 'Uses DeepSeek API for advanced reasoning and coding capabilities'
            },
            {
                type: LLMProviderType.KIMI,
                name: 'Kimi (月之暗面)',
                description: 'Uses Kimi API for long context understanding and Chinese language optimization'
            },
            {
                type: LLMProviderType.GLM,
                name: 'GLM (智谱AI)',
                description: 'Uses GLM API for Chinese language optimization and multimodal capabilities'
            },
            {
                type: LLMProviderType.ZHIPU,
                name: 'Zhipu AI (智谱AI)',
                description: 'Uses Zhipu AI API for Chinese language understanding and generation'
            },
            {
                type: LLMProviderType.QWEN,
                name: 'Qwen (通义千问)',
                description: 'Uses Qwen API for general knowledge Q&A and long context processing'
            },
            {
                type: LLMProviderType.DOUBAO,
                name: 'Doubao (豆包)',
                description: 'Uses Doubao API for daily conversation and creative writing'
            }
        ];
    }

    async validateProvider(providerType: LLMProviderType): Promise<{ isValid: boolean; error?: string }> {
        try {
            const provider = await this.createProvider(providerType);
            const isValid = await provider.waitForInitialization();
            
            if (!isValid) {
                return { isValid: false, error: `Failed to initialize ${provider.getProviderName()}` };
            }

            // Additional validation based on provider type
            if (!provider.hasValidConfiguration()) {
                let errorMessage = '';
                
                switch (providerType) {
                    case LLMProviderType.CLAUDE_API:
                        errorMessage = 'API key is required for Claude API provider';
                        break;
                    case LLMProviderType.CLAUDE_CODE:
                        errorMessage = 'Claude Code binary is not available. Please install claude-code CLI tool.';
                        break;
                    case LLMProviderType.MODELSCOPE:
                        errorMessage = 'ModelScope API key is required. Please configure superdesign.modelScopeApiKey';
                        break;
                    case LLMProviderType.DEEPSEEK:
                        errorMessage = 'DeepSeek API key is required. Please configure superdesign.deepSeekApiKey';
                        break;
                    case LLMProviderType.KIMI:
                        errorMessage = 'Kimi API key is required. Please configure superdesign.kimiApiKey';
                        break;
                    case LLMProviderType.GLM:
                        errorMessage = 'GLM API key is required. Please configure superdesign.glmApiKey';
                        break;
                    case LLMProviderType.ZHIPU:
                        errorMessage = 'Zhipu AI API key is required. Please configure superdesign.zhipuApiKey';
                        break;
                    case LLMProviderType.QWEN:
                        errorMessage = 'Qwen API key is required. Please configure superdesign.qwenApiKey';
                        break;
                    case LLMProviderType.DOUBAO:
                        errorMessage = 'Doubao API key is required. Please configure superdesign.doubaoApiKey';
                        break;
                }
                
                return { isValid: false, error: errorMessage };
            }

            return { isValid: true };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return { isValid: false, error: errorMessage };
        }
    }

    // Method to get provider status for UI display
    async getProviderStatus(): Promise<{
        current: LLMProviderType;
        providers: Array<{
            type: LLMProviderType;
            name: string;
            status: 'ready' | 'error' | 'not_configured';
            error?: string;
        }>;
    }> {
        const currentType = this.getConfiguredProviderType();
        const availableProviders = this.getAvailableProviders();
        
        const providerStatuses = await Promise.all(
            availableProviders.map(async (provider) => {
                const validation = await this.validateProvider(provider.type);
                return {
                    type: provider.type,
                    name: provider.name,
                    status: validation.isValid ? 'ready' as const : 'error' as const,
                    error: validation.error
                };
            })
        );

        return {
            current: currentType,
            providers: providerStatuses
        };
    }

    // Clean up all providers
    dispose(): void {
        this.providers.clear();
        this.currentProvider = null;
    }

    // ===== 增强模型管理系统方法 =====

    /**
     * 启用增强模型管理系统
     */
    enableEnhancedSystem(): void {
        this.useEnhancedSystem = true;
        this.enhancedFactory?.initialize();
        Logger.info('Enhanced model management system enabled');
    }

    /**
     * 禁用增强模型管理系统
     */
    disableEnhancedSystem(): void {
        this.useEnhancedSystem = false;
        Logger.info('Enhanced model management system disabled');
    }

    /**
     * 获取增强的LLM提供商
     * @param providerName 提供商名称（可选）
     */
    getEnhancedProvider(providerName?: string): EnhancedLLMProvider | null {
        if (!this.useEnhancedSystem || !this.enhancedFactory) {
            return null;
        }
        
        try {
            return this.enhancedFactory.createLLMProvider(providerName);
        } catch (error) {
            Logger.error(`Failed to create enhanced provider: ${error}`);
            return null;
        }
    }

    /**
     * 切换到增强模型
     * @param providerName 提供商名称
     * @param modelId 模型ID（可选）
     */
    async switchToEnhancedModel(providerName: string, modelId?: string): Promise<boolean> {
        if (!this.useEnhancedSystem || !this.enhancedFactory) {
            Logger.warn('Enhanced system is not enabled');
            return false;
        }

        try {
            // 切换提供商
            await this.enhancedFactory.switchProvider(providerName);
            
            // 如果指定了模型ID，切换模型
            if (modelId) {
                const provider = this.getEnhancedProvider(providerName);
                if (provider) {
                    await provider.switchModel(modelId);
                }
            }
            
            Logger.info(`Switched to enhanced model: ${providerName}${modelId ? `:${modelId}` : ''}`);
            return true;
        } catch (error) {
            Logger.error(`Failed to switch to enhanced model: ${error}`);
            return false;
        }
    }

    /**
     * 获取增强系统的状态
     */
    getEnhancedSystemStatus(): any {
        if (!this.useEnhancedSystem || !this.enhancedFactory) {
            return {
                enabled: false,
                reason: 'Enhanced system not enabled or not initialized'
            };
        }

        return {
            enabled: true,
            ...this.enhancedFactory.getStatus()
        };
    }

    /**
     * 获取所有可用的增强模型
     */
    getAvailableEnhancedModels(): Record<string, any[]> {
        if (!this.useEnhancedSystem || !this.enhancedFactory) {
            return {};
        }

        return this.enhancedFactory.getAvailableModels();
    }

    /**
     * 配置增强提供商
     * @param providerName 提供商名称
     * @param config 配置
     */
    async configureEnhancedProvider(providerName: string, config: any): Promise<boolean> {
        if (!this.useEnhancedSystem || !this.enhancedFactory) {
            Logger.warn('Enhanced system is not enabled');
            return false;
        }

        try {
            await this.enhancedFactory.configureProvider(providerName, config);
            Logger.info(`Configured enhanced provider: ${providerName}`);
            return true;
        } catch (error) {
            Logger.error(`Failed to configure enhanced provider: ${error}`);
            return false;
        }
    }

    /**
     * 显示当前模型信息
     */
    showCurrentModelInfo(): void {
        if (this.useEnhancedSystem && this.enhancedFactory) {
            this.enhancedFactory.showModelInfo();
        } else {
            // 显示传统系统的信息
            const currentProvider = this.getCurrentProvider();
            if (currentProvider) {
                vscode.window.showInformationMessage(
                    `当前提供商: ${currentProvider.getProviderName()}\n` +
                    `模型: ${currentProvider.getModelDisplayName()}\n` +
                    `状态: ${currentProvider.isReady() ? '就绪' : '未就绪'}`
                );
            } else {
                vscode.window.showInformationMessage('当前没有活动的提供商');
            }
        }
    }

    /**
     * 导出增强系统配置
     * @param filePath 文件路径
     */
    async exportEnhancedConfigs(filePath: string): Promise<boolean> {
        if (!this.useEnhancedSystem || !this.enhancedFactory) {
            Logger.warn('Enhanced system is not enabled');
            return false;
        }

        try {
            await this.enhancedFactory.exportConfigs(filePath);
            return true;
        } catch (error) {
            Logger.error(`Failed to export enhanced configs: ${error}`);
            return false;
        }
    }

    /**
     * 导入增强系统配置
     * @param filePath 文件路径
     */
    async importEnhancedConfigs(filePath: string): Promise<boolean> {
        if (!this.useEnhancedSystem || !this.enhancedFactory) {
            Logger.warn('Enhanced system is not enabled');
            return false;
        }

        try {
            await this.enhancedFactory.importConfigs(filePath);
            return true;
        } catch (error) {
            Logger.error(`Failed to import enhanced configs: ${error}`);
            return false;
        }
    }

    /**
     * 使用增强提供商工厂进行提供商切换
     * @param providerName 提供商名称
     */
    async switchToEnhancedProvider(providerName: string): Promise<boolean> {
        if (!this.useEnhancedSystem || !this.enhancedProviderFactory) {
            Logger.warn('Enhanced provider system is not enabled');
            return false;
        }

        try {
            const success = await this.enhancedProviderFactory.switchProvider(providerName);
            if (success) {
                Logger.info(`Successfully switched to enhanced provider: ${providerName}`);
            }
            return success;
        } catch (error) {
            Logger.error(`Failed to switch to enhanced provider ${providerName}: ${error}`);
            return false;
        }
    }

    /**
     * 获取增强提供商状态
     */
    getEnhancedProviderStatus(): any {
        if (!this.useEnhancedSystem || !this.enhancedProviderFactory) {
            return {
                enabled: false,
                reason: 'Enhanced provider system not enabled'
            };
        }

        return this.enhancedProviderFactory.getStatus();
    }

    /**
     * 验证所有提供商配置
     */
    async validateAllProviderConfigs(): Promise<any> {
        if (!this.useEnhancedSystem || !this.enhancedProviderFactory) {
            Logger.warn('Enhanced provider system is not enabled');
            return { enabled: false };
        }

        try {
            const providers = this.enhancedProviderFactory.getProviders();
            const validationResults: any = {};

            for (const [name, instance] of providers) {
                try {
                    const validation = await this.enhancedProviderFactory.validateProvider(name);
                    validationResults[name] = validation;
                } catch (error) {
                    validationResults[name] = {
                        isValid: false,
                        error: String(error)
                    };
                }
            }

            return {
                enabled: true,
                results: validationResults,
                totalProviders: providers.size,
                validProviders: Object.values(validationResults).filter((r: any) => r.isValid).length
            };
        } catch (error) {
            Logger.error(`Failed to validate provider configs: ${error}`);
            return {
                enabled: true,
                error: String(error)
            };
        }
    }

    /**
     * 自动修复提供商配置
     */
    async autoRepairProviderConfigs(): Promise<any> {
        if (!this.useEnhancedSystem || !this.enhancedProviderFactory) {
            Logger.warn('Enhanced provider system is not enabled');
            return { enabled: false };
        }

        try {
            // 这里可以集成配置验证器的自动修复功能
            Logger.info('Auto-repair provider configs - feature coming soon');
            return {
                enabled: true,
                message: 'Auto-repair feature will be available soon'
            };
        } catch (error) {
            Logger.error(`Failed to auto-repair provider configs: ${error}`);
            return {
                enabled: true,
                error: String(error)
            };
        }
    }
}