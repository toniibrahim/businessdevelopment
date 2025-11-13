import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Opportunity } from './Opportunity.entity';

@Entity('revenue_distribution')
export class RevenueDistribution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Opportunity, (opp) => opp.revenue_distribution, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'opportunity_id' })
  opportunity: Opportunity;

  @Column({ type: 'uuid' })
  @Index()
  opportunity_id: string;

  @Column({ type: 'integer' })
  year: number;

  @Column({ type: 'integer' })
  month: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  sales_amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  gross_margin_amount: number;

  @Column({ type: 'boolean', default: true })
  is_forecast: boolean;
}
