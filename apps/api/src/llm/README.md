# LLM Module

This module provides LLM-assisted insights for the real estate analyzer application using an abstraction pattern that allows swapping between different LLM providers.

## Architecture

The LLM module uses a **provider pattern** for flexibility:

- **`ILLMProvider` Interface**: Common interface all providers implement
- **Provider Implementations**: 
  - `OllamaProvider`: Local LLM via Ollama
  - `MockLLMProvider`: Mock provider for testing
  - Future: `OpenAIProvider`, `AnthropicProvider`, etc.

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# LLM Provider Selection
LLM_PROVIDER=ollama  # Options: 'ollama', 'mock', 'openai', 'anthropic'

# Ollama Configuration (if using Ollama)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2  # or llama3, mistral, etc.

# OpenAI Configuration (if using OpenAI - future)
# OPENAI_API_KEY=your-api-key-here
# OPENAI_MODEL=gpt-4

# Anthropic Configuration (if using Anthropic - future)
# ANTHROPIC_API_KEY=your-api-key-here
# ANTHROPIC_MODEL=claude-3-opus-20240229
```

### Setting Up Ollama

1. **Install Ollama**: https://ollama.ai
2. **Pull a model**:
   ```bash
   ollama pull llama3.2
   # or
   ollama pull llama3
   # or
   ollama pull mistral
   ```
3. **Start Ollama** (usually runs automatically):
   ```bash
   ollama serve
   ```
4. **Verify it's running**:
   ```bash
   curl http://localhost:11434/api/tags
   ```

## Features

### 1. Property Analysis
- Comprehensive property analysis with strengths, weaknesses, opportunities, and risks
- Investment recommendation (strong_buy, buy, hold, avoid)
- Key metrics insights

**Endpoint**: `GET /llm/property/:propertyId/analysis`

### 2. Deal Recommendation
- AI-powered deal evaluation
- Risk assessment
- Suggested actions

**Endpoint**: `GET /llm/deal/:dealId/recommendation`

### 3. Risk Assessment
- Property or deal-based risk analysis
- Risk factors with severity levels
- Mitigation recommendations

**Endpoint**: `GET /llm/risk?propertyId=xxx` or `GET /llm/risk?dealId=xxx`

### 4. Investment Strategy
- Portfolio-wide investment strategy recommendations
- Target markets and property types
- Risk tolerance and time horizon

**Endpoint**: `GET /llm/strategy`

### 5. Market Commentary
- AI-generated market analysis and commentary
- Key trends and outlook

**Endpoint**: `GET /llm/market/:zipCode/commentary`

### 6. Property Description
- Natural language property descriptions
- Marketing copy generation
- Highlights and selling points

**Endpoint**: `GET /llm/property/:propertyId/description`

### 7. Portfolio Insights
- Context-aware portfolio insights
- Actionable recommendations
- Performance, risk, opportunity, and optimization insights

**Endpoint**: `GET /llm/portfolio/insights`

## Caching

LLM responses are cached for 24 hours by default to:
- Reduce API costs
- Improve response times
- Handle rate limits

Cache can be invalidated via the `LLMCacheService`.

## Adding a New Provider

1. Create a new provider class implementing `ILLMProvider`:
   ```typescript
   @Injectable()
   export class NewProvider implements ILLMProvider {
     async generate(request: LLMRequest): Promise<LLMResponse> {
       // Implementation
     }
     // ... other methods
   }
   ```

2. Register in `llm.module.ts`:
   ```typescript
   {
     provide: 'ILLMProvider',
     useFactory: (configService, ollama, mock, newProvider) => {
       const provider = configService.get<string>('LLM_PROVIDER');
       if (provider === 'new') return newProvider;
       // ... other providers
     },
     inject: [ConfigService, OllamaProvider, MockLLMProvider, NewProvider],
   }
   ```

## Testing

Use the mock provider for testing:
```bash
LLM_PROVIDER=mock
```

The mock provider returns deterministic responses without making API calls.

## Health Check

Check LLM provider availability:
```bash
GET /llm/health
```

Returns:
```json
{
  "available": true,
  "provider": "ollama",
  "models": ["llama3.2", "llama3"]
}
```

