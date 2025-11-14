import { Request, Response, NextFunction } from 'express';
import exportService from '../services/export.service';
import { OpportunityStatus, OpportunityStage } from '../entities';

export class ExportController {
  /**
   * Export opportunities to Excel
   * GET /api/export/opportunities/excel
   */
  async exportOpportunitiesExcel(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const currentUser = req.user;

      if (!currentUser) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
        return;
      }

      // Parse filters from query params
      const filters = {
        status: req.query.status as OpportunityStatus,
        stage: req.query.stage as OpportunityStage,
        owner_id: req.query.owner_id as string,
        team_id: req.query.team_id as string,
        service_type: req.query.service_type as string,
        sector_type: req.query.sector_type as string,
        date_from: req.query.date_from ? new Date(req.query.date_from as string) : undefined,
        date_to: req.query.date_to ? new Date(req.query.date_to as string) : undefined,
        search: req.query.search as string,
      };

      // Generate Excel file
      const buffer = await exportService.exportToExcel(
        filters,
        currentUser.userId,
        currentUser.role
      );

      // Set response headers
      const filename = `opportunities_${new Date().toISOString().split('T')[0]}.xlsx`;
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.byteLength);

      // Send file
      res.send(buffer);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Export opportunities to CSV
   * GET /api/export/opportunities/csv
   */
  async exportOpportunitiesCSV(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const currentUser = req.user;

      if (!currentUser) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
        return;
      }

      // Parse filters from query params
      const filters = {
        status: req.query.status as OpportunityStatus,
        stage: req.query.stage as OpportunityStage,
        owner_id: req.query.owner_id as string,
        team_id: req.query.team_id as string,
        service_type: req.query.service_type as string,
        sector_type: req.query.sector_type as string,
        date_from: req.query.date_from ? new Date(req.query.date_from as string) : undefined,
        date_to: req.query.date_to ? new Date(req.query.date_to as string) : undefined,
        search: req.query.search as string,
      };

      // Generate CSV file
      const csv = await exportService.exportToCSV(
        filters,
        currentUser.userId,
        currentUser.role
      );

      // Set response headers
      const filename = `opportunities_${new Date().toISOString().split('T')[0]}.csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', Buffer.byteLength(csv));

      // Send file
      res.send(csv);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Export revenue distribution to Excel
   * GET /api/export/revenue-distribution/excel
   */
  async exportRevenueDistribution(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const currentUser = req.user;

      if (!currentUser) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
        return;
      }

      // Parse filters from query params
      const filters = {
        status: req.query.status as OpportunityStatus,
        stage: req.query.stage as OpportunityStage,
        owner_id: req.query.owner_id as string,
        team_id: req.query.team_id as string,
        service_type: req.query.service_type as string,
        sector_type: req.query.sector_type as string,
        date_from: req.query.date_from ? new Date(req.query.date_from as string) : undefined,
        date_to: req.query.date_to ? new Date(req.query.date_to as string) : undefined,
        search: req.query.search as string,
      };

      // Generate Excel file
      const buffer = await exportService.exportRevenueDistribution(
        filters,
        currentUser.userId,
        currentUser.role
      );

      // Set response headers
      const filename = `revenue_distribution_${new Date().toISOString().split('T')[0]}.xlsx`;
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.byteLength);

      // Send file
      res.send(buffer);
    } catch (error: any) {
      next(error);
    }
  }
}

export default new ExportController();
