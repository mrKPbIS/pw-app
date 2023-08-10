import { Column, Entity, Index, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user';

@Entity({ name: 'Transactions' })
export class Transaction {
  @PrimaryColumn({
    type: 'uuid',
    generated: 'uuid',
  })
    id: string;

  @Index()
  @Column({
    type: 'integer',
    name: 'owner_id',
  })
    ownerId: number;

  @Index()
  @Column({
    type: 'integer',
    name: 'recepient_id',
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
    name: 'amount_after',
  })
    amountAfter: string;

  @Column({
    type: 'timestamp',
    name: 'created_at',
  })
    createdAt: Date;

  @ManyToOne(() => User, (user) => user.id)
    owner: User;

  @ManyToOne(() => User, (user) => user.id)
    recipient: User;

}
