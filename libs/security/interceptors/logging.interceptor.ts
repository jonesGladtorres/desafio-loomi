import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Interceptor para logging de segurança
 * Registra todas as requisições com informações relevantes
 */
@Injectable()
export class SecurityLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('SecurityAudit');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || 'Unknown';
    const startTime = Date.now();

    // Log da requisição
    this.logger.log({
      type: 'REQUEST',
      method,
      url,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
    });

    // Detectar comportamento suspeito
    this.detectSuspiciousBehavior(request);

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - startTime;
          this.logger.log({
            type: 'RESPONSE',
            method,
            url,
            ip,
            statusCode: context.switchToHttp().getResponse().statusCode,
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString(),
          });
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          this.logger.error({
            type: 'ERROR',
            method,
            url,
            ip,
            error: error.message,
            statusCode: error.status || 500,
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString(),
          });
        },
      }),
    );
  }

  private detectSuspiciousBehavior(request: any): void {
    const suspiciousPatterns = [
      /(\%27)|(\')|(\-\-)|(\%23)|(#)/i, // SQL Injection
      /<script|javascript:|onerror=|onload=/i, // XSS
      /\.\.\//i, // Path Traversal
      /eval\(|base64_decode|exec\(/i, // Code Injection
    ];

    const checkString = JSON.stringify({
      body: request.body,
      query: request.query,
      params: request.params,
    });

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(checkString)) {
        this.logger.warn({
          type: 'SUSPICIOUS_ACTIVITY',
          pattern: pattern.source,
          ip: request.ip,
          url: request.url,
          method: request.method,
          timestamp: new Date().toISOString(),
          alert: 'Possível tentativa de ataque detectada',
        });
        break;
      }
    }
  }
}
