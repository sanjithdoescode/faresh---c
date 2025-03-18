import { Router } from 'express';
import { ProductTraceabilityService } from '../services/traceability/ProductTraceabilityService';

const router = Router();

router.post('/events', async (req, res) => {
  const { productId, farmerId, stage, data } = req.body;
  const event = await traceabilityService.recordTraceabilityEvent({
    productId,
    farmerId,
    stage,
    data
  });
  res.json(event);
});

router.get('/products/:productId/history', async (req, res) => {
  const { productId } = req.params;
  const history = await traceabilityService.getProductHistory(productId);
  res.json(history);
}); 