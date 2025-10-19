import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { PrismaService } from '@app/prisma';

describe('ClientsController', () => {
  let clientsController: ClientsController;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        ClientsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    clientsController = app.get<ClientsController>(ClientsController);
    prismaService = app.get<PrismaService>(PrismaService);
  });

  describe('root', () => {
    it('should return "Hello World from Clients!"', () => {
      expect(clientsController.getHello()).toBe('Hello World from Clients!');
    });
  });
});
