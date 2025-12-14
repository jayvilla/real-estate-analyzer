/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe, BadRequestException } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe with enhanced error messages
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      // Enhanced error messages
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map((error) => {
          const constraints = error.constraints || {};
          const messages = Object.values(constraints);
          return {
            field: error.property,
            message: messages[0] || 'Validation failed',
            value: error.value,
            constraints,
          };
        });

        // Return BadRequestException with validationErrors in the response
        const exception = new BadRequestException({
          message: 'Validation failed',
          error: 'Bad Request',
          statusCode: 400,
        });
        
        // Attach validationErrors to the exception response
        (exception as any).response = {
          ...exception.getResponse(),
          validationErrors: formattedErrors,
        };
        
        return exception;
      },
    }),
  );

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Swagger/OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('Real Estate Analyzer API')
    .setDescription(
      'Enterprise-grade real estate analysis platform API with AI-powered insights, deal scoring, market analysis, and natural language queries.'
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth'
    )
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .addTag('Properties', 'Property management endpoints')
    .addTag('Deals', 'Deal analysis and management endpoints')
    .addTag('Valuation', 'Property valuation and financial metrics')
    .addTag('Scoring', 'Automated deal scoring algorithms')
    .addTag('Market', 'Market trend analysis and data')
    .addTag('Analytics', 'Portfolio analytics and reporting')
    .addTag('LLM', 'AI-powered insights and analysis')
    .addTag('NLQ', 'Natural Language Query processing')
    .addTag('Summary', 'AI-generated summaries and reports')
    .addTag('AI Infrastructure', 'AI service management, cost tracking, feature flags, and A/B testing')
    .addServer('http://localhost:8000', 'Development server')
    .addServer('https://api.realestateanalyzer.com', 'Production server')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    deepScanRoutes: true,
  });
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Real Estate Analyzer API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
    },
  });

  const port = process.env.PORT || 8000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(
    `📚 Swagger documentation available at: http://localhost:${port}/api/docs`
  );
}

bootstrap();
