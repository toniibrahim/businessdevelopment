import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User.entity';
import { Team } from './Team.entity';
import { RevenueDistribution } from './RevenueDistribution.entity';
import { ActivityLog } from './ActivityLog.entity';
import { ClientCompany } from './ClientCompany.entity';

export enum ServiceType {
  IFM = 'IFM',
  IFM_HARD = 'IFM Hard',
  CIVIL_FITOUT = 'Civil Fitout works',
  SPECIAL_PROJECTS = 'special projects',
}

export enum SectorType {
  DATA_CENTER = 'Data Center',
  INDUSTRIAL = 'Industrial',
  COMMERCIAL = 'Commercial',
  SPECIAL_PROJECT = 'Special project',
}

export enum ProjectMaturity {
  PROSPECTION = 'Prospection',
  RFI = 'RFI',
  RFQ = 'RFQ',
  NEGOTIATION = 'Negotiation',
  CONTRACT_SIGNED = 'Contract Signed',
}

export enum ClientType {
  NEW = 'New',
  EXISTING = 'Existing',
}

export enum ClientRelationship {
  LOW = '1 - Low',
  MEDIUM = '2 - Medium',
  GOOD = '3 - Good',
  HIGH = '4 - High',
  EXCELLENT = '5 - Excellent',
}

export enum OpportunityStatus {
  ACTIVE = 'Active',
  WON = 'Won',
  LOST = 'Lost',
  ON_HOLD = 'On Hold',
  CANCELLED = 'Cancelled',
}

export enum OpportunityStage {
  PROSPECTION = 'Prospection',
  QUALIFICATION = 'Qualification',
  PROPOSAL = 'Proposal',
  NEGOTIATION = 'Negotiation',
  CLOSED = 'Closed',
}

@Entity('opportunities')
export class Opportunity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @Index()
  project_name!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner!: User;

  @Column({ type: 'uuid' })
  @Index()
  owner_id!: string;

  @ManyToOne(() => Team)
  @JoinColumn({ name: 'team_id' })
  team!: Team;

  @Column({ type: 'uuid' })
  @Index()
  team_id!: string;

  // Basic Information
  @Column({ type: 'text', nullable: true })
  update_notes!: string;

  @Column({
    type: 'enum',
    enum: ServiceType,
  })
  service_type!: ServiceType;

  @Column({
    type: 'enum',
    enum: SectorType,
  })
  sector_type!: SectorType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  original_amount!: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0.13 })
  gross_margin_percentage!: number;

  // Probability Scoring Factors
  @Column({ nullable: true })
  project_type!: string;

  @Column({
    type: 'enum',
    enum: ProjectMaturity,
  })
  project_maturity!: ProjectMaturity;

  @Column({
    type: 'enum',
    enum: ClientType,
  })
  client_type!: ClientType;

  @Column({
    type: 'enum',
    enum: ClientRelationship,
  })
  client_relationship!: ClientRelationship;

  @Column({ type: 'boolean', default: false })
  conservative_approach!: boolean;

  // Calculated Fields
  @Column({ type: 'decimal', precision: 5, scale: 4 })
  probability_score!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  weighted_amount!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  gross_margin_amount!: number;

  // Timeline
  @Column({ type: 'date' })
  @Index()
  starting_date!: Date;

  @Column({ type: 'date' })
  @Index()
  closing_date!: Date;

  @Column({ type: 'integer' })
  duration_months!: number;

  // Status & Tracking
  @Column({
    type: 'enum',
    enum: OpportunityStatus,
    default: OpportunityStatus.ACTIVE,
  })
  @Index()
  status!: OpportunityStatus;

  @Column({
    type: 'enum',
    enum: OpportunityStage,
  })
  @Index()
  stage!: OpportunityStage;

  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  win_probability_override!: number;

  // Client Relationship
  @ManyToOne(() => ClientCompany, { nullable: true })
  @JoinColumn({ name: 'client_id' })
  client!: ClientCompany;

  @Column({ type: 'uuid', nullable: true })
  client_id!: string;

  // Metadata
  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  created_by!: User;

  @Column({ type: 'uuid' })
  created_by_id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'last_modified_by_id' })
  last_modified_by!: User;

  @Column({ type: 'uuid' })
  last_modified_by_id!: string;

  // Relations
  @OneToMany(() => RevenueDistribution, (rd) => rd.opportunity)
  revenue_distribution!: RevenueDistribution[];

  @OneToMany(() => ActivityLog, (al) => al.opportunity)
  activities!: ActivityLog[];
}
