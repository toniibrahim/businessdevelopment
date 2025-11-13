import { Request, Response, NextFunction } from 'express';
import clientService from '../services/client.service';
import { CreateClientDto, UpdateClientDto } from '../dto/client.dto';

export class ClientController {
  /**
   * Get all clients
   * GET /api/clients
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string | undefined;

      const result = await clientService.findAll(page, limit, search);

      res.status(200).json(result);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get client by ID
   * GET /api/clients/:id
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const client = await clientService.findById(id);

      if (!client) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Client not found',
          },
        });
        return;
      }

      res.status(200).json(client);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Create client
   * POST /api/clients
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateClientDto = req.body;
      const client = await clientService.create(data);

      res.status(201).json(client);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Update client
   * PUT /api/clients/:id
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateClientDto = req.body;

      const client = await clientService.update(id, data);

      res.status(200).json(client);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Delete client
   * DELETE /api/clients/:id
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await clientService.delete(id);

      res.status(204).send();
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get client statistics
   * GET /api/clients/:id/stats
   */
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const stats = await clientService.getClientStats(id);

      res.status(200).json(stats);
    } catch (error: any) {
      next(error);
    }
  }
}

export default new ClientController();
