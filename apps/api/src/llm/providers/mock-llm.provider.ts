import { Injectable } from '@nestjs/common';
import { ILLMProvider } from './llm-provider.interface';
import { LLMRequest, LLMResponse } from '@real-estate-analyzer/types';

/**
 * Mock LLM Provider for testing and development
 * Returns deterministic responses without making actual API calls
 */
@Injectable()
export class MockLLMProvider implements ILLMProvider {
  getName(): string {
    return 'mock';
  }

  async isAvailable(): Promise<boolean> {
    return true; // Always available for testing
  }

  async getAvailableModels(): Promise<string[]> {
    return ['mock-model-1', 'mock-model-2'];
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Generate a mock response based on the last user message
    const lastUserMessage = request.messages
      .filter((m) => m.role === 'user')
      .pop()?.content || '';

    let mockResponse = 'This is a mock LLM response. ';

    // Add some context-aware mock responses
    if (lastUserMessage.toLowerCase().includes('property')) {
      mockResponse +=
        'Based on the property analysis, this appears to be a solid investment opportunity with good cash flow potential.';
    } else if (lastUserMessage.toLowerCase().includes('deal')) {
      mockResponse +=
        'This deal shows promising returns with a strong cap rate and positive cash-on-cash return.';
    } else if (lastUserMessage.toLowerCase().includes('risk')) {
      mockResponse +=
        'The risk assessment indicates moderate risk factors that can be mitigated through proper due diligence.';
    } else {
      mockResponse +=
        'The analysis suggests proceeding with caution and conducting thorough market research.';
    }

    return {
      content: mockResponse,
      model: request.model || 'mock-model-1',
      usage: {
        promptTokens: lastUserMessage.length / 4, // Rough estimate
        completionTokens: mockResponse.length / 4,
        totalTokens: (lastUserMessage.length + mockResponse.length) / 4,
      },
      finishReason: 'stop',
    };
  }
}

