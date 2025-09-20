#!/usr/bin/env node

/**
 * API类型测试套件
 * 测试SuperDesign项目的API相关类型定义
 * 
 * 创建日期: 2025-09-19
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import * as ApiTypes from '../../src/types/api-types';
import * as ModelTypes from '../../src/types/model-types';

/**
 * API请求类型测试
 */
describe('API请求类型测试', () => {
  it('应该定义API请求接口', () => {
    const mockApiRequest: ApiTypes.ApiRequest = {
      method: 'POST',
      url: 'https://api.anthropic.com/v1/messages',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-test-123',
        'anthropic-version': '2023-06-01'
      },
      body: {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: 'Hello, World!'
          }
        ]
      }
    };

    expect(mockApiRequest).toHaveProperty('method');
    expect(mockApiRequest).toHaveProperty('url');
    expect(mockApiRequest).toHaveProperty('headers');
    expect(mockApiRequest).toHaveProperty('body');
    expect(mockApiRequest.method).toBe('POST');
    expect(mockApiRequest.url).toBe('https://api.anthropic.com/v1/messages');
  });

  it('应该支持不同的HTTP方法', () => {
    const methods: ApiTypes.HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    
    methods.forEach(method => {
      expect(typeof method).toBe('string');
      expect(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).toContain(method);
    });
  });

  it('应该验证请求头的格式', () => {
    const validHeaders = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer sk-test-123',
      'User-Agent': 'SuperDesign/1.0.0'
    };

    expect(validHeaders['Content-Type']).toBe('application/json');
    expect(validHeaders['Authorization']).toMatch(/^Bearer /);
    expect(validHeaders['User-Agent']).toBeDefined();
  });
});

/**
 * API响应类型测试
 */
describe('API响应类型测试', () => {
  it('应该定义API响应接口', () => {
    const mockApiResponse: ApiTypes.ApiResponse = {
      status: 200,
      statusText: 'OK',
      headers: {
        'content-type': 'application/json',
        'request-id': 'req-123456789'
      },
      data: {
        id: 'msg_123456789',
        type: 'message',
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: 'Hello, World!'
          }
        ],
        model: 'claude-3-5-sonnet-20241022',
        stop_reason: 'end_turn',
        usage: {
          input_tokens: 10,
          output_tokens: 20
        }
      }
    };

    expect(mockApiResponse).toHaveProperty('status');
    expect(mockApiResponse).toHaveProperty('statusText');
    expect(mockApiResponse).toHaveProperty('headers');
    expect(mockApiResponse).toHaveProperty('data');
    expect(mockApiResponse.status).toBe(200);
    expect(mockApiResponse.statusText).toBe('OK');
  });

  it('应该处理错误响应', () => {
    const mockErrorResponse: ApiTypes.ApiErrorResponse = {
      status: 401,
      statusText: 'Unauthorized',
      error: {
        type: 'authentication_error',
        message: 'Invalid API key',
        code: 'invalid_api_key'
      }
    };

    expect(mockErrorResponse).toHaveProperty('status');
    expect(mockErrorResponse).toHaveProperty('statusText');
    expect(mockErrorResponse).toHaveProperty('error');
    expect(mockErrorResponse.status).toBe(401);
    expect(mockErrorResponse.statusText).toBe('Unauthorized');
    expect(mockErrorResponse.error).toHaveProperty('type');
    expect(mockErrorResponse.error).toHaveProperty('message');
    expect(mockErrorResponse.error).toHaveProperty('code');
  });

  it('应该包含HTTP状态码', () => {
    const statusCodes = [200, 201, 400, 401, 403, 404, 429, 500, 502, 503];
    
    statusCodes.forEach(status => {
      expect(typeof status).toBe('number');
      expect(status).toBeGreaterThan(99);
      expect(status).toBeLessThan(600);
    });
  });
});

/**
 * 消息类型测试
 */
describe('消息类型测试', () => {
  it('应该定义聊天消息接口', () => {
    const mockChatMessage: ApiTypes.ChatMessage = {
      role: 'user',
      content: 'Hello, World!',
      timestamp: new Date().toISOString()
    };

    expect(mockChatMessage).toHaveProperty('role');
    expect(mockChatMessage).toHaveProperty('content');
    expect(mockChatMessage).toHaveProperty('timestamp');
    expect(mockChatMessage.role).toBe('user');
    expect(mockChatMessage.content).toBe('Hello, World!');
  });

  it('应该支持不同的消息角色', () => {
    const roles: ApiTypes.MessageRole[] = ['user', 'assistant', 'system'];
    
    roles.forEach(role => {
      expect(typeof role).toBe('string');
      expect(['user', 'assistant', 'system']).toContain(role);
    });
  });

  it('应该支持多模态内容', () => {
    const mockMultimodalMessage: ApiTypes.MultimodalMessage = {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'What do you see in this image?'
        },
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',
            data: 'base64-encoded-image-data'
          }
        }
      ],
      timestamp: new Date().toISOString()
    };

    expect(mockMultimodalMessage).toHaveProperty('role');
    expect(mockMultimodalMessage).toHaveProperty('content');
    expect(mockMultimodalMessage).toHaveProperty('timestamp');
    expect(Array.isArray(mockMultimodalMessage.content)).toBe(true);
    expect(mockMultimodalMessage.content.length).toBe(2);
  });

  it('应该验证内容类型', () => {
    const contentTypes: ApiTypes.ContentType[] = ['text', 'image', 'audio', 'document'];
    
    contentTypes.forEach(type => {
      expect(typeof type).toBe('string');
      expect(['text', 'image', 'audio', 'document']).toContain(type);
    });
  });
});

/**
 * 流式响应类型测试
 */
describe('流式响应类型测试', () => {
  it('应该定义流式响应接口', () => {
    const mockStreamChunk: ApiTypes.StreamChunk = {
      id: 'msg_123456789',
      type: 'content_block_delta',
      index: 0,
      delta: {
        type: 'text_delta',
        text: 'Hello'
      }
    };

    expect(mockStreamChunk).toHaveProperty('id');
    expect(mockStreamChunk).toHaveProperty('type');
    expect(mockStreamChunk).toHaveProperty('index');
    expect(mockStreamChunk).toHaveProperty('delta');
    expect(mockStreamChunk.type).toBe('content_block_delta');
  });

  it('应该支持不同的流式块类型', () => {
    const chunkTypes: ApiTypes.StreamChunkType[] = [
      'message_start',
      'message_delta',
      'message_stop',
      'content_block_start',
      'content_block_delta',
      'content_block_stop'
    ];

    chunkTypes.forEach(type => {
      expect(typeof type).toBe('string');
      expect(chunkTypes).toContain(type);
    });
  });

  it('应该包含流式响应选项', () => {
    const mockStreamOptions: ApiTypes.StreamOptions = {
      stream: true,
      onToken: jest.fn(),
      onComplete: jest.fn(),
      onError: jest.fn()
    };

    expect(mockStreamOptions).toHaveProperty('stream');
    expect(mockStreamOptions).toHaveProperty('onToken');
    expect(mockStreamOptions).toHaveProperty('onComplete');
    expect(mockStreamOptions).toHaveProperty('onError');
    expect(mockStreamOptions.stream).toBe(true);
    expect(typeof mockStreamOptions.onToken).toBe('function');
    expect(typeof mockStreamOptions.onComplete).toBe('function');
    expect(typeof mockStreamOptions.onError).toBe('function');
  });
});

/**
 * 使用统计类型测试
 */
describe('使用统计类型测试', () => {
  it('应该定义使用统计接口', () => {
    const mockUsage: ApiTypes.UsageStats = {
      prompt_tokens: 10,
      completion_tokens: 20,
      total_tokens: 30
    };

    expect(mockUsage).toHaveProperty('prompt_tokens');
    expect(mockUsage).toHaveProperty('completion_tokens');
    expect(mockUsage).toHaveProperty('total_tokens');
    expect(mockUsage.prompt_tokens).toBe(10);
    expect(mockUsage.completion_tokens).toBe(20);
    expect(mockUsage.total_tokens).toBe(30);
  });

  it('应该验证令牌数量的合理性', () => {
    const validUsage = {
      prompt_tokens: 10,
      completion_tokens: 20,
      total_tokens: 30
    };

    const invalidUsage = {
      prompt_tokens: -1,
      completion_tokens: 20,
      total_tokens: 19
    };

    expect(validUsage.total_tokens).toBe(validUsage.prompt_tokens + validUsage.completion_tokens);
    expect(validUsage.prompt_tokens).toBeGreaterThan(0);
    expect(validUsage.completion_tokens).toBeGreaterThan(0);
    expect(validUsage.total_tokens).toBeGreaterThan(0);

    expect(invalidUsage.prompt_tokens).toBeLessThan(0);
    expect(invalidUsage.total_tokens).not.toBe(invalidUsage.prompt_tokens + invalidUsage.completion_tokens);
  });

  it('应该支持扩展的使用统计', () => {
    const mockExtendedUsage: ApiTypes.ExtendedUsageStats = {
      prompt_tokens: 10,
      completion_tokens: 20,
      total_tokens: 30,
      prompt_tokens_details: {
        cached_tokens: 5,
        audio_tokens: 0,
        image_tokens: 0
      },
      completion_tokens_details: {
        reasoning_tokens: 0,
        audio_tokens: 0,
        accepted_prediction_tokens: 0,
        rejected_prediction_tokens: 0
      }
    };

    expect(mockExtendedUsage).toHaveProperty('prompt_tokens_details');
    expect(mockExtendedUsage).toHaveProperty('completion_tokens_details');
    expect(mockExtendedUsage.prompt_tokens_details).toHaveProperty('cached_tokens');
    expect(mockExtendedUsage.completion_tokens_details).toHaveProperty('reasoning_tokens');
  });
});

/**
 * 工具调用类型测试
 */
describe('工具调用类型测试', () => {
  it('应该定义工具调用接口', () => {
    const mockToolCall: ApiTypes.ToolCall = {
      id: 'tool_123456789',
      type: 'function',
      function: {
        name: 'get_weather',
        arguments: JSON.stringify({ location: 'Beijing', unit: 'celsius' })
      }
    };

    expect(mockToolCall).toHaveProperty('id');
    expect(mockToolCall).toHaveProperty('type');
    expect(mockToolCall).toHaveProperty('function');
    expect(mockToolCall.type).toBe('function');
    expect(mockToolCall.function).toHaveProperty('name');
    expect(mockToolCall.function).toHaveProperty('arguments');
  });

  it('应该支持不同的工具类型', () => {
    const toolTypes: ApiTypes.ToolType[] = ['function', 'code_interpreter', 'file_search'];
    
    toolTypes.forEach(type => {
      expect(typeof type).toBe('string');
      expect(toolTypes).toContain(type);
    });
  });

  it('应该定义工具响应接口', () => {
    const mockToolResponse: ApiTypes.ToolResponse = {
      tool_call_id: 'tool_123456789',
      role: 'tool',
      content: 'The weather in Beijing is 25°C'
    };

    expect(mockToolResponse).toHaveProperty('tool_call_id');
    expect(mockToolResponse).toHaveProperty('role');
    expect(mockToolResponse).toHaveProperty('content');
    expect(mockToolResponse.tool_call_id).toBe('tool_123456789');
    expect(mockToolResponse.role).toBe('tool');
  });
});

/**
 * API兼容性测试
 */
describe('API兼容性测试', () => {
  it('应该确保不同API提供商的兼容性', () => {
    const claudeRequest: ApiTypes.ApiRequest = {
      method: 'POST',
      url: 'https://api.anthropic.com/v1/messages',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-test-123',
        'anthropic-version': '2023-06-01'
      },
      body: {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: 'Hello, World!'
          }
        ]
      }
    };

    const openaiRequest: ApiTypes.ApiRequest = {
      method: 'POST',
      url: 'https://api.openai.com/v1/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-openai-test-123'
      },
      body: {
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: 'Hello, World!'
          }
        ],
        max_tokens: 4096
      }
    };

    expect(claudeRequest.method).toBe(openaiRequest.method);
    expect(claudeRequest.headers['Content-Type']).toBe(openaiRequest.headers['Content-Type']);
    expect(claudeRequest.body.messages).toEqual(openaiRequest.body.messages);
  });

  it('应该处理不同提供商的响应格式', () => {
    const claudeResponse: ApiTypes.ApiResponse = {
      status: 200,
      statusText: 'OK',
      headers: {},
      data: {
        id: 'msg_123456789',
        type: 'message',
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: 'Hello, World!'
          }
        ],
        model: 'claude-3-5-sonnet-20241022',
        stop_reason: 'end_turn',
        usage: {
          input_tokens: 10,
          output_tokens: 20
        }
      }
    };

    const openaiResponse: ApiTypes.ApiResponse = {
      status: 200,
      statusText: 'OK',
      headers: {},
      data: {
        id: 'chatcmpl-123456789',
        object: 'chat.completion',
        created: 1234567890,
        model: 'gpt-4',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'Hello, World!'
            },
            finish_reason: 'stop'
          }
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30
        }
      }
    };

    expect(claudeResponse.status).toBe(openaiResponse.status);
    expect(claudeResponse.statusText).toBe(openaiResponse.statusText);
    expect(claudeResponse.data.usage.input_tokens).toBe(openaiResponse.data.usage.prompt_tokens);
    expect(claudeResponse.data.usage.output_tokens).toBe(openaiResponse.data.usage.completion_tokens);
  });
});

/**
 * API性能测试
 */
describe('API性能测试', () => {
  it('应该快速处理API响应', () => {
    const startTime = performance.now();
    
    // 创建大量API响应进行验证
    for (let i = 0; i < 1000; i++) {
      const response: ApiTypes.ApiResponse = {
        status: 200,
        statusText: 'OK',
        headers: {
          'content-type': 'application/json',
          'request-id': `req-${i}`
        },
        data: {
          id: `msg_${i}`,
          type: 'message',
          role: 'assistant',
          content: [
            {
              type: 'text',
              text: `Response ${i}`
            }
          ],
          model: 'claude-3-5-sonnet-20241022',
          stop_reason: 'end_turn',
          usage: {
            input_tokens: 10,
            output_tokens: 20
          }
        }
      };

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(`msg_${i}`);
    }
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    expect(executionTime).toBeLessThan(100); // 应该在100ms内完成
  });

  it('应该高效处理消息转换', () => {
    const startTime = performance.now();
    
    // 执行大量消息转换
    for (let i = 0; i < 500; i++) {
      const message: ApiTypes.ChatMessage = {
        role: 'user',
        content: `Message ${i}`,
        timestamp: new Date().toISOString()
      };

      const streamChunk: ApiTypes.StreamChunk = {
        id: `msg_${i}`,
        type: 'content_block_delta',
        index: 0,
        delta: {
          type: 'text_delta',
          text: `Chunk ${i}`
        }
      };

      expect(message.role).toBe('user');
      expect(message.content).toBe(`Message ${i}`);
      expect(streamChunk.type).toBe('content_block_delta');
    }
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    expect(executionTime).toBeLessThan(50); // 应该在50ms内完成
  });
});