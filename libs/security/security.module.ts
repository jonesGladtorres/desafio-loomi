import { Module, Global } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ApiKeyGuard } from './guards/api-key.guard';
import { SanitizeInterceptor } from './interceptors/sanitize.interceptor';
import { SecurityHeadersInterceptor } from './interceptors/security-headers.interceptor';
import { SecurityLoggingInterceptor } from './interceptors/logging.interceptor';

/**
 * Módulo de Segurança Global
 *
 * Fornece:
 * - Rate Limiting (proteção contra DDoS)
 * - API Key Authentication
 * - Sanitização de dados
 * - Headers de segurança
 * - Logging de auditoria
 */
@Global()
@Module({
  imports: [
    // Rate Limiting - Throttler
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 segundo
        limit: 10, // 10 requests por segundo
      },
      {
        name: 'medium',
        ttl: 60000, // 1 minuto
        limit: 100, // 100 requests por minuto
      },
      {
        name: 'long',
        ttl: 3600000, // 1 hora
        limit: 1000, // 1000 requests por hora
      },
    ]),
  ],
  providers: [
    // Guards Globais
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Rate limiting
    },
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard, // API Key authentication (comentar se não quiser global)
    },
    // Interceptors Globais
    {
      provide: APP_INTERCEPTOR,
      useClass: SecurityLoggingInterceptor, // Logging de auditoria
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SanitizeInterceptor, // Sanitização de dados
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SecurityHeadersInterceptor, // Headers de segurança
    },
  ],
  exports: [],
})
export class SecurityModule { }
