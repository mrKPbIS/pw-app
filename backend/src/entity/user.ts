import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Transaction } from './transaction';

@Entity({ name: 'Users' })
export class User {
  @PrimaryColumn({
    type: 'integer',
    generated: 'increment',
  })
    id: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
    name: string;

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
    type: 'varchar',
    length: 15,
    nullable: false,
  })
    balance: string;

  @Column({
    type: 'timestamp',
  })
    createdAt: Date;

  @OneToMany(() => Transaction, (transaction) => transaction.ownerId)
    ownTransactions: Transaction[];

  @OneToMany(() => Transaction, (transaction) => transaction.recepientId)
    recievedTransactions: Transaction[];
}