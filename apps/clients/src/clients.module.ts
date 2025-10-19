import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { PrismaModule } from '@app/prisma';
import * as redisStore from 'cache-manager-redis-store';
import { UsersModule } from './users/clients.module';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      ttl: 60, // tempo de vida do cache em segundos (1 minuto)
    }),
    PrismaModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class ClientsModule {}
