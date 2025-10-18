import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions/transactions.controller';
import { TransactionsService } from './transactions/transactions.service';

describe('TransactionsController', () => {
  let transactionsController: TransactionsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [TransactionsService],
    }).compile();

    transactionsController = app.get<TransactionsController>(
      TransactionsController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(
        transactionsController.create({
          amount: 100,
          type: 'credit',
          description: 'Test transaction',
          status: 'completed',
          senderUserId: '123',
          receiverUserId: '456',
        }),
      ).toBe('Hello World!');
    });
  });
});
