import { Router, Request, Response } from 'express';
import { ProductTraceabilityService } from '../../services/traceability/ProductTraceabilityService';
import { TraceabilityRepository, NotificationService } from '../../types/services';
import { prisma } from '../../lib/prisma';

const router = Router();

// Create repository implementations
const traceabilityRepository: TraceabilityRepository = {
  // Implement repository methods using prisma
  createRecord: (record) => prisma.traceabilityRecord.create({ data: record }),
  getProductHistory: (productId) => prisma.traceabilityRecord.findMany({
    where: { productId },
    orderBy: { timestamp: 'desc' }
  }),
  updateProductStatus: (productId, status) => prisma.product.update({
    where: { id: productId },
    data: { status }
  })
};

const notificationService: NotificationService = {
  send: async (userId, message) => {
    // Implement notification sending
  },
  notifyFarmer: async (farmerId, message) => {
    // Implement farmer notification
  }
};

const traceabilityService = new ProductTraceabilityService(
  traceabilityRepository,
  notificationService
);

router.post('/events', async (req: Request, res: Response) => {
  const { productId, farmerId, stage, data } = req.body;
  const event = await traceabilityService.recordTraceabilityEvent({
    productId,
    farmerId,
    stage,
    data,
    timestamp: new Date()
  });
  res.json(event);
});

router.get('/products/:productId/history', async (req: Request, res: Response) => {
  const { productId } = req.params;
  const history = await traceabilityService.getProductHistory(productId);
  res.json(history);
});

export { router as traceabilityRouter }; 