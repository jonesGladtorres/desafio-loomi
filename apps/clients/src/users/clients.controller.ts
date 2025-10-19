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
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiSecurity,
} from '@nestjs/swagger';
import { CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UpdateProfilePictureDto } from './dto/update-profile-picture.dto';
import { UsersService } from './clients.service';
import { CreateUserDto } from './dto/create-users.dto';
import { UpdateUserDto } from './dto/update-users.dto';
import { ParseUUIDPipe } from '../../../../libs/common/pipes/uuid-validation.pipe';
import { Public } from '@app/security/decorators/public.decorator';

@ApiTags('users')
@ApiSecurity('X-API-Key')
@ApiSecurity('Bearer')
@Controller('api/users')
export class ClientsController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  @Get('health')
  @Public()
  @ApiOperation({
    summary: 'Health Check',
    description: 'Endpoint público para verificar se a API está funcionando. Não requer autenticação.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'API está funcionando corretamente',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2025-10-19T06:30:00.000Z' },
        service: { type: 'string', example: 'clients-api' },
      },
    },
  })
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'clients-api',
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar novo usuário',
    description:
      'Cria um novo usuário no sistema com validação de CPF e dados bancários. Requer autenticação via API Key.',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuário criado com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos ou CPF duplicado',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'API Key não fornecida ou inválida',
  })
  @ApiResponse({
    status: 429,
    description: 'Muitas requisições - Rate limit excedido',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    if (!createUserDto || Object.keys(createUserDto).length === 0) {
      throw new BadRequestException('Corpo da requisição não pode estar vazio');
    }

    const user = await this.usersService.create(createUserDto);
    // Invalida o cache da lista de usuários
    await this.cacheManager.del('/api/users');
    return user;
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos os usuários',
    description:
      'Retorna todos os usuários cadastrados no sistema com suas transações. Utiliza cache Redis para performance.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de usuários retornada com sucesso (com cache)',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'API Key não fornecida ou inválida',
  })
  @ApiResponse({
    status: 429,
    description: 'Muitas requisições - Rate limit excedido',
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
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'ID inválido',
  })
  @UseInterceptors(CacheInterceptor)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
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
    description: 'Dados inválidos ou ID inválido',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (!updateUserDto || Object.keys(updateUserDto).length === 0) {
      throw new BadRequestException('Corpo da requisição não pode estar vazio');
    }

    const user = await this.usersService.update(id, updateUserDto);

    // Invalida o cache do cliente específico e da lista de clientes
    await this.cacheManager.del(`/api/users/${id}`);
    await this.cacheManager.del('/api/users');

    return user;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deletar usuário' })
  @ApiParam({
    name: 'id',
    description: 'UUID do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
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
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'ID inválido',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
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
    description: 'URL inválida para foto de perfil ou ID inválido',
  })
  async updateProfilePicture(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProfilePictureDto: UpdateProfilePictureDto,
  ) {
    if (
      !updateProfilePictureDto ||
      Object.keys(updateProfilePictureDto).length === 0
    ) {
      throw new BadRequestException('Corpo da requisição não pode estar vazio');
    }

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
