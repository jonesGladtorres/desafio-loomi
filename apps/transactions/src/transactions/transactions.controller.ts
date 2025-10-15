import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
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

@Controller('api/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) { }

  // ========================================
  // HTTP Endpoints
  // ========================================

  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.transactionsService.findByUserId(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(id, updateTransactionDto);
  }

  @Delete(':id')
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
