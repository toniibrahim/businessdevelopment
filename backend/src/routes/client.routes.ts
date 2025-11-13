import { Router } from 'express';
import clientController from '../controllers/client.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateDto } from '../middleware/validation.middleware';
import { CreateClientDto, UpdateClientDto } from '../dto/client.dto';

const router = Router();

// All routes require authentication
router.use(authenticate);

// List clients (all authenticated users)
router.get('/', clientController.getAll.bind(clientController));

// Get client by ID (all authenticated users)
router.get('/:id', clientController.getById.bind(clientController));

// Get client statistics (all authenticated users)
router.get('/:id/stats', clientController.getStats.bind(clientController));

// Create client (all authenticated users can create clients)
router.post(
  '/',
  validateDto(CreateClientDto),
  clientController.create.bind(clientController)
);

// Update client (all authenticated users)
router.put(
  '/:id',
  validateDto(UpdateClientDto),
  clientController.update.bind(clientController)
);

// Delete client (all authenticated users, but service will check for opportunities)
router.delete('/:id', clientController.delete.bind(clientController));

export default router;
