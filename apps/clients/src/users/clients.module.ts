import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ClientsController } from './clients.controller';
import { UsersService } from './clients.service';
import { IsCPFConstraint } from './validators/cpf.validator';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL ||
            'amqp://loomi_user:loomi_password@localhost:5672',
          ],
          queue: 'user_events_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [ClientsController],
  providers: [UsersService, IsCPFConstraint],
})
export class UsersModule { }
