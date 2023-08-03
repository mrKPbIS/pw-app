import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user';

@Entity({ name: 'Transactions' })
export class Transaction {
  @PrimaryColumn({
    type: 'uuid',
    generated: 'uuid',
  })
    id: string;

  @Column({
    type: 'integer',
  })
    ownerId: number;

  @Column({
    type: 'integer',
  })
    recepientId: number;

  @Column({
    type: 'varchar',
    length: 15,
  })
    amount: string;

  @Column({
    type: 'varchar',
    length: 15,
  })
    amountAfter: string;

  @Column({
    type: 'timestamp',
  })
    createdAt: Date;

  @ManyToOne(() => User, (user) => user.id)
    owner: User;

  @ManyToOne(() => User, (user) => user.id)
    recipient: User;

}
