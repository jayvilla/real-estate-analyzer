import { test, expect } from '@playwright/test';

/**
 * E2E Tests for AI Features
 * 
 * These tests verify end-to-end functionality of AI features:
 * - Property analysis
 * - Deal recommendations
 * - Natural language queries
 * - AI insights panel
 * - Summary generation
 */

test.describe('AI Features', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page and authenticate
    await page.goto('/login');
    
    // Fill in login credentials (adjust based on your auth setup)
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL('/**');
  });

  test.describe('AI Insights Panel', () => {
    test('should display AI insights panel', async ({ page }) => {
      await page.goto('/ai-insights');
      
      // Check that insights panel is visible
      await expect(page.locator('[data-testid="ai-insights-panel"]')).toBeVisible();
      
      // Check that tabs are present
      await expect(page.locator('text=Property Analysis')).toBeVisible();
      await expect(page.locator('text=Portfolio Insights')).toBeVisible();
    });

    test('should switch between insight tabs', async ({ page }) => {
      await page.goto('/ai-insights');
      
      // Click on Portfolio Insights tab
      await page.click('text=Portfolio Insights');
      
      // Verify content changes
      await expect(page.locator('text=Portfolio Insights')).toHaveClass(/active/);
    });
  });

  test.describe('Property Analysis', () => {
    test('should generate property analysis', async ({ page }) => {
      // Navigate to properties page
      await page.goto('/properties');
      
      // Select a property (assuming there's a property list)
      const firstProperty = page.locator('[data-testid="property-item"]').first();
      if (await firstProperty.count() > 0) {
        await firstProperty.click();
        
        // Click AI Analysis button
        await page.click('text=AI Analysis');
        
        // Wait for analysis to load
        await page.waitForSelector('[data-testid="property-analysis"]', { timeout: 30000 });
        
        // Verify analysis content
        await expect(page.locator('[data-testid="property-analysis"]')).toBeVisible();
        await expect(page.locator('text=Strengths')).toBeVisible();
        await expect(page.locator('text=Recommendations')).toBeVisible();
      }
    });

    test('should show loading state during analysis', async ({ page }) => {
      await page.goto('/properties');
      
      const firstProperty = page.locator('[data-testid="property-item"]').first();
      if (await firstProperty.count() > 0) {
        await firstProperty.click();
        await page.click('text=AI Analysis');
        
        // Check for loading indicator
        await expect(page.locator('[data-testid="loading-state"]')).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Natural Language Queries', () => {
    test('should process natural language query', async ({ page }) => {
      await page.goto('/ai-insights');
      
      // Switch to Chat tab
      await page.click('text=Chat');
      
      // Enter a query
      const queryInput = page.locator('input[placeholder*="Ask a question"]');
      await queryInput.fill('Show me all properties in California');
      
      // Submit query
      await page.click('button:has-text("Send")');
      
      // Wait for response
      await page.waitForSelector('[data-testid="chat-message"]', { timeout: 30000 });
      
      // Verify response is displayed
      const messages = page.locator('[data-testid="chat-message"]');
      await expect(messages.last()).toBeVisible();
    });

    test('should display query suggestions', async ({ page }) => {
      await page.goto('/ai-insights');
      await page.click('text=Chat');
      
      // Check for suggestions
      await expect(page.locator('text=Try:')).toBeVisible({ timeout: 5000 });
      
      // Click a suggestion
      const suggestion = page.locator('[data-testid="query-suggestion"]').first();
      if (await suggestion.count() > 0) {
        await suggestion.click();
        
        // Verify suggestion is filled in input
        const input = page.locator('input[placeholder*="Ask a question"]');
        await expect(input).not.toHaveValue('');
      }
    });

    test('should show query history', async ({ page }) => {
      await page.goto('/ai-insights');
      await page.click('text=Chat');
      
      // Check for history (may be empty initially)
      const historyItems = page.locator('[data-testid="query-history-item"]');
      const count = await historyItems.count();
      
      // If history exists, verify it's displayed
      if (count > 0) {
        await expect(historyItems.first()).toBeVisible();
      }
    });
  });

  test.describe('Deal Score Visualization', () => {
    test('should display deal score visualization', async ({ page }) => {
      // Navigate to deals page
      await page.goto('/deals');
      
      // Select a deal
      const firstDeal = page.locator('[data-testid="deal-item"]').first();
      if (await firstDeal.count() > 0) {
        await firstDeal.click();
        
        // Check for score visualization
        await expect(page.locator('[data-testid="deal-score-visualization"]')).toBeVisible({ timeout: 10000 });
        
        // Verify score is displayed
        await expect(page.locator('text=/Score|\\d+/')).toBeVisible();
      }
    });
  });

  test.describe('AI Preferences', () => {
    test('should display AI preferences', async ({ page }) => {
      await page.goto('/ai-insights');
      
      // Click Preferences tab
      await page.click('text=Preferences');
      
      // Verify preferences form is visible
      await expect(page.locator('[data-testid="ai-preferences"]')).toBeVisible();
      
      // Check for preference options
      await expect(page.locator('text=Auto-generate Summaries')).toBeVisible();
      await expect(page.locator('text=Preferred AI Provider')).toBeVisible();
    });

    test('should save AI preferences', async ({ page }) => {
      await page.goto('/ai-insights');
      await page.click('text=Preferences');
      
      // Toggle a preference
      const autoGenerateToggle = page.locator('input[type="checkbox"]').first();
      const initialValue = await autoGenerateToggle.isChecked();
      
      await autoGenerateToggle.click();
      
      // Verify toggle state changed
      await expect(autoGenerateToggle).toHaveProperty('checked', !initialValue);
      
      // Reload page and verify preference persisted
      await page.reload();
      await page.click('text=Preferences');
      await expect(autoGenerateToggle).toHaveProperty('checked', !initialValue);
    });
  });

  test.describe('Error Handling', () => {
    test('should display error message on API failure', async ({ page, context }) => {
      // Intercept and fail AI API calls
      await context.route('**/api/llm/**', (route) => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'AI service unavailable' }),
        });
      });

      await page.goto('/ai-insights');
      
      // Try to generate analysis
      const firstProperty = page.locator('[data-testid="property-item"]').first();
      if (await firstProperty.count() > 0) {
        await firstProperty.click();
        await page.click('text=AI Analysis');
        
        // Verify error message is displayed
        await expect(page.locator('[data-testid="error-state"]')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=/error|failed/i')).toBeVisible();
      }
    });

    test('should allow retry after error', async ({ page }) => {
      // First, cause an error
      await page.route('**/api/llm/**', (route) => {
        route.fulfill({ status: 500 });
      });

      await page.goto('/ai-insights');
      
      // Then, allow success
      await page.route('**/api/llm/**', (route) => {
        route.continue();
      });

      // Click retry button if present
      const retryButton = page.locator('button:has-text("Retry")');
      if (await retryButton.count() > 0) {
        await retryButton.click();
        
        // Verify retry attempt
        await expect(page.locator('[data-testid="loading-state"]')).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Loading States', () => {
    test('should show loading state during AI operations', async ({ page }) => {
      // Slow down API responses
      await page.route('**/api/llm/**', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await route.continue();
      });

      await page.goto('/ai-insights');
      
      // Trigger an AI operation
      const firstProperty = page.locator('[data-testid="property-item"]').first();
      if (await firstProperty.count() > 0) {
        await firstProperty.click();
        await page.click('text=AI Analysis');
        
        // Verify loading indicator appears
        await expect(page.locator('[data-testid="loading-state"]')).toBeVisible({ timeout: 2000 });
      }
    });
  });

  test.describe('Summary Generation', () => {
    test('should generate portfolio summary', async ({ page }) => {
      await page.goto('/ai-insights');
      
      // Navigate to summary generation (if available)
      // This would depend on your UI implementation
      
      // Look for summary generation button
      const summaryButton = page.locator('button:has-text("Generate Summary")');
      if (await summaryButton.count() > 0) {
        await summaryButton.click();
        
        // Wait for summary
        await page.waitForSelector('[data-testid="summary-display"]', { timeout: 30000 });
        
        // Verify summary is displayed
        await expect(page.locator('[data-testid="summary-display"]')).toBeVisible();
      }
    });
  });
});

