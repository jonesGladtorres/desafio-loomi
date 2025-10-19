import {
  Injectable,
  NotFoundException,
  Inject,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '@app/prisma';
import { UpdateProfilePictureDto } from './dto/update-profile-picture.dto';
import { CreateUserDto } from './dto/create-users.dto';
import { UpdateUserDto } from './dto/update-users.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy,
  ) { }

  async create(createUserDto: CreateUserDto) {
    try {
      this.logger.log('Tentando criar usuário com dados:', {
        name: createUserDto.name,
        email: createUserDto.email,
        cpf: createUserDto.cpf,
      });

      const user = await this.prisma.user.create({
        data: createUserDto,
      });

      this.logger.log(`Usuário criado com sucesso: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error('Erro ao criar usuário:', error);

      // Trata erros do Prisma
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Erro de campo único (email ou CPF duplicado)
        if (error.code === 'P2002') {
          const fields = (error.meta?.target as string[]) || [];
          const fieldName = fields[0] || 'campo';
          throw new ConflictException(
            `Já existe um usuário com este ${fieldName}`,
          );
        }

        // Erro de validação de dados
        if (error.code === 'P2000') {
          throw new BadRequestException(
            'Dados fornecidos são inválidos ou muito longos',
          );
        }

        // Erro de campo obrigatório faltando
        if (error.code === 'P2011') {
          throw new BadRequestException('Campo obrigatório não foi fornecido');
        }
      }

      // Se não for erro conhecido do Prisma, lança erro genérico
      throw new InternalServerErrorException(
        `Erro ao criar usuário: ${error.message}`,
      );
    }
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: {
        sentTransactions: true,
        receivedTransactions: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        sentTransactions: true,
        receivedTransactions: true,
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
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: {
        sentTransactions: true,
        receivedTransactions: true,
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

  async updateProfilePicture(
    id: string,
    updateProfilePictureDto: UpdateProfilePictureDto,
  ) {
    // Verifica se o usuário existe antes de atualizar
    await this.findOne(id);

    // Atualiza apenas a foto de perfil
    return this.prisma.user.update({
      where: { id },
      data: {
        profilePicture: updateProfilePictureDto.profilePicture,
      },
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
      'bankAgency',
      'bankAccount',
      'bankAccountDigit',
    ];
    return bankingFields.some((field) => updateUserDto[field] !== undefined);
  }
}
