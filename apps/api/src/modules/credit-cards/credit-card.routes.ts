import { Router } from 'express';
import { requireAuth, requireWorkspace } from '../../middlewares/auth.middleware';
import { requireCurrentLegalAcceptance } from '../../middlewares/legal.middleware';
import { asyncHandler } from '../../shared/http/async-handler';
import { CreditCardController } from './http/credit-card.controller';
import { createCreditCardController } from './credit-card.composition';

export function createCreditCardRouter(controller: CreditCardController = createCreditCardController()): Router {
  const router = Router();
  const protectedRoute = [requireAuth, requireCurrentLegalAcceptance, requireWorkspace];

  router.get('/credit-cards', ...protectedRoute, asyncHandler(controller.list));
  router.get('/credit-cards/recommendation', ...protectedRoute, asyncHandler(controller.recommendation));
  router.get('/credit-cards/detected', ...protectedRoute, asyncHandler(controller.detected));
  router.post('/credit-cards', ...protectedRoute, asyncHandler(controller.create));
  router.patch('/credit-cards/:id', ...protectedRoute, asyncHandler(controller.update));
  router.delete('/credit-cards/:id', ...protectedRoute, asyncHandler(controller.remove));

  return router;
}

export const creditCardRoutes = createCreditCardRouter();
export default creditCardRoutes;
