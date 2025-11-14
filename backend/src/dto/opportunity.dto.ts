import {
  IsString,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsDateString,
  Min,
  Max,
  IsUUID,
  IsArray,
} from 'class-validator';
import {
  ServiceType,
  SectorType,
  ProjectMaturity,
  ClientType,
  ClientRelationship,
  OpportunityStatus,
  OpportunityStage,
} from '../entities';

export class CreateOpportunityDto {
  @IsString()
  project_name!: string;

  @IsOptional()
  @IsString()
  update_notes?: string;

  @IsEnum(ServiceType)
  service_type!: ServiceType;

  @IsEnum(SectorType)
  sector_type!: SectorType;

  @IsNumber()
  @Min(0)
  original_amount!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  gross_margin_percentage?: number;

  @IsOptional()
  @IsString()
  project_type?: string;

  @IsEnum(ProjectMaturity)
  project_maturity!: ProjectMaturity;

  @IsEnum(ClientType)
  client_type!: ClientType;

  @IsEnum(ClientRelationship)
  client_relationship!: ClientRelationship;

  @IsOptional()
  @IsBoolean()
  conservative_approach?: boolean;

  @IsDateString()
  starting_date!: string;

  @IsDateString()
  closing_date!: string;

  @IsOptional()
  @IsEnum(OpportunityStatus)
  status?: OpportunityStatus;

  @IsOptional()
  @IsEnum(OpportunityStage)
  stage?: OpportunityStage;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  win_probability_override?: number;

  @IsOptional()
  @IsUUID()
  client_id?: string;

  @IsOptional()
  @IsUUID()
  team_id?: string;

  @IsOptional()
  @IsUUID()
  owner_id?: string;
}

export class UpdateOpportunityDto {
  @IsOptional()
  @IsString()
  project_name?: string;

  @IsOptional()
  @IsString()
  update_notes?: string;

  @IsOptional()
  @IsEnum(ServiceType)
  service_type?: ServiceType;

  @IsOptional()
  @IsEnum(SectorType)
  sector_type?: SectorType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  original_amount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  gross_margin_percentage?: number;

  @IsOptional()
  @IsString()
  project_type?: string;

  @IsOptional()
  @IsEnum(ProjectMaturity)
  project_maturity?: ProjectMaturity;

  @IsOptional()
  @IsEnum(ClientType)
  client_type?: ClientType;

  @IsOptional()
  @IsEnum(ClientRelationship)
  client_relationship?: ClientRelationship;

  @IsOptional()
  @IsBoolean()
  conservative_approach?: boolean;

  @IsOptional()
  @IsDateString()
  starting_date?: string;

  @IsOptional()
  @IsDateString()
  closing_date?: string;

  @IsOptional()
  @IsEnum(OpportunityStatus)
  status?: OpportunityStatus;

  @IsOptional()
  @IsEnum(OpportunityStage)
  stage?: OpportunityStage;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  win_probability_override?: number;

  @IsOptional()
  @IsUUID()
  client_id?: string;

  @IsOptional()
  @IsUUID()
  owner_id?: string;
}

export class UpdateOpportunityStatusDto {
  @IsEnum(OpportunityStatus)
  status!: OpportunityStatus;

  @IsOptional()
  @IsEnum(OpportunityStage)
  stage?: OpportunityStage;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class BulkUpdateOpportunitiesDto {
  @IsArray()
  @IsUUID('4', { each: true })
  opportunity_ids!: string[];

  @IsOptional()
  @IsEnum(OpportunityStage)
  stage?: OpportunityStage;

  @IsOptional()
  @IsEnum(OpportunityStatus)
  status?: OpportunityStatus;

  @IsOptional()
  @IsUUID()
  owner_id?: string;

  @IsOptional()
  @IsUUID()
  team_id?: string;
}

export class OpportunityQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsEnum(OpportunityStatus)
  status?: OpportunityStatus;

  @IsOptional()
  @IsEnum(OpportunityStage)
  stage?: OpportunityStage;

  @IsOptional()
  @IsUUID()
  owner_id?: string;

  @IsOptional()
  @IsUUID()
  team_id?: string;

  @IsOptional()
  @IsEnum(ServiceType)
  service_type?: ServiceType;

  @IsOptional()
  @IsEnum(SectorType)
  sector_type?: SectorType;

  @IsOptional()
  @IsNumber()
  min_amount?: number;

  @IsOptional()
  @IsNumber()
  max_amount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  min_probability?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  max_probability?: number;

  @IsOptional()
  @IsDateString()
  start_date_from?: string;

  @IsOptional()
  @IsDateString()
  start_date_to?: string;

  @IsOptional()
  @IsDateString()
  close_date_from?: string;

  @IsOptional()
  @IsDateString()
  close_date_to?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sort_by?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sort_order?: 'asc' | 'desc';
}
