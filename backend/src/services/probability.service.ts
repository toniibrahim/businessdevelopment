import { AppDataSource } from '../config/database';
import { ProbabilityCoefficient, FactorType } from '../entities';
import redisClient from '../config/redis';

const coefficientRepository = AppDataSource.getRepository(ProbabilityCoefficient);

export interface ProbabilityFactors {
  project_type?: string;
  project_maturity: string;
  client_type: string;
  client_relationship: string;
  conservative_approach: boolean;
}

export interface ProbabilityBreakdown {
  base: number;
  project_type_coef: number;
  maturity_coef: number;
  client_type_coef: number;
  relationship_coef: number;
  conservative_coef: number;
  final: number;
}

export class ProbabilityService {
  private coefficientsCache: Map<string, number> = new Map();
  private readonly CACHE_TTL = 3600; // 1 hour
  private readonly CACHE_KEY = 'probability:coefficients';

  /**
   * Calculate probability score based on multiple factors
   */
  async calculateProbability(factors: ProbabilityFactors): Promise<number> {
    // Load coefficients (from cache or database)
    const coefficients = await this.loadCoefficients();

    // Base coefficient (always 1.0)
    let probability = 1.0;

    // Project Type coefficient
    if (factors.project_type) {
      const projectTypeCoef = this.getCoefficient(
        coefficients,
        FactorType.PROJECT_TYPE,
        factors.project_type
      );
      probability *= projectTypeCoef;
    }

    // Project Maturity coefficient
    const maturityCoef = this.getCoefficient(
      coefficients,
      FactorType.PROJECT_MATURITY,
      factors.project_maturity
    );
    probability *= maturityCoef;

    // Client Type coefficient
    const clientTypeCoef = this.getCoefficient(
      coefficients,
      FactorType.CLIENT_TYPE,
      factors.client_type
    );
    probability *= clientTypeCoef;

    // Client Relationship coefficient
    const relationshipCoef = this.getCoefficient(
      coefficients,
      FactorType.CLIENT_RELATIONSHIP,
      factors.client_relationship
    );
    probability *= relationshipCoef;

    // Conservative Approach coefficient
    if (factors.conservative_approach) {
      const conservativeCoef = this.getCoefficient(
        coefficients,
        FactorType.CONSERVATIVE_APPROACH,
        'Yes'
      );
      probability *= conservativeCoef;
    }

    // Round to 4 decimal places
    return Math.round(probability * 10000) / 10000;
  }

  /**
   * Calculate probability with detailed breakdown
   */
  async calculateProbabilityWithBreakdown(
    factors: ProbabilityFactors
  ): Promise<ProbabilityBreakdown> {
    const coefficients = await this.loadCoefficients();

    const base = 1.0;
    const project_type_coef = factors.project_type
      ? this.getCoefficient(coefficients, FactorType.PROJECT_TYPE, factors.project_type)
      : 1.0;
    const maturity_coef = this.getCoefficient(
      coefficients,
      FactorType.PROJECT_MATURITY,
      factors.project_maturity
    );
    const client_type_coef = this.getCoefficient(
      coefficients,
      FactorType.CLIENT_TYPE,
      factors.client_type
    );
    const relationship_coef = this.getCoefficient(
      coefficients,
      FactorType.CLIENT_RELATIONSHIP,
      factors.client_relationship
    );
    const conservative_coef = factors.conservative_approach
      ? this.getCoefficient(coefficients, FactorType.CONSERVATIVE_APPROACH, 'Yes')
      : 1.0;

    const final =
      base *
      project_type_coef *
      maturity_coef *
      client_type_coef *
      relationship_coef *
      conservative_coef;

    return {
      base,
      project_type_coef,
      maturity_coef,
      client_type_coef,
      relationship_coef,
      conservative_coef,
      final: Math.round(final * 10000) / 10000,
    };
  }

  /**
   * Load all coefficients (with caching)
   */
  private async loadCoefficients(): Promise<ProbabilityCoefficient[]> {
    try {
      // Try to get from Redis cache
      const cached = await redisClient.get(this.CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }

      // Load from database
      const coefficients = await coefficientRepository.find({
        where: { is_active: true },
      });

      // Cache in Redis
      await redisClient.setEx(this.CACHE_KEY, this.CACHE_TTL, JSON.stringify(coefficients));

      return coefficients;
    } catch (error) {
      console.error('Error loading coefficients:', error);
      // Return from database if Redis fails
      return coefficientRepository.find({ where: { is_active: true } });
    }
  }

  /**
   * Get coefficient value for a specific factor
   */
  private getCoefficient(
    coefficients: ProbabilityCoefficient[],
    factorType: FactorType,
    factorValue: string
  ): number {
    const coefficient = coefficients.find(
      (c) => c.factor_type === factorType && c.factor_value === factorValue
    );

    if (!coefficient) {
      console.warn(
        `Coefficient not found for ${factorType}:${factorValue}, using default 1.0`
      );
      return 1.0;
    }

    return parseFloat(coefficient.coefficient.toString());
  }

  /**
   * Get all coefficients grouped by type
   */
  async getAllCoefficients(): Promise<{
    items: ProbabilityCoefficient[];
    grouped: Record<string, Array<{ factor_value: string; coefficient: number }>>;
  }> {
    const coefficients = await this.loadCoefficients();

    const grouped: Record<string, Array<{ factor_value: string; coefficient: number }>> = {};

    for (const coef of coefficients) {
      if (!grouped[coef.factor_type]) {
        grouped[coef.factor_type] = [];
      }
      grouped[coef.factor_type].push({
        factor_value: coef.factor_value,
        coefficient: parseFloat(coef.coefficient.toString()),
      });
    }

    return { items: coefficients, grouped };
  }

  /**
   * Create or update coefficient
   */
  async upsertCoefficient(
    factorType: FactorType,
    factorValue: string,
    coefficient: number
  ): Promise<ProbabilityCoefficient> {
    const existing = await coefficientRepository.findOne({
      where: { factor_type: factorType, factor_value: factorValue },
    });

    if (existing) {
      existing.coefficient = coefficient;
      existing.is_active = true;
      const updated = await coefficientRepository.save(existing);

      // Clear cache
      await this.clearCache();

      return updated;
    }

    const newCoefficient = coefficientRepository.create({
      factor_type: factorType,
      factor_value: factorValue,
      coefficient,
      is_active: true,
    });

    const saved = await coefficientRepository.save(newCoefficient);

    // Clear cache
    await this.clearCache();

    return saved;
  }

  /**
   * Clear coefficient cache
   */
  async clearCache(): Promise<void> {
    try {
      await redisClient.del(this.CACHE_KEY);
    } catch (error) {
      console.error('Error clearing coefficient cache:', error);
    }
  }
}

export default new ProbabilityService();
