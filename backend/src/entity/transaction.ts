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
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      from: (value) => {
        return Number(value).toFixed(2);
      },
      to: (value) => value,
    }
  })
    amount: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'amount_after',
    transformer: {
      from: (value) => {
        return Number(value).toFixed(2);
      },
      to: (value) => value,
    }
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
