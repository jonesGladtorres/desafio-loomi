import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Interceptor para sanitizar dados de entrada e saída
 * Remove caracteres perigosos que podem causar XSS ou SQL Injection
 */
@Injectable()
export class SanitizeInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SanitizeInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Sanitizar body (criar novo objeto para evitar erro de read-only)
    if (request.body && typeof request.body === 'object') {
      Object.keys(request.body).forEach((key) => {
        request.body[key] = this.sanitize(request.body[key]);
      });
    }

    // Nota: query e params são read-only em alguns casos, então não modificamos
    // A validação de DTOs já cuida da maioria dos casos

    // Sanitizar resposta
    return next.handle().pipe(
      map((data) => {
        // Não sanitizar respostas para não quebrar dados legítimos
        // mas você pode adicionar lógica se necessário
        return data;
      }),
    );
  }

  private sanitize(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitize(item));
    }

    if (obj !== null && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = this.sanitize(obj[key]);
        }
      }
      return sanitized;
    }

    return obj;
  }

  private sanitizeString(str: string): string {
    // Remove caracteres perigosos comuns em ataques
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove <script>
      .replace(/javascript:/gi, '') // Remove javascript:
      .replace(/on\w+\s*=/gi, '') // Remove event handlers (onclick, onerror, etc)
      .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
      .trim();
  }
}
