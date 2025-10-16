/**
 * Interface abstrata para o Microsserviço de Notificações
 * 
 * Este é um contrato hipotético para simular a comunicação
 * com um microsserviço de notificações que poderia existir
 * em um ambiente distribuído real.
 */

export interface INotificationService {
  /**
   * Envia uma notificação de transação bem-sucedida
   * @param userId - ID do usuário que receberá a notificação
   * @param transactionId - ID da transação
   * @param amount - Valor da transação
   * @param type - Tipo da transação (credit, debit, transfer)
   */
  sendTransactionSuccessNotification(
    userId: string,
    transactionId: string,
    amount: number,
    type: string,
  ): Promise<void>;

  /**
   * Envia uma notificação de falha na transação
   * @param userId - ID do usuário que receberá a notificação
   * @param transactionId - ID da transação
   * @param reason - Motivo da falha
   */
  sendTransactionFailureNotification(
    userId: string,
    transactionId: string,
    reason: string,
  ): Promise<void>;

  /**
   * Envia uma notificação de transferência recebida
   * @param receiverId - ID do usuário que recebeu a transferência
   * @param senderName - Nome do remetente
   * @param amount - Valor recebido
   */
  sendTransferReceivedNotification(
    receiverId: string,
    senderName: string,
    amount: number,
  ): Promise<void>;

  /**
   * Envia um e-mail de confirmação de transação
   * @param email - Email do destinatário
   * @param transactionDetails - Detalhes da transação
   */
  sendTransactionEmail(
    email: string,
    transactionDetails: TransactionEmailDetails,
  ): Promise<void>;

  /**
   * Envia notificação push para o aplicativo móvel
   * @param deviceToken - Token do dispositivo móvel
   * @param title - Título da notificação
   * @param message - Mensagem da notificação
   */
  sendPushNotification(
    deviceToken: string,
    title: string,
    message: string,
  ): Promise<void>;

  /**
   * Envia SMS de confirmação
   * @param phoneNumber - Número de telefone
   * @param message - Mensagem SMS
   */
  sendSMSNotification(phoneNumber: string, message: string): Promise<void>;
}

export interface TransactionEmailDetails {
  transactionId: string;
  amount: number;
  type: string;
  status: string;
  date: Date;
  senderName?: string;
  receiverName?: string;
  description?: string;
}

/**
 * Enum para tipos de notificação
 */
export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
}

/**
 * Interface para resposta do serviço de notificações
 */
export interface NotificationResponse {
  success: boolean;
  notificationId: string;
  timestamp: Date;
  type: NotificationType;
  message?: string;
}
