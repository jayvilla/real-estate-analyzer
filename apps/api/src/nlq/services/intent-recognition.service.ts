import { Injectable, Inject } from '@nestjs/common';
import { QueryIntent, ExtractedEntity, EntityType, QueryIntentResult, LLMMessage } from '@real-estate-analyzer/types';
import { ILLMProvider } from '../../llm/providers/llm-provider.interface';
import { StructuredLoggerService } from '../../common/logging/structured-logger.service';

@Injectable()
export class IntentRecognitionService {
  constructor(
    @Inject('ILLMProvider')
    private readonly llmProvider: ILLMProvider,
    private readonly logger: StructuredLoggerService
  ) {}

  /**
   * Recognize intent and extract entities from natural language query
   */
  async recognizeIntent(query: string): Promise<QueryIntentResult> {
    const startTime = Date.now();

    try {
      const prompt = this.buildIntentRecognitionPrompt(query);
      // Use LLM directly - we'll create a helper method
      const response = await this.generateWithLLM(prompt);

      const result = this.parseIntentResponse(response.content);
      
      const duration = Date.now() - startTime;
      this.logger.logWithMetadata(
        'info',
        `Intent recognized for query`,
        {
          query: query.substring(0, 100),
          intent: result.intent,
          entityCount: result.entities.length,
          duration,
        },
        'IntentRecognitionService'
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to recognize intent: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'IntentRecognitionService',
        { query: query.substring(0, 100) }
      );

      // Fallback to simple pattern matching
      return this.fallbackIntentRecognition(query);
    }
  }

  /**
   * Generate response using LLM
   */
  private async generateWithLLM(prompt: string): Promise<any> {
    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: 'You are a query intent recognition system for a real estate investment analyzer. Analyze queries and extract intent and entities.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    return await this.llmProvider.generate({
      messages,
      temperature: 0.3, // Lower temperature for more consistent parsing
      maxTokens: 1024,
    });
  }

  /**
   * Build prompt for intent recognition
   */
  private buildIntentRecognitionPrompt(query: string): string {
    return `Analyze this real estate query and extract intent and entities:

Query: "${query}"

Available intents:
- search: Find properties or deals
- filter: Filter properties or deals by criteria
- analyze: Analyze metrics, trends, or performance
- compare: Compare properties, deals, or metrics
- calculate: Calculate values (ROI, cap rate, etc.)
- list: List items (properties, deals, etc.)
- show: Display information
- find: Find specific items

Available entity types:
- property: Property references
- deal: Deal references
- metric: Metrics (cap rate, ROI, cash flow, etc.)
- location: Locations (city, state, zip code, address)
- date: Dates or date ranges
- number: Numeric values
- status: Status values (active, closed, etc.)

Return JSON in this format:
{
  "intent": "search|filter|analyze|compare|calculate|list|show|find",
  "confidence": 0.95,
  "entities": [
    {
      "type": "property|deal|metric|location|date|number|status",
      "value": "extracted value",
      "confidence": 0.9,
      "originalText": "text from query"
    }
  ],
  "parameters": {
    "field": "value",
    "operator": "eq|gt|lt|like|in",
    "value": "actual value"
  }
}

Be specific and extract all relevant entities.`;
  }

  /**
   * Parse LLM response for intent recognition
   */
  private parseIntentResponse(content: string): QueryIntentResult {
    try {
      // Remove markdown code blocks if present
      let cleaned = content.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }

      const parsed = JSON.parse(cleaned);
      
      return {
        intent: parsed.intent as QueryIntent || QueryIntent.UNKNOWN,
        confidence: parsed.confidence || 0.5,
        entities: parsed.entities || [],
        parameters: parsed.parameters || {},
      };
    } catch (error) {
      this.logger.warn(
        `Failed to parse intent response, using fallback`,
        'IntentRecognitionService'
      );
      throw error;
    }
  }

  /**
   * Fallback intent recognition using pattern matching
   */
  private fallbackIntentRecognition(query: string): QueryIntentResult {
    const lowerQuery = query.toLowerCase();
    let intent = QueryIntent.UNKNOWN;
    const entities: ExtractedEntity[] = [];

    // Simple pattern matching
    if (lowerQuery.includes('find') || lowerQuery.includes('search') || lowerQuery.includes('show me')) {
      intent = QueryIntent.SEARCH;
    } else if (lowerQuery.includes('filter') || lowerQuery.includes('where') || lowerQuery.includes('with')) {
      intent = QueryIntent.FILTER;
    } else if (lowerQuery.includes('analyze') || lowerQuery.includes('analysis') || lowerQuery.includes('trend')) {
      intent = QueryIntent.ANALYZE;
    } else if (lowerQuery.includes('compare') || lowerQuery.includes('vs') || lowerQuery.includes('versus')) {
      intent = QueryIntent.COMPARE;
    } else if (lowerQuery.includes('calculate') || lowerQuery.includes('what is') || lowerQuery.includes('how much')) {
      intent = QueryIntent.CALCULATE;
    } else if (lowerQuery.includes('list') || lowerQuery.includes('all')) {
      intent = QueryIntent.LIST;
    } else if (lowerQuery.includes('show') || lowerQuery.includes('display')) {
      intent = QueryIntent.SHOW;
    }

    // Extract basic entities
    const propertyMatch = query.match(/\b(property|properties)\b/i);
    if (propertyMatch) {
      entities.push({
        type: EntityType.PROPERTY,
        value: 'property',
        confidence: 0.8,
        originalText: propertyMatch[0],
      });
    }

    const dealMatch = query.match(/\b(deal|deals)\b/i);
    if (dealMatch) {
      entities.push({
        type: EntityType.DEAL,
        value: 'deal',
        confidence: 0.8,
        originalText: dealMatch[0],
      });
    }

    // Extract numbers
    const numberMatches = query.match(/\d+/g);
    if (numberMatches) {
      numberMatches.forEach((num) => {
        entities.push({
          type: EntityType.NUMBER,
          value: num,
          confidence: 0.9,
          originalText: num,
        });
      });
    }

    return {
      intent,
      confidence: 0.6,
      entities,
      parameters: {},
    };
  }
}

