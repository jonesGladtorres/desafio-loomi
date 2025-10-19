import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let service: TransactionsService;

  const mockTransaction = {
    id: '987e6543-e21b-12d3-a456-426614174999',
    amount: 100.0,
    type: 'transfer',
    description: 'Pagamento teste',
    status: 'completed',
    senderUserId: 'sender-id',
    receiverUserId: 'receiver-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    sender: {
      id: 'sender-id',
      name: 'João Silva',
      email: 'joao@example.com',
    },
    receiver: {
      id: 'receiver-id',
      name: 'Maria Santos',
      email: 'maria@example.com',
    },
  };

  const mockTransactionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByUserId: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    service = module.get<TransactionsService>(TransactionsService);

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve criar uma transação com sucesso', async () => {
      const createDto: CreateTransactionDto = {
        amount: 100,
        type: 'transfer',
        description: 'Pagamento',
        status: 'completed',
        senderUserId: 'sender-id',
        receiverUserId: 'receiver-id',
      };

      mockTransactionsService.create.mockResolvedValue(mockTransaction);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockTransaction);
      expect(mockTransactionsService.create).toHaveBeenCalledWith(createDto);
    });

    it('deve lançar BadRequestException quando corpo estiver vazio', () => {
      expect(() => controller.create({} as CreateTransactionDto)).toThrow(
        BadRequestException,
      );
      expect(() => controller.create({} as CreateTransactionDto)).toThrow(
        'Corpo da requisição não pode estar vazio',
      );
    });

    it('deve propagar erro de validação do service', async () => {
      const createDto: CreateTransactionDto = {
        amount: 100,
        type: 'transfer',
        description: 'Pagamento',
        status: 'completed',
        senderUserId: 'sender-id',
      };

      mockTransactionsService.create.mockRejectedValue(
        new BadRequestException(
          'Transfer transactions require both senderUserId and receiverUserId',
        ),
      );

      await expect(controller.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar todas as transações', async () => {
      const transactions = [mockTransaction];
      mockTransactionsService.findAll.mockResolvedValue(transactions);

      const result = await controller.findAll();

      expect(result).toEqual(transactions);
      expect(mockTransactionsService.findAll).toHaveBeenCalled();
    });

    it('deve retornar array vazio quando não há transações', async () => {
      mockTransactionsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('deve retornar uma transação por ID válido', async () => {
      mockTransactionsService.findOne.mockResolvedValue(mockTransaction);

      const result = await controller.findOne(mockTransaction.id);

      expect(result).toEqual(mockTransaction);
      expect(mockTransactionsService.findOne).toHaveBeenCalledWith(
        mockTransaction.id,
      );
    });

    it('deve lançar NotFoundException quando transação não existir', async () => {
      mockTransactionsService.findOne.mockRejectedValue(
        new NotFoundException('Transaction not found'),
      );

      await expect(
        controller.findOne('987e6543-e21b-12d3-a456-426614174999'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUserId', () => {
    it('deve retornar transações de um usuário', async () => {
      const transactions = [mockTransaction];
      mockTransactionsService.findByUserId.mockResolvedValue(transactions);

      const result = await controller.findByUserId('sender-id');

      expect(result).toEqual(transactions);
      expect(mockTransactionsService.findByUserId).toHaveBeenCalledWith(
        'sender-id',
      );
    });

    it('deve lançar NotFoundException quando usuário não existir', async () => {
      mockTransactionsService.findByUserId.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(
        controller.findByUserId('123e4567-e89b-12d3-a456-426614174000'),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve retornar array vazio quando usuário não tem transações', async () => {
      mockTransactionsService.findByUserId.mockResolvedValue([]);

      const result = await controller.findByUserId('sender-id');

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('deve atualizar uma transação com sucesso', async () => {
      const updateDto: UpdateTransactionDto = {
        status: 'cancelled',
      };

      const updatedTransaction = {
        ...mockTransaction,
        status: 'cancelled',
      };

      mockTransactionsService.update.mockResolvedValue(updatedTransaction);

      const result = await controller.update(mockTransaction.id, updateDto);

      expect(result).toEqual(updatedTransaction);
      expect(mockTransactionsService.update).toHaveBeenCalledWith(
        mockTransaction.id,
        updateDto,
      );
    });

    it('deve lançar BadRequestException quando corpo estiver vazio', () => {
      expect(() =>
        controller.update(mockTransaction.id, {} as UpdateTransactionDto),
      ).toThrow(BadRequestException);
      expect(() =>
        controller.update(mockTransaction.id, {} as UpdateTransactionDto),
      ).toThrow('Corpo da requisição não pode estar vazio');
    });

    it('deve lançar NotFoundException quando transação não existir', async () => {
      mockTransactionsService.update.mockRejectedValue(
        new NotFoundException('Transaction not found'),
      );

      await expect(
        controller.update('987e6543-e21b-12d3-a456-426614174999', {
          status: 'cancelled',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve remover uma transação com sucesso', async () => {
      mockTransactionsService.remove.mockResolvedValue(mockTransaction);

      const result = await controller.remove(mockTransaction.id);

      expect(result).toEqual({
        message: 'Transação deletada com sucesso',
        deletedTransactionId: mockTransaction.id,
      });
      expect(mockTransactionsService.remove).toHaveBeenCalledWith(
        mockTransaction.id,
      );
    });

    it('deve lançar NotFoundException quando transação não existir', async () => {
      mockTransactionsService.remove.mockRejectedValue(
        new NotFoundException('Transaction not found'),
      );

      await expect(
        controller.remove('987e6543-e21b-12d3-a456-426614174999'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('handleUserBankingUpdated', () => {
    it('deve processar evento de atualização bancária com sucesso', async () => {
      const eventData = {
        userId: 'user-id',
        name: 'João Silva',
        email: 'joao@example.com',
        cpf: '123.456.789-09',
        updatedFields: ['bankAgency', 'bankAccount'],
        timestamp: new Date().toISOString(),
      };

      mockTransactionsService.findByUserId.mockResolvedValue([mockTransaction]);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await controller.handleUserBankingUpdated(eventData);

      expect(mockTransactionsService.findByUserId).toHaveBeenCalledWith(
        eventData.userId,
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        '📥 Evento recebido: user_banking_updated',
      );

      consoleSpy.mockRestore();
    });

    it('deve lidar com erro ao processar evento', async () => {
      const eventData = {
        userId: 'user-id',
        name: 'João Silva',
        email: 'joao@example.com',
        updatedFields: ['bankAgency'],
        timestamp: new Date().toISOString(),
      };

      mockTransactionsService.findByUserId.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await controller.handleUserBankingUpdated(eventData);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ Erro ao processar evento:',
        'User not found',
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
