import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@app/prisma';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createTransactionDto: CreateTransactionDto) {
    // Verifica se o usuário existe
    const userExists = await this.prisma.user.findUnique({
      where: { id: createTransactionDto.userId },
    });

    if (!userExists) {
      throw new BadRequestException(
        `User with ID ${createTransactionDto.userId} not found`,
      );
    }

    // Cria a transação
    return this.prisma.transaction.create({
      data: createTransactionDto,
      include: {
        user: true,
      },
    });
  }

  async findAll() {
    return this.prisma.transaction.findMany({
      include: {
        user: true,
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
        user: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async findByUserId(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      include: {
        user: true,
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
        user: true,
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
