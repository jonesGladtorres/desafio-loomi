import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Inject,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UpdateProfilePictureDto } from './dto/update-profile-picture.dto';
import { UsersService } from './clients.service';
import { CreateUserDto } from './dto/create-users.dto';
import { UpdateUserDto } from './dto/update-users.dto';

@ApiTags('users')
@Controller('api/users')
export class ClientsController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Criar novo usuário' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuário criado com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    // Invalida o cache da lista de usuários
    await this.cacheManager.del('/api/users');
    return user;
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de usuários retornada com sucesso (com cache)',
  })
  @UseInterceptors(CacheInterceptor)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuário encontrado (com cache)',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado',
  })
  @UseInterceptors(CacheInterceptor)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar usuário',
    description:
      'Atualiza dados do usuário. Se dados bancários forem alterados, emite evento via RabbitMQ.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuário atualizado com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos',
  })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(id, updateUserDto);

    // Invalida o cache do cliente específico e da lista de clientes
    await this.cacheManager.del(`/api/users/${id}`);
    await this.cacheManager.del('/api/users');

    return user;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar usuário' })
  @ApiParam({
    name: 'id',
    description: 'UUID do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Usuário deletado com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Usuário deletado com sucesso',
        },
        deletedUserId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado',
  })
  async remove(@Param('id') id: string) {
    const user = await this.usersService.remove(id);

    // Invalida o cache do cliente específico e da lista de clientes
    await this.cacheManager.del(`/api/users/${id}`);
    await this.cacheManager.del('/api/users');

    return {
      message: 'Usuário deletado com sucesso',
      deletedUserId: user.id,
    };
  }

  @Patch(':id/profile-picture')
  @ApiOperation({
    summary: 'Atualizar foto de perfil do usuário',
    description:
      'Atualiza apenas a foto de perfil do usuário. Aceita uma URL válida para a imagem.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateProfilePictureDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Foto de perfil atualizada com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'URL inválida para foto de perfil',
  })
  async updateProfilePicture(
    @Param('id') id: string,
    @Body() updateProfilePictureDto: UpdateProfilePictureDto,
  ) {
    const user = await this.usersService.updateProfilePicture(
      id,
      updateProfilePictureDto,
    );

    // Invalida o cache do cliente específico
    await this.cacheManager.del(`/api/users/${id}`);
    await this.cacheManager.del('/api/users');

    return {
      message: 'Foto de perfil atualizada com sucesso',
      user: {
        id: user.id,
        name: user.name,
        profilePicture: user.profilePicture,
      },
    };
  }
}
