import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { PrismaModule } from '@app/prisma';
import { TransactionsResourceModule } from './transactions/transactions.module';

@Module({
  imports: [PrismaModule, TransactionsResourceModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule { }
