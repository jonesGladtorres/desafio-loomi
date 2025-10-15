import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '@app/prisma';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy,
  ) { }

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
    const existingUser = await this.findOne(id);

    // Atualiza o usuário
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: {
        transactions: true,
      },
    });

    // Verifica se os dados bancários foram atualizados
    const bankingFieldsUpdated = this.checkBankingFieldsUpdated(updateUserDto);

    if (bankingFieldsUpdated) {
      // Emite evento para o RabbitMQ
      this.rabbitClient.emit('user_banking_updated', {
        userId: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        cpf: updatedUser.cpf,
        updatedFields: Object.keys(updateUserDto),
        timestamp: new Date().toISOString(),
      });

      console.log(
        `📤 Evento 'user_banking_updated' emitido para o usuário ${updatedUser.id}`,
      );
    }

    return updatedUser;
  }

  async remove(id: string) {
    // Verifica se o usuário existe antes de deletar
    await this.findOne(id);

    // Deleta o usuário (CASCADE irá deletar as transações relacionadas)
    return this.prisma.user.delete({
      where: { id },
    });
  }

  private checkBankingFieldsUpdated(updateUserDto: UpdateUserDto): boolean {
    const bankingFields = [
      'name',
      'email',
      'cpf',
      'phone',
      'address',
      'city',
      'state',
      'zipCode',
    ];
    return bankingFields.some((field) => updateUserDto[field] !== undefined);
  }
}
