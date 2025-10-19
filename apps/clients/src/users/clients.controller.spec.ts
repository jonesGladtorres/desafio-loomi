import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { UsersService } from './clients.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreateUserDto } from './dto/create-users.dto';
import { UpdateUserDto } from './dto/update-users.dto';
import { UpdateProfilePictureDto } from './dto/update-profile-picture.dto';

describe('ClientsController (Users)', () => {
  let controller: ClientsController;
  let service: UsersService;
  let cacheManager: any;

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
  };

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateProfilePicture: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    controller = module.get<ClientsController>(ClientsController);
    service = module.get<UsersService>(UsersService);
    cacheManager = module.get(CACHE_MANAGER);

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um usuário com sucesso', async () => {
      const createUserDto: CreateUserDto = {
        name: 'João Silva',
        email: 'joao@example.com',
        cpf: '123.456.789-09',
      };

      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
      expect(mockCacheManager.del).toHaveBeenCalledWith('/api/users');
    });

    it('deve lançar BadRequestException quando corpo estiver vazio', async () => {
      await expect(controller.create({} as CreateUserDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.create({} as CreateUserDto)).rejects.toThrow(
        'Corpo da requisição não pode estar vazio',
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os usuários', async () => {
      const users = [mockUser];
      mockUsersService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(result).toEqual(users);
      expect(mockUsersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('deve retornar um usuário por ID válido', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(mockUser.id);
    });

    it('deve lançar NotFoundException quando usuário não existir', async () => {
      mockUsersService.findOne.mockRejectedValue(
        new NotFoundException('User with ID invalid-id not found'),
      );

      await expect(
        controller.findOne('123e4567-e89b-12d3-a456-426614174000'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar um usuário com sucesso', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'João Silva Atualizado',
      };

      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(mockUser.id, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(
        mockUser.id,
        updateUserDto,
      );
      expect(mockCacheManager.del).toHaveBeenCalledWith(
        `/api/users/${mockUser.id}`,
      );
      expect(mockCacheManager.del).toHaveBeenCalledWith('/api/users');
    });

    it('deve lançar BadRequestException quando corpo estiver vazio', async () => {
      await expect(
        controller.update(mockUser.id, {} as UpdateUserDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.update(mockUser.id, {} as UpdateUserDto),
      ).rejects.toThrow('Corpo da requisição não pode estar vazio');
    });

    it('deve lançar NotFoundException quando usuário não existir', async () => {
      mockUsersService.update.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(
        controller.update('123e4567-e89b-12d3-a456-426614174000', {
          name: 'Test',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve remover um usuário com sucesso', async () => {
      mockUsersService.remove.mockResolvedValue(mockUser);

      const result = await controller.remove(mockUser.id);

      expect(result).toEqual({
        message: 'Usuário deletado com sucesso',
        deletedUserId: mockUser.id,
      });
      expect(mockUsersService.remove).toHaveBeenCalledWith(mockUser.id);
      expect(mockCacheManager.del).toHaveBeenCalledWith(
        `/api/users/${mockUser.id}`,
      );
      expect(mockCacheManager.del).toHaveBeenCalledWith('/api/users');
    });

    it('deve lançar NotFoundException quando usuário não existir', async () => {
      mockUsersService.remove.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(
        controller.remove('123e4567-e89b-12d3-a456-426614174000'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfilePicture', () => {
    it('deve atualizar a foto de perfil com sucesso', async () => {
      const updateDto: UpdateProfilePictureDto = {
        profilePicture: 'https://example.com/photo.jpg',
      };

      const updatedUser = {
        ...mockUser,
        profilePicture: updateDto.profilePicture,
      };

      mockUsersService.updateProfilePicture.mockResolvedValue(updatedUser);

      const result = await controller.updateProfilePicture(
        mockUser.id,
        updateDto,
      );

      expect(result).toEqual({
        message: 'Foto de perfil atualizada com sucesso',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          profilePicture: updatedUser.profilePicture,
        },
      });
      expect(mockUsersService.updateProfilePicture).toHaveBeenCalledWith(
        mockUser.id,
        updateDto,
      );
      expect(mockCacheManager.del).toHaveBeenCalledWith(
        `/api/users/${mockUser.id}`,
      );
      expect(mockCacheManager.del).toHaveBeenCalledWith('/api/users');
    });

    it('deve lançar BadRequestException quando corpo estiver vazio', async () => {
      await expect(
        controller.updateProfilePicture(
          mockUser.id,
          {} as UpdateProfilePictureDto,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar NotFoundException quando usuário não existir', async () => {
      mockUsersService.updateProfilePicture.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(
        controller.updateProfilePicture(
          '123e4567-e89b-12d3-a456-426614174000',
          {
            profilePicture: 'https://example.com/photo.jpg',
          },
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
