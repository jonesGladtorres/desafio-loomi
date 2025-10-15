import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/prisma';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) { }

  getHello(): string {
    return 'Hello World from Transactions!';
  }

  // Exemplo de método para buscar todas as transações
  async findAll() {
    return this.prisma.transaction.findMany({
      include: { user: true },
    });
  }

  // Exemplo de método para buscar transações de um usuário
  async findByUserId(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
