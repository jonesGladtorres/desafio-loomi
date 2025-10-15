import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { PrismaModule } from '@app/prisma';
import { UsersModule } from './users/users.module';
import * as redisStore from 'cache-manager-redis-store';

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
  controllers: [ClientsController],
  providers: [ClientsService],
})
export class ClientsModule { }
