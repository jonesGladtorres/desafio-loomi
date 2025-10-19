import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { EventPattern, Payload } from '@nestjs/microservices';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { ParseUUIDPipe } from '../../../../libs/common/pipes/uuid-validation.pipe';
import { Public } from '@app/security/decorators/public.decorator';

interface UserBankingUpdatedEvent {
  userId: string;
  name: string;
  email: string;
  cpf?: string;
  updatedFields: string[];
  timestamp: string;
}

@ApiTags('transactions')
@ApiSecurity('X-API-Key')
@ApiSecurity('Bearer')
@Controller('api/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  // ========================================
  // HTTP Endpoints
  // ========================================

  @Get('health')
  @Public()
  @ApiOperation({
    summary: 'Health Check',
    description:
      'Endpoint público para verificar se a API está funcionando. Não requer autenticação.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'API está funcionando corretamente',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2025-10-19T06:30:00.000Z' },
        service: { type: 'string', example: 'transactions-api' },
      },
    },
  })
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'transactions-api',
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar nova transação',
    description:
      'Cria uma nova transação financeira (CREDIT, DEBIT ou TRANSFER). Valida saldos e envia notificações via RabbitMQ. Requer autenticação via API Key.',
  })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Transação criada com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Dados inválidos, usuário não encontrado ou saldo insuficiente',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'API Key não fornecida ou inválida',
  })
  @ApiResponse({
    status: 429,
    description: 'Muitas requisições - Rate limit excedido',
  })
  create(@Body() createTransactionDto: CreateTransactionDto) {
    if (
      !createTransactionDto ||
      Object.keys(createTransactionDto).length === 0
    ) {
      throw new BadRequestException('Corpo da requisição não pode estar vazio');
    }
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas as transações',
    description:
      'Retorna todas as transações do sistema incluindo informações dos usuários envolvidos. Requer autenticação via API Key.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de transações retornada com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'API Key não fornecida ou inválida',
  })
  @ApiResponse({
    status: 429,
    description: 'Muitas requisições - Rate limit excedido',
  })
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Listar transações de um usuário específico' })
  @ApiParam({
    name: 'userId',
    description: 'UUID do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de transações do usuário (ordenadas por data)',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'ID de usuário inválido',
  })
  findByUserId(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.transactionsService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar transação por ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID da transação',
    example: '987e6543-e21b-12d3-a456-426614174999',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transação encontrada',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Transação não encontrada',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'ID inválido',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.transactionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar transação' })
  @ApiParam({
    name: 'id',
    description: 'UUID da transação',
    example: '987e6543-e21b-12d3-a456-426614174999',
  })
  @ApiBody({ type: UpdateTransactionDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transação atualizada com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Transação não encontrada',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos ou ID inválido',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    if (
      !updateTransactionDto ||
      Object.keys(updateTransactionDto).length === 0
    ) {
      throw new BadRequestException('Corpo da requisição não pode estar vazio');
    }
    return this.transactionsService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deletar transação' })
  @ApiParam({
    name: 'id',
    description: 'UUID da transação',
    example: '987e6543-e21b-12d3-a456-426614174999',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transação deletada com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Transação deletada com sucesso',
        },
        deletedTransactionId: {
          type: 'string',
          example: '987e6543-e21b-12d3-a456-426614174999',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Transação não encontrada',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'ID inválido',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const transaction = await this.transactionsService.remove(id);

    return {
      message: 'Transação deletada com sucesso',
      deletedTransactionId: transaction.id,
    };
  }

  // ========================================
  // RabbitMQ Event Handlers
  // ========================================

  @EventPattern('user_banking_updated')
  async handleUserBankingUpdated(@Payload() data: UserBankingUpdatedEvent) {
    console.log('📥 Evento recebido: user_banking_updated');
    console.log('📋 Dados do evento:', {
      userId: data.userId,
      name: data.name,
      email: data.email,
      cpf: data.cpf,
      updatedFields: data.updatedFields,
      timestamp: data.timestamp,
    });

    // Aqui você pode implementar lógica de negócio
    // Por exemplo: registrar auditoria, enviar notificação, etc.

    // Exemplo: Buscar transações do usuário para auditoria
    try {
      const userTransactions = await this.transactionsService.findByUserId(
        data.userId,
      );
      console.log(
        `✅ Usuário ${data.name} possui ${userTransactions.length} transação(ões)`,
      );

      // Você pode adicionar mais lógica aqui, como:
      // - Criar log de auditoria
      // - Enviar notificação
      // - Atualizar cache
      // - Disparar outros eventos
    } catch (error) {
      console.error(
        '❌ Erro ao processar evento:',
        (error as Error & { message: string }).message,
      );
    }
  }
}
