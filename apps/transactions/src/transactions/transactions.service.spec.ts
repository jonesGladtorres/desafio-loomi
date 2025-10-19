import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '@app/prisma';
import { NotificationService } from '../services/notification.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prismaService: PrismaService;
  let notificationService: NotificationService;

  const mockSender = {
    id: 'sender-id',
    name: 'João Silva',
    email: 'joao@example.com',
    cpf: '123.456.789-09',
    phone: '(11) 98765-4321',
  };

  const mockReceiver = {
    id: 'receiver-id',
    name: 'Maria Santos',
    email: 'maria@example.com',
    cpf: '987.654.321-00',
    phone: '(21) 98765-4321',
  };

  const mockTransaction = {
    id: 'transaction-id',
    amount: 100.0,
    type: 'transfer',
    description: 'Pagamento teste',
    status: 'completed',
    senderUserId: 'sender-id',
    receiverUserId: 'receiver-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    sender: mockSender,
    receiver: mockReceiver,
  };

  const mockPrismaService = {
    transaction: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockNotificationService = {
    sendTransactionSuccessNotification: jest.fn(),
    sendTransferReceivedNotification: jest.fn(),
    sendTransactionFailureNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    prismaService = module.get<PrismaService>(PrismaService);
    notificationService = module.get<NotificationService>(NotificationService);

    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    describe('transferências', () => {
      it('deve criar uma transferência válida', async () => {
        const createDto: CreateTransactionDto = {
          amount: 100,
          type: 'transfer',
          description: 'Pagamento',
          status: 'completed',
          senderUserId: 'sender-id',
          receiverUserId: 'receiver-id',
        };

        mockPrismaService.user.findUnique
          .mockResolvedValueOnce(mockSender)
          .mockResolvedValueOnce(mockReceiver);
        mockPrismaService.transaction.create.mockResolvedValue(mockTransaction);

        const result = await service.create(createDto);

        expect(result).toEqual(mockTransaction);
        expect(mockPrismaService.user.findUnique).toHaveBeenCalledTimes(2);
        expect(
          mockNotificationService.sendTransactionSuccessNotification,
        ).toHaveBeenCalled();
        expect(
          mockNotificationService.sendTransferReceivedNotification,
        ).toHaveBeenCalled();
      });

      it('deve lançar erro quando falta senderUserId', async () => {
        const createDto: CreateTransactionDto = {
          amount: 100,
          type: 'transfer',
          description: 'Pagamento',
          status: 'completed',
          receiverUserId: 'receiver-id',
        };

        await expect(service.create(createDto)).rejects.toThrow(
          BadRequestException,
        );
        await expect(service.create(createDto)).rejects.toThrow(
          'Transfer transactions require both senderUserId and receiverUserId',
        );
      });

      it('deve lançar erro quando falta receiverUserId', async () => {
        const createDto: CreateTransactionDto = {
          amount: 100,
          type: 'transfer',
          description: 'Pagamento',
          status: 'completed',
          senderUserId: 'sender-id',
        };

        await expect(service.create(createDto)).rejects.toThrow(
          BadRequestException,
        );
      });

      it('deve lançar erro quando sender e receiver são o mesmo', async () => {
        const createDto: CreateTransactionDto = {
          amount: 100,
          type: 'transfer',
          description: 'Pagamento',
          status: 'completed',
          senderUserId: 'same-id',
          receiverUserId: 'same-id',
        };

        await expect(service.create(createDto)).rejects.toThrow(
          'Cannot transfer to the same user',
        );
      });

      it('deve lançar erro quando sender não existe', async () => {
        const createDto: CreateTransactionDto = {
          amount: 100,
          type: 'transfer',
          description: 'Pagamento',
          status: 'completed',
          senderUserId: 'sender-id',
          receiverUserId: 'receiver-id',
        };

        mockPrismaService.user.findUnique
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(mockReceiver);

        await expect(service.create(createDto)).rejects.toThrow(
          'Sender user with ID sender-id not found',
        );
      });

      it('deve lançar erro quando receiver não existe', async () => {
        const createDto: CreateTransactionDto = {
          amount: 100,
          type: 'transfer',
          description: 'Pagamento',
          status: 'completed',
          senderUserId: 'sender-id',
          receiverUserId: 'receiver-id',
        };

        mockPrismaService.user.findUnique
          .mockResolvedValueOnce(mockSender)
          .mockResolvedValueOnce(null);

        await expect(service.create(createDto)).rejects.toThrow(
          'Receiver user with ID receiver-id not found',
        );
      });
    });

    describe('débitos', () => {
      it('deve criar um débito válido', async () => {
        const createDto: CreateTransactionDto = {
          amount: 50,
          type: 'debit',
          description: 'Compra',
          status: 'completed',
          senderUserId: 'sender-id',
        };

        const debitTransaction = {
          ...mockTransaction,
          type: 'debit',
          amount: 50,
          receiverUserId: null,
        };

        mockPrismaService.user.findUnique.mockResolvedValue(mockSender);
        mockPrismaService.transaction.create.mockResolvedValue(
          debitTransaction,
        );

        const result = await service.create(createDto);

        expect(result).toEqual(debitTransaction);
        expect(mockPrismaService.user.findUnique).toHaveBeenCalledTimes(1);
        expect(
          mockNotificationService.sendTransactionSuccessNotification,
        ).toHaveBeenCalled();
      });

      it('deve lançar erro quando falta senderUserId no débito', async () => {
        const createDto: CreateTransactionDto = {
          amount: 50,
          type: 'debit',
          description: 'Compra',
          status: 'completed',
        };

        await expect(service.create(createDto)).rejects.toThrow(
          'Debit transactions require senderUserId',
        );
      });
    });

    describe('créditos', () => {
      it('deve criar um crédito válido', async () => {
        const createDto: CreateTransactionDto = {
          amount: 50,
          type: 'credit',
          description: 'Depósito',
          status: 'completed',
          receiverUserId: 'receiver-id',
        };

        const creditTransaction = {
          ...mockTransaction,
          type: 'credit',
          amount: 50,
          senderUserId: null,
        };

        mockPrismaService.user.findUnique.mockResolvedValue(mockReceiver);
        mockPrismaService.transaction.create.mockResolvedValue(
          creditTransaction,
        );

        const result = await service.create(createDto);

        expect(result).toEqual(creditTransaction);
        expect(
          mockNotificationService.sendTransactionSuccessNotification,
        ).toHaveBeenCalled();
      });

      it('deve lançar erro quando falta receiverUserId no crédito', async () => {
        const createDto: CreateTransactionDto = {
          amount: 50,
          type: 'credit',
          description: 'Depósito',
          status: 'completed',
        };

        await expect(service.create(createDto)).rejects.toThrow(
          'Credit transactions require receiverUserId',
        );
      });
    });

    describe('notificações de falha', () => {
      it('deve enviar notificação quando transação falhar', async () => {
        const createDto: CreateTransactionDto = {
          amount: 100,
          type: 'credit',
          description: 'Depósito',
          status: 'failed',
          receiverUserId: 'receiver-id',
        };

        const failedTransaction = {
          ...mockTransaction,
          status: 'failed',
        };

        mockPrismaService.user.findUnique.mockResolvedValue(mockReceiver);
        mockPrismaService.transaction.create.mockResolvedValue(
          failedTransaction,
        );

        await service.create(createDto);

        expect(
          mockNotificationService.sendTransactionFailureNotification,
        ).toHaveBeenCalled();
      });
    });
  });

  describe('findAll', () => {
    it('deve retornar todas as transações', async () => {
      const transactions = [mockTransaction];
      mockPrismaService.transaction.findMany.mockResolvedValue(transactions);

      const result = await service.findAll();

      expect(result).toEqual(transactions);
      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith({
        include: {
          sender: true,
          receiver: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });

  describe('findOne', () => {
    it('deve retornar uma transação por ID', async () => {
      mockPrismaService.transaction.findUnique.mockResolvedValue(
        mockTransaction,
      );

      const result = await service.findOne('transaction-id');

      expect(result).toEqual(mockTransaction);
    });

    it('deve lançar NotFoundException quando transação não existe', async () => {
      mockPrismaService.transaction.findUnique.mockResolvedValue(null);

      await expect(service.findOne('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('id-inexistente')).rejects.toThrow(
        'Transaction with ID id-inexistente not found',
      );
    });
  });

  describe('findByUserId', () => {
    it('deve retornar transações de um usuário', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockSender);
      mockPrismaService.transaction.findMany.mockResolvedValue([
        mockTransaction,
      ]);

      const result = await service.findByUserId('sender-id');

      expect(result).toEqual([mockTransaction]);
      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ senderUserId: 'sender-id' }, { receiverUserId: 'sender-id' }],
        },
        include: {
          sender: true,
          receiver: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('deve lançar NotFoundException quando usuário não existe', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findByUserId('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar uma transação', async () => {
      const updateDto: UpdateTransactionDto = {
        status: 'cancelled',
      };

      const updatedTransaction = {
        ...mockTransaction,
        status: 'cancelled',
      };

      mockPrismaService.transaction.findUnique.mockResolvedValue(
        mockTransaction,
      );
      mockPrismaService.transaction.update.mockResolvedValue(
        updatedTransaction,
      );

      const result = await service.update('transaction-id', updateDto);

      expect(result).toEqual(updatedTransaction);
    });

    it('deve lançar NotFoundException quando transação não existe', async () => {
      mockPrismaService.transaction.findUnique.mockResolvedValue(null);

      await expect(
        service.update('id-inexistente', { status: 'cancelled' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve remover uma transação', async () => {
      mockPrismaService.transaction.findUnique.mockResolvedValue(
        mockTransaction,
      );
      mockPrismaService.transaction.delete.mockResolvedValue(mockTransaction);

      const result = await service.remove('transaction-id');

      expect(result).toEqual(mockTransaction);
      expect(mockPrismaService.transaction.delete).toHaveBeenCalledWith({
        where: { id: 'transaction-id' },
      });
    });

    it('deve lançar NotFoundException quando transação não existe', async () => {
      mockPrismaService.transaction.findUnique.mockResolvedValue(null);

      await expect(service.remove('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
