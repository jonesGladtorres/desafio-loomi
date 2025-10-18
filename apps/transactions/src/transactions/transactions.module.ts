import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrismaModule } from '@app/prisma';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { NotificationService } from '../services/notification.service';

@Module({
  imports: [
    PrismaModule,
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL ||
              'amqp://loomi_user:loomi_password@localhost:5672',
          ],
          queue: 'notifications_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, NotificationService],
  exports: [TransactionsService, NotificationService],
})
export class TransactionsResourceModule {}
