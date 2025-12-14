import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';
import { ILLMProvider } from './llm-provider.interface';
import { LLMRequest, LLMResponse } from '@real-estate-analyzer/types';
import { StructuredLoggerService } from '../../common/logging/structured-logger.service';

@Injectable()
export class OllamaProvider implements ILLMProvider {
  private readonly client: AxiosInstance;
  private readonly baseUrl: string;
  private readonly defaultModel: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: StructuredLoggerService
  ) {
    this.baseUrl =
      this.configService.get<string>('OLLAMA_URL') || 'http://localhost:11434';
    this.defaultModel =
      this.configService.get<string>('OLLAMA_MODEL') || 'llama3.2';

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 120000, // 2 minutes timeout for LLM responses
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  getName(): string {
    return 'ollama';
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/tags', { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      this.logger.warn(
        `Ollama provider not available: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'OllamaProvider',
        { baseUrl: this.baseUrl }
      );
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await this.client.get('/api/tags');
      return response.data.models?.map((m: any) => m.name) || [];
    } catch (error) {
      this.logger.warn(
        `Failed to fetch Ollama models: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'OllamaProvider'
      );
      return [this.defaultModel];
    }
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();
    const model = request.model || this.defaultModel;

    try {
      // Convert messages to Ollama format
      const prompt = this.formatMessagesToPrompt(request.messages);

      // Build request payload
      const payload: any = {
        model,
        prompt,
        stream: request.stream || false,
        options: {
          temperature: request.temperature || 0.7,
          num_predict: request.maxTokens || 2048,
        },
      };

      // Only add format: 'json' if the model supports it (llama3.2+)
      // For older models, we'll rely on prompt engineering and JSON extraction
      if (model.includes('3.2') || model.includes('3.1') || model.includes('mistral') || model.includes('mixtral')) {
        payload.format = 'json';
      }

      const response = await this.client.post('/api/generate', payload);

      const duration = Date.now() - startTime;

      this.logger.logWithMetadata(
        'info',
        `LLM generation completed`,
        {
          provider: 'ollama',
          model,
          duration,
          promptLength: prompt.length,
        },
        'OllamaProvider'
      );

      // Ollama returns response in data.response field
      const content = response.data.response || '';
      
      return {
        content,
        model,
        finishReason: response.data.done ? 'stop' : 'length',
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `LLM generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'OllamaProvider',
        {
          model,
          duration,
        }
      );
      throw error;
    }
  }

  /**
   * Convert chat messages to a single prompt string for Ollama
   */
  private formatMessagesToPrompt(messages: LLMRequest['messages']): string {
    return messages
      .map((msg) => {
        if (msg.role === 'system') {
          return `System: ${msg.content}`;
        } else if (msg.role === 'user') {
          return `User: ${msg.content}`;
        } else {
          return `Assistant: ${msg.content}`;
        }
      })
      .join('\n\n');
  }
}

