import { Expose } from 'class-transformer';

export class GetUsersResponse{
  @Expose()
    id: number;

  @Expose()
    name: string;

  @Expose()
    email: string;
}
