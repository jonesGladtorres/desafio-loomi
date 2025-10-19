import { HelmetOptions } from 'helmet';

/**
 * Configuração do Helmet para proteção de headers HTTP
 *
 * Protege contra:
 * - XSS (Cross-Site Scripting)
 * - Clickjacking
 * - MIME Type Sniffing
 * - etc.
 *
 * Nota: Alguns headers são ajustados baseado no ambiente (HTTP vs HTTPS)
 */

// Detecta se está rodando em HTTPS
const isHttps =
  process.env.NODE_ENV === 'production' && process.env.FORCE_HTTPS === 'true';

export const helmetConfig: HelmetOptions = {
  // Content Security Policy - Desabilitado para compatibilidade com Swagger em HTTP
  // Quando migrar para HTTPS, ajustar conforme necessário
  contentSecurityPolicy: false,
  // Cross-Origin Policies - Desabilitados em HTTP
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false, // Desabilitado - requer HTTPS
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  // DNS Prefetch Control
  dnsPrefetchControl: { allow: false },
  // Frameguard (proteção contra clickjacking) - Mais permissivo para Swagger
  frameguard: { action: 'sameorigin' },
  // Hide Powered By
  hidePoweredBy: true,
  // HSTS (HTTP Strict Transport Security) - Apenas em HTTPS
  hsts: isHttps
    ? {
      maxAge: 31536000, // 1 ano
      includeSubDomains: true,
      preload: true,
    }
    : false,
  // IE No Open (proteção para IE8+)
  ieNoOpen: true,
  // No Sniff (proteção contra MIME sniffing)
  noSniff: true,
  // Origin Agent Cluster - Desabilitado em HTTP (requer HTTPS)
  originAgentCluster: false,
  // Permitted Cross Domain Policies
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  // Referrer Policy
  referrerPolicy: { policy: 'no-referrer' },
  // XSS Filter
  xssFilter: true,
};
