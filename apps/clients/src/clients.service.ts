import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/prisma';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) { }

  getHello(): string {
    return 'Hello World from Clients!';
  }

  // Exemplo de método para buscar todos os usuários
  async findAll() {
    return this.prisma.user.findMany();
  }

  // Exemplo de método para buscar um usuário por ID
  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { transactions: true },
    });
  }
}
