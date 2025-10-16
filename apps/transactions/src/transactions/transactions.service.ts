import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@app/prisma';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    const { type, senderUserId, receiverUserId } = createTransactionDto;

    // Validações baseadas no tipo de transação
    if (type === 'transfer') {
      // Para transferências, ambos os usuários devem existir
      if (!senderUserId || !receiverUserId) {
        throw new BadRequestException(
          'Transfer transactions require both senderUserId and receiverUserId',
        );
      }

      if (senderUserId === receiverUserId) {
        throw new BadRequestException('Cannot transfer to the same user');
      }

      // Verifica se ambos os usuários existem
      const [sender, receiver] = await Promise.all([
        this.prisma.user.findUnique({ where: { id: senderUserId } }),
        this.prisma.user.findUnique({ where: { id: receiverUserId } }),
      ]);

      if (!sender) {
        throw new BadRequestException(
          `Sender user with ID ${senderUserId} not found`,
        );
      }

      if (!receiver) {
        throw new BadRequestException(
          `Receiver user with ID ${receiverUserId} not found`,
        );
      }
    } else if (type === 'debit') {
      // Para débito, apenas o remetente deve existir
      if (!senderUserId) {
        throw new BadRequestException(
          'Debit transactions require senderUserId',
        );
      }

      const sender = await this.prisma.user.findUnique({
        where: { id: senderUserId },
      });

      if (!sender) {
        throw new BadRequestException(
          `Sender user with ID ${senderUserId} not found`,
        );
      }
    } else if (type === 'credit') {
      // Para crédito, apenas o destinatário deve existir
      if (!receiverUserId) {
        throw new BadRequestException(
          'Credit transactions require receiverUserId',
        );
      }

      const receiver = await this.prisma.user.findUnique({
        where: { id: receiverUserId },
      });

      if (!receiver) {
        throw new BadRequestException(
          `Receiver user with ID ${receiverUserId} not found`,
        );
      }
    }

    // Cria a transação
    const transaction = await this.prisma.transaction.create({
      data: {
        amount: createTransactionDto.amount,
        type: createTransactionDto.type,
        description: createTransactionDto.description,
        status: createTransactionDto.status,
        senderUserId: createTransactionDto.senderUserId,
        receiverUserId: createTransactionDto.receiverUserId,
      },
      include: {
        sender: true,
        receiver: true,
      },
    });

    // Envia notificações baseadas no status e tipo da transação
    if (transaction.status === 'completed') {
      try {
        // Notifica sucesso da transação
        if (transaction.type === 'transfer') {
          // Notifica o remetente
          if (transaction.sender) {
            await this.notificationService.sendTransactionSuccessNotification(
              transaction.sender.id,
              transaction.id,
              Number(transaction.amount),
              'transfer_sent',
            );
          }

          // Notifica o destinatário sobre a transferência recebida
          if (transaction.receiver && transaction.sender) {
            await this.notificationService.sendTransferReceivedNotification(
              transaction.receiver.id,
              transaction.sender.name,
              Number(transaction.amount),
            );
          }
        } else if (transaction.type === 'debit' && transaction.sender) {
          await this.notificationService.sendTransactionSuccessNotification(
            transaction.sender.id,
            transaction.id,
            Number(transaction.amount),
            'debit',
          );
        } else if (transaction.type === 'credit' && transaction.receiver) {
          await this.notificationService.sendTransactionSuccessNotification(
            transaction.receiver.id,
            transaction.id,
            Number(transaction.amount),
            'credit',
          );
        }

        this.logger.log(
          `✅ Notificações enviadas para transação ${transaction.id}`,
        );
      } catch (error) {
        // Log do erro mas não falha a transação
        this.logger.error(
          `❌ Erro ao enviar notificações para transação ${transaction.id}:`,
          error,
        );
      }
    } else if (transaction.status === 'failed') {
      // Notifica falha da transação
      try {
        const userId = transaction.senderUserId || transaction.receiverUserId;
        if (userId) {
          await this.notificationService.sendTransactionFailureNotification(
            userId,
            transaction.id,
            'Transaction failed',
          );
        }
      } catch (error) {
        this.logger.error('Erro ao enviar notificação de falha:', error);
      }
    }

    return transaction;
  }

  async findAll() {
    return this.prisma.transaction.findMany({
      include: {
        sender: true,
        receiver: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        sender: true,
        receiver: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async findByUserId(userId: string) {
    // Verifica se o usuário existe
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Busca as transações do usuário (como remetente ou destinatário)
    return this.prisma.transaction.findMany({
      where: {
        OR: [{ senderUserId: userId }, { receiverUserId: userId }],
      },
      include: {
        sender: true,
        receiver: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto) {
    // Verifica se a transação existe antes de atualizar
    await this.findOne(id);

    // Atualiza a transação
    return this.prisma.transaction.update({
      where: { id },
      data: updateTransactionDto,
      include: {
        sender: true,
        receiver: true,
      },
    });
  }

  async remove(id: string) {
    // Verifica se a transação existe antes de deletar
    await this.findOne(id);

    // Deleta a transação
    return this.prisma.transaction.delete({
      where: { id },
    });
  }
}
