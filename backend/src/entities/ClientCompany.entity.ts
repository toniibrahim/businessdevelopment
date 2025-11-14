import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum RelationshipTier {
  LOW = '1 - Low',
  MEDIUM = '2 - Medium',
  GOOD = '3 - Good',
  HIGH = '4 - High',
  EXCELLENT = '5 - Excellent',
}

@Entity('client_companies')
export class ClientCompany {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @Index()
  name!: string;

  @Column({ nullable: true })
  industry!: string;

  @Column({
    type: 'enum',
    enum: RelationshipTier,
  })
  relationship_tier!: RelationshipTier;

  @Column({ nullable: true })
  contact_person!: string;

  @Column({ nullable: true })
  email!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ type: 'text', nullable: true })
  address!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
