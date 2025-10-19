import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

/**
 * Configuração de CORS (Cross-Origin Resource Sharing)
 *
 * Define quais origens podem acessar a API
 */
export const corsConfig: CorsOptions = {
  // Origens permitidas
  origin: (origin, callback) => {
    // Lista de origens permitidas
    const whitelist = [
      'http://localhost:3000', // Frontend local
      'http://localhost:3001', // Clients app
      'http://localhost:3002', // Transactions app
      'http://localhost:15672', // RabbitMQ UI
      // Adicione seus domínios de produção aqui
      process.env.FRONTEND_URL,
      process.env.ALLOWED_ORIGIN,
      process.env.ALB_DNS, // URL do ALB na AWS
    ].filter(Boolean); // Remove undefined

    // Permitir requisições sem origem (Postman, curl, Swagger, etc)
    // Isso é comum em ferramentas de desenvolvimento e testes
    if (!origin) {
      return callback(null, true);
    }

    // Verificar se a origem está na whitelist
    if (whitelist.includes(origin)) {
      return callback(null, true);
    }

    // Permitir origens do ALB AWS (*.elb.amazonaws.com)
    if (origin.includes('.elb.amazonaws.com')) {
      return callback(null, true);
    }

    if (process.env.NODE_ENV !== 'production') {
      // Em desenvolvimento, permitir outras origens
      console.warn(`[CORS] Origem não listada permitida em dev: ${origin}`);
      return callback(null, true);
    } else {
      // Em produção, bloquear origens não listadas
      console.warn(`[CORS] Origem bloqueada em produção: ${origin}`);
      return callback(new Error('Origin não permitida pelo CORS'), false);
    }
  },
  // Métodos HTTP permitidos
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  // Headers permitidos
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-API-Key',
    'X-Requested-With',
    'Accept',
  ],
  // Headers expostos ao cliente
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
  // Permitir credenciais (cookies, authorization headers)
  credentials: true,
  // Tempo de cache do preflight (em segundos)
  maxAge: 3600, // 1 hora
  // Permitir OPTIONS sem autenticação
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
