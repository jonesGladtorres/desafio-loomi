import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './clients.service';
import { PrismaService } from '@app/prisma';
import { CreateUserDto } from './dto/create-users.dto';
import { UpdateUserDto } from './dto/update-users.dto';
import { UpdateProfilePictureDto } from './dto/update-profile-picture.dto';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;
  let rabbitClient: any;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'João Silva',
    email: 'joao@example.com',
    cpf: '123.456.789-09',
    phone: '(11) 98765-4321',
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
    bankAgency: '0001',
    bankAccount: '12345',
    bankAccountDigit: '6',
    profilePicture: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    sentTransactions: [],
    receivedTransactions: [],
  };

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockRabbitClient = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: 'RABBITMQ_SERVICE',
          useValue: mockRabbitClient,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    rabbitClient = module.get('RABBITMQ_SERVICE');

    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um novo usuário', async () => {
      const createUserDto: CreateUserDto = {
        name: 'João Silva',
        email: 'joao@example.com',
        cpf: '123.456.789-09',
        phone: '(11) 98765-4321',
      };

      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: createUserDto,
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os usuários', async () => {
      const users = [mockUser];
      mockPrismaService.user.findMany.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        include: {
          sentTransactions: true,
          receivedTransactions: true,
        },
      });
      expect(mockPrismaService.user.findMany).toHaveBeenCalledTimes(1);
    });

    it('deve retornar array vazio quando não há usuários', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('deve retornar um usuário por ID', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        include: {
          sentTransactions: true,
          receivedTransactions: true,
        },
      });
    });

    it('deve lançar NotFoundException quando o usuário não existir', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('id-inexistente')).rejects.toThrow(
        'User with ID id-inexistente not found',
      );
    });
  });

  describe('update', () => {
    it('deve atualizar um usuário', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'João Silva Atualizado',
        phone: '(11) 91234-5678',
      };

      const updatedUser = {
        ...mockUser,
        ...updateUserDto,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(mockUser.id, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: updateUserDto,
        include: {
          sentTransactions: true,
          receivedTransactions: true,
        },
      });
    });

    it('deve emitir evento RabbitMQ quando dados bancários forem atualizados', async () => {
      const updateUserDto: UpdateUserDto = {
        bankAgency: '0002',
        bankAccount: '54321',
        bankAccountDigit: '9',
      };

      const updatedUser = {
        ...mockUser,
        ...updateUserDto,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      await service.update(mockUser.id, updateUserDto);

      expect(mockRabbitClient.emit).toHaveBeenCalledWith(
        'user_banking_updated',
        expect.objectContaining({
          userId: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          cpf: updatedUser.cpf,
          updatedFields: Object.keys(updateUserDto),
        }),
      );
    });

    it('deve lançar NotFoundException quando tentar atualizar usuário inexistente', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.update('id-inexistente', { name: 'Teste' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve remover um usuário', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.remove(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('deve lançar NotFoundException quando tentar remover usuário inexistente', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.remove('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfilePicture', () => {
    it('deve atualizar a foto de perfil do usuário', async () => {
      const updateProfilePictureDto: UpdateProfilePictureDto = {
        profilePicture: 'https://example.com/photo.jpg',
      };

      const updatedUser = {
        ...mockUser,
        profilePicture: updateProfilePictureDto.profilePicture,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateProfilePicture(
        mockUser.id,
        updateProfilePictureDto,
      );

      expect(result).toEqual(updatedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          profilePicture: updateProfilePictureDto.profilePicture,
        },
      });
    });

    it('deve lançar NotFoundException quando tentar atualizar foto de usuário inexistente', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProfilePicture('id-inexistente', {
          profilePicture: 'https://example.com/photo.jpg',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
