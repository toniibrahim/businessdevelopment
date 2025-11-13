import { Router } from 'express';
import exportController from '../controllers/export.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Export opportunities to Excel
router.get(
  '/opportunities/excel',
  exportController.exportOpportunitiesExcel.bind(exportController)
);

// Export opportunities to CSV
router.get(
  '/opportunities/csv',
  exportController.exportOpportunitiesCSV.bind(exportController)
);

// Export revenue distribution to Excel
router.get(
  '/revenue-distribution/excel',
  exportController.exportRevenueDistribution.bind(exportController)
);

export default router;
