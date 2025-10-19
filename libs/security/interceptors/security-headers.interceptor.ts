import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Adiciona headers de segurança customizados às respostas
 * Ajusta automaticamente baseado no protocolo (HTTP vs HTTPS)
 */
@Injectable()
export class SecurityHeadersInterceptor implements NestInterceptor {
  private readonly isHttps: boolean;

  constructor() {
    // Detecta se deve forçar HTTPS headers
    this.isHttps =
      process.env.NODE_ENV === 'production' &&
      process.env.FORCE_HTTPS === 'true';
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      tap(() => {
        // Headers de segurança básicos (funcionam em HTTP e HTTPS)
        response.setHeader('X-Frame-Options', 'SAMEORIGIN'); // Permite iframe da mesma origem (para Swagger)
        response.setHeader('X-Content-Type-Options', 'nosniff');
        response.setHeader('X-XSS-Protection', '1; mode=block');

        // HSTS apenas em HTTPS
        if (this.isHttps) {
          response.setHeader(
            'Strict-Transport-Security',
            'max-age=31536000; includeSubDomains',
          );
        }

        // Remove header padrão do Express
        response.removeHeader('X-Powered-By');
      }),
    );
  }
}
