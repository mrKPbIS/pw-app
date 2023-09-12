import { Expose, Type } from 'class-transformer';
import { GetUsersResponse } from '../../users/dto/getUsersResponse.dto';

export class GetTransactionsResponse {
  @Expose()
    id: number;

  @Expose()
    ownerId: number;

  @Expose()
    recipientId: number;

  @Expose()
    amount: string;

  @Expose()
    ownerBalance: string;

  @Expose()
    recipientBalance: string;

  @Expose()
    createdAt: Date;

  @Expose()
  @Type(() => GetUsersResponse)
    owner: GetUsersResponse;

  @Expose()
  @Type(() => GetUsersResponse)
    recipient: GetUsersResponse;
}
