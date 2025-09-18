import * as vscode from 'vscode';
import { LLMProvider, LLMProviderType } from './llmProvider';
import { ClaudeApiProvider } from './claudeApiProvider';
import { ClaudeCodeProvider } from './claudeCodeProvider';
import { ModelScopeProvider } from './modelScopeProvider';
import { DeepSeekProvider } from './deepSeekProvider';
import { KimiProvider } from './kimiProvider';
import { GLMProvider } from './glmProvider';
import { Logger } from '../services/logger';

export class LLMProviderFactory {
    private static instance: LLMProviderFactory;
    private providers: Map<LLMProviderType, LLMProvider> = new Map();
    private currentProvider: LLMProvider | null = null;

    private constructor(private outputChannel: vscode.OutputChannel) {}

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
            
            default:
                throw new Error(`Unknown provider type: ${providerType}`);
        }
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
                name: 'Kimi (Moonshot AI)',
                description: 'Uses Kimi API for long context understanding and Chinese language optimization'
            },
            {
                type: LLMProviderType.GLM,
                name: 'GLM (智谱AI)',
                description: 'Uses GLM API for Chinese language optimization and multimodal capabilities'
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
}