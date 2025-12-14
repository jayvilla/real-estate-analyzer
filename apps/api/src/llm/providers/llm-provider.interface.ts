import { LLMRequest, LLMResponse } from '@real-estate-analyzer/types';

/**
 * LLM Provider Interface
 * All LLM providers must implement this interface
 */
export interface ILLMProvider {
  /**
   * Generate a completion from the LLM
   */
  generate(request: LLMRequest): Promise<LLMResponse>;

  /**
   * Check if the provider is available/healthy
   */
  isAvailable(): Promise<boolean>;

  /**
   * Get the provider name
   */
  getName(): string;

  /**
   * Get available models for this provider
   */
  getAvailableModels(): Promise<string[]>;
}

