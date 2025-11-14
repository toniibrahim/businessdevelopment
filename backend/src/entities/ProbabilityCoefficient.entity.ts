import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum FactorType {
  PROJECT_TYPE = 'project_type',
  PROJECT_MATURITY = 'project_maturity',
  CLIENT_TYPE = 'client_type',
  CLIENT_RELATIONSHIP = 'client_relationship',
  CONSERVATIVE_APPROACH = 'conservative_approach',
}

@Entity('probability_coefficients')
export class ProbabilityCoefficient {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: FactorType,
  })
  factor_type!: FactorType;

  @Column()
  factor_value!: string;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  coefficient!: number;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
