import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/prisma';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: {
        transactions: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        transactions: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Verifica se o usuário existe antes de atualizar
    await this.findOne(id);

    // Atualiza o usuário
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: {
        transactions: true,
      },
    });
  }

  async remove(id: string) {
    // Verifica se o usuário existe antes de deletar
    await this.findOne(id);

    // Deleta o usuário (CASCADE irá deletar as transações relacionadas)
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
