import { Expose } from 'class-transformer';

export class GetUsersProfileResponse{
  @Expose()
    id: number;

  @Expose()
    name: string;

  @Expose()
    email: string;

  @Expose()
    balance: string;
}
