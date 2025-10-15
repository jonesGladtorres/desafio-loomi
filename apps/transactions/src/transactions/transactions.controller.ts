import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { EventPattern, Payload } from '@nestjs/microservices';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

interface UserBankingUpdatedEvent {
  userId: string;
  name: string;
  email: string;
  cpf?: string;
  updatedFields: string[];
  timestamp: string;
}

@ApiTags('transactions')
@Controller('api/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) { }

  // ========================================
  // HTTP Endpoints
  // ========================================

  @Post()
  @ApiOperation({ summary: 'Criar nova transação' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Transação criada com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos ou usuário não encontrado',
  })
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as transações' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de transações retornada com sucesso',
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
  findByUserId(@Param('userId') userId: string) {
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
  findOne(@Param('id') id: string) {
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
    description: 'Dados inválidos',
  })
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar transação' })
  @ApiParam({
    name: 'id',
    description: 'UUID da transação',
    example: '987e6543-e21b-12d3-a456-426614174999',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transação deletada com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Transação não encontrada',
  })
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(id);
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
      console.error('❌ Erro ao processar evento:', error.message);
    }
  }
}
