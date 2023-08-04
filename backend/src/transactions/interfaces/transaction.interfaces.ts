export interface TransactionCreateData {
  senderId: number;
  recipientId: number;
  amount: string;
}

export interface TransctionSearchParams {
  limit: number;
  offset: number;
}
