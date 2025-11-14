import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Opportunity } from './Opportunity.entity';
import { User } from './User.entity';

export enum ActivityType {
  CREATED = 'created',
  UPDATED = 'updated',
  STATUS_CHANGED = 'status_changed',
  STAGE_CHANGED = 'stage_changed',
  NOTE_ADDED = 'note_added',
  MEETING_SCHEDULED = 'meeting_scheduled',
  CALL_MADE = 'call_made',
  EMAIL_SENT = 'email_sent',
  PROPOSAL_SENT = 'proposal_sent',
  DOCUMENT_UPLOADED = 'document_uploaded',
}

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Opportunity, (opp) => opp.activities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'opportunity_id' })
  opportunity!: Opportunity;

  @Column({ type: 'uuid' })
  @Index()
  opportunity_id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({
    type: 'enum',
    enum: ActivityType,
  })
  activity_type!: ActivityType;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'jsonb', nullable: true })
  old_value!: any;

  @Column({ type: 'jsonb', nullable: true })
  new_value!: any;

  @CreateDateColumn()
  @Index()
  created_at!: Date;
}
