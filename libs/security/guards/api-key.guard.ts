import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

export const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);
  private readonly validApiKeys: Set<string>;

  constructor(private reflector: Reflector) {
    // Em produção, use variáveis de ambiente ou banco de dados
    const apiKeys = process.env.API_KEYS?.split(',') || [
      'loomi-dev-key-123', // Development key
    ];
    this.validApiKeys = new Set(apiKeys);
  }

  canActivate(context: ExecutionContext): boolean {
    // Verificar se a rota é pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = this.extractApiKey(request);

    if (!apiKey) {
      this.logger.warn(
        `API Key não fornecida - IP: ${request.ip}, Path: ${request.path}`,
      );
      throw new UnauthorizedException(
        'API Key é obrigatória. Forneça via header X-API-Key',
      );
    }

    if (!this.validApiKeys.has(apiKey)) {
      this.logger.warn(
        `API Key inválida tentada - IP: ${request.ip}, Path: ${request.path}`,
      );
      throw new UnauthorizedException('API Key inválida');
    }

    // Log de acesso bem-sucedido
    this.logger.log(
      `Acesso autorizado - IP: ${request.ip}, Path: ${request.path}, Method: ${request.method}`,
    );

    return true;
  }

  private extractApiKey(request: Request): string | undefined {
    // Suporta múltiplos métodos de autenticação
    return (
      (request.headers['x-api-key'] as string) ||
      (request.headers['authorization']?.replace('Bearer ', '') as string) ||
      (request.query.apiKey as string)
    );
  }
}
