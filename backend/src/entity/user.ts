import { Column, Entity, Index, OneToMany, PrimaryColumn } from 'typeorm';
import { Transaction } from './transaction';

@Entity({ name: 'Users' })
export class User {
  @PrimaryColumn({
    type: 'integer',
    generated: 'increment',
  })
    id: number;

  @Index()
  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
    name: string;

  @Index({ unique: true })
  @Column({
    type: 'varchar',
    length: 500,
    nullable: false,
  })
    email: string;

  @Column({
    type: 'varchar',
    length: 64,
    nullable: false,
  })
    password: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    transformer: {
      from: (value) => {
        return Number(value).toFixed(2);
      },
      to: (value) => value,
    }
  })
    balance: string;

  @Column({
    type: 'datetime',
    name: 'created_at',
    default: () => 'GETDATE()',
  })
    createdAt: Date;

  @OneToMany(() => Transaction, (transaction) => transaction.ownerId)
    ownTransactions: Transaction[];

  @OneToMany(() => Transaction, (transaction) => transaction.recipientId)
    recievedTransactions: Transaction[];
}
