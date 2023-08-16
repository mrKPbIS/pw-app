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
  })
    ownerId: number;

  @Index()
  @Column({
    type: 'integer',
  })
    recipientId: number;

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
    type: 'datetime',
    name: 'created_at',
    default: () => 'GETDATE()',
  })
    createdAt: Date;

  @ManyToOne(() => User, (user) => user.id)
    owner: User;

  @ManyToOne(() => User, (user) => user.id)
    recipient: User;

}
