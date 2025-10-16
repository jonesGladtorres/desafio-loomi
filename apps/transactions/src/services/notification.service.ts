import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  INotificationService,
  TransactionEmailDetails,
  NotificationType,
  NotificationResponse,
} from '../interfaces/notification-service.interface';

/**
 * Implementação Mock do Serviço de Notificações
 * 
 * Esta é uma implementação simulada do serviço de notificações
 * que seria um microsserviço separado em produção.
 * 
 * Em um ambiente real, este serviço comunicaria via RabbitMQ/Kafka
 * com o microsserviço de notificações real.
 */
@Injectable()
export class NotificationService implements INotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy,
  ) {}

  async sendTransactionSuccessNotification(
    userId: string,
    transactionId: string,
    amount: number,
    type: string,
  ): Promise<void> {
    this.logger.log(
      `📧 [MOCK] Enviando notificação de sucesso para usuário ${userId}`,
    );
    this.logger.log(
      `   Transação: ${transactionId} | Tipo: ${type} | Valor: R$ ${amount}`,
    );

    // Em produção, isso enviaria uma mensagem para o microsserviço de notificações
    this.rabbitClient.emit('notification.transaction.success', {
      userId,
      transactionId,
      amount,
      type,
      timestamp: new Date().toISOString(),
    });
  }

  async sendTransactionFailureNotification(
    userId: string,
    transactionId: string,
    reason: string,
  ): Promise<void> {
    this.logger.warn(
      `📧 [MOCK] Enviando notificação de falha para usuário ${userId}`,
    );
    this.logger.warn(
      `   Transação: ${transactionId} | Motivo: ${reason}`,
    );

    // Em produção, isso enviaria uma mensagem para o microsserviço de notificações
    this.rabbitClient.emit('notification.transaction.failure', {
      userId,
      transactionId,
      reason,
      timestamp: new Date().toISOString(),
    });
  }

  async sendTransferReceivedNotification(
    receiverId: string,
    senderName: string,
    amount: number,
  ): Promise<void> {
    this.logger.log(
      `📧 [MOCK] Notificação de transferência recebida para usuário ${receiverId}`,
    );
    this.logger.log(
      `   De: ${senderName} | Valor: R$ ${amount}`,
    );

    // Em produção, isso enviaria uma mensagem para o microsserviço de notificações
    this.rabbitClient.emit('notification.transfer.received', {
      receiverId,
      senderName,
      amount,
      timestamp: new Date().toISOString(),
    });
  }

  async sendTransactionEmail(
    email: string,
    transactionDetails: TransactionEmailDetails,
  ): Promise<void> {
    this.logger.log(
      `📧 [MOCK] Enviando e-mail de transação para: ${email}`,
    );
    this.logger.log(
      `   Detalhes: ${JSON.stringify(transactionDetails)}`,
    );

    // Em produção, isso enviaria uma mensagem para o microsserviço de notificações
    this.rabbitClient.emit('notification.email.transaction', {
      email,
      transactionDetails,
      timestamp: new Date().toISOString(),
    });
  }

  async sendPushNotification(
    deviceToken: string,
    title: string,
    message: string,
  ): Promise<void> {
    this.logger.log(
      `📱 [MOCK] Enviando notificação push para dispositivo: ${deviceToken}`,
    );
    this.logger.log(
      `   Título: ${title} | Mensagem: ${message}`,
    );

    // Em produção, isso enviaria uma mensagem para o microsserviço de notificações
    this.rabbitClient.emit('notification.push.send', {
      deviceToken,
      title,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  async sendSMSNotification(
    phoneNumber: string,
    message: string,
  ): Promise<void> {
    this.logger.log(
      `📱 [MOCK] Enviando SMS para: ${phoneNumber}`,
    );
    this.logger.log(
      `   Mensagem: ${message}`,
    );

    // Em produção, isso enviaria uma mensagem para o microsserviço de notificações
    this.rabbitClient.emit('notification.sms.send', {
      phoneNumber,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Método auxiliar para criar uma resposta de notificação
   */
  private createNotificationResponse(
    type: NotificationType,
    success: boolean = true,
    message?: string,
  ): NotificationResponse {
    return {
      success,
      notificationId: this.generateNotificationId(),
      timestamp: new Date(),
      type,
      message,
    };
  }

  /**
   * Gera um ID único para a notificação
   */
  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
