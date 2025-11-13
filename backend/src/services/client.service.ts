import { AppDataSource } from '../config/database';
import { ClientCompany } from '../entities';
import { CreateClientDto, UpdateClientDto } from '../dto/client.dto';

const clientRepository = AppDataSource.getRepository(ClientCompany);

export class ClientService {
  /**
   * Get all clients with optional filters
   */
  async findAll(
    page: number = 1,
    limit: number = 20,
    search?: string
  ): Promise<{
    items: ClientCompany[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    const skip = (page - 1) * limit;

    const query = clientRepository.createQueryBuilder('client');

    if (search) {
      query.where(
        '(client.name ILIKE :search OR client.industry ILIKE :search OR client.contact_person ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const total = await query.getCount();
    const items = await query
      .skip(skip)
      .take(limit)
      .orderBy('client.created_at', 'DESC')
      .getMany();

    const pages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      pages,
    };
  }

  /**
   * Get client by ID
   */
  async findById(id: string): Promise<ClientCompany | null> {
    return clientRepository.findOne({ where: { id } });
  }

  /**
   * Create client
   */
  async create(data: CreateClientDto): Promise<ClientCompany> {
    const client = clientRepository.create(data);
    return clientRepository.save(client);
  }

  /**
   * Update client
   */
  async update(id: string, data: UpdateClientDto): Promise<ClientCompany> {
    const client = await clientRepository.findOne({ where: { id } });

    if (!client) {
      throw new Error('Client not found');
    }

    // Update fields
    Object.keys(data).forEach((key) => {
      if (data[key as keyof UpdateClientDto] !== undefined) {
        (client as any)[key] = data[key as keyof UpdateClientDto];
      }
    });

    return clientRepository.save(client);
  }

  /**
   * Delete client
   */
  async delete(id: string): Promise<void> {
    const client = await clientRepository.findOne({ where: { id } });

    if (!client) {
      throw new Error('Client not found');
    }

    // Check if client has opportunities
    const opportunityCount = await AppDataSource.getRepository('Opportunity').count({
      where: { client_id: id },
    });

    if (opportunityCount > 0) {
      throw new Error(
        `Cannot delete client with ${opportunityCount} associated opportunities. Please remove or reassign opportunities first.`
      );
    }

    await clientRepository.remove(client);
  }

  /**
   * Get client statistics
   */
  async getClientStats(clientId: string): Promise<any> {
    const stats = await clientRepository
      .createQueryBuilder('client')
      .leftJoin('opportunities', 'opp', 'opp.client_id = client.id')
      .select('client.id', 'client_id')
      .addSelect('client.name', 'client_name')
      .addSelect('COUNT(DISTINCT opp.id)', 'total_opportunities')
      .addSelect(
        'COUNT(DISTINCT CASE WHEN opp.status = :active THEN opp.id END)',
        'active_opportunities'
      )
      .addSelect(
        'COUNT(DISTINCT CASE WHEN opp.status = :won THEN opp.id END)',
        'won_opportunities'
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN opp.status = :active THEN opp.weighted_amount ELSE 0 END), 0)',
        'pipeline_value'
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN opp.status = :won THEN opp.original_amount ELSE 0 END), 0)',
        'won_value'
      )
      .where('client.id = :clientId', { clientId })
      .setParameters({ active: 'Active', won: 'Won' })
      .groupBy('client.id')
      .addGroupBy('client.name')
      .getRawOne();

    return (
      stats || {
        client_id: clientId,
        total_opportunities: 0,
        active_opportunities: 0,
        won_opportunities: 0,
        pipeline_value: 0,
        won_value: 0,
      }
    );
  }
}

export default new ClientService();
