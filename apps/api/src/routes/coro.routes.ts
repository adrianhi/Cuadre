import { Router, type Request, type Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import { appContainer } from '../app-container';
import { config } from '../config';
import { requireAuth, requireWorkspace } from '../middlewares/auth.middleware';
import { requireCurrentLegalAcceptance } from '../middlewares/legal.middleware';
import { asyncHandler } from '../shared/http/async-handler';
import { logger } from '../shared/observability/logger';

const router = Router();
const protectedRoute = [requireAuth, requireCurrentLegalAcceptance, requireWorkspace];
const limited = (limit: number) => rateLimit({
  windowMs: 60_000, limit: config.nodeEnv === 'test' ? 10_000 : limit,
  standardHeaders: 'draft-8', legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('coro_public_rate_limited', { requestId: req.requestId, path: req.route?.path });
    res.status(429).json({ success: false, error: { code: 'RATE_LIMITED', message: 'Demasiados intentos. Espera un momento.', requestId: req.requestId } });
  },
});
const publicWrite = limited(15);
const claimLimit = limited(5);
const controller = appContainer.coroController;

router.get('/public/coro/:slug', asyncHandler(controller.publicDetail));
router.post('/public/coro/:slug/claim', claimLimit, asyncHandler(controller.claim));
router.patch('/public/coro/:slug/participants/me', publicWrite, asyncHandler(controller.updatePayment));
router.post('/public/coro/:slug/expenses', publicWrite, asyncHandler(controller.createExpense));
router.patch('/public/coro/:slug/expenses/:expenseId', publicWrite, asyncHandler(controller.updateExpense));
router.delete('/public/coro/:slug/expenses/:expenseId', publicWrite, asyncHandler(controller.removeExpense));
router.post('/public/coro/:slug/settlements/:settlementId/mark-paid', publicWrite, asyncHandler(controller.markPaid));
router.post('/public/coro/:slug/settlements/:settlementId/confirm', publicWrite, asyncHandler(controller.confirm));

router.get('/coro', ...protectedRoute, asyncHandler(controller.list));
router.post('/coro', ...protectedRoute, asyncHandler(controller.create));
router.get('/coro/:id', ...protectedRoute, asyncHandler(controller.detail));
router.patch('/coro/:id', ...protectedRoute, asyncHandler(controller.update));
router.post('/coro/:id/participants', ...protectedRoute, asyncHandler(controller.addParticipant));
router.patch('/coro/:id/participants/me', ...protectedRoute, asyncHandler(controller.updateOwnerPayment));
router.post('/coro/:id/participants/:participantId/release-claim', ...protectedRoute, asyncHandler(controller.releaseClaim));
router.patch('/coro/:id/participants/:participantId', ...protectedRoute, asyncHandler(controller.updateParticipant));
router.delete('/coro/:id/participants/:participantId', ...protectedRoute, asyncHandler(controller.removeParticipant));
router.post('/coro/:id/lock', ...protectedRoute, asyncHandler(controller.lock));
router.post('/coro/:id/archive', ...protectedRoute, asyncHandler(controller.archive));
router.get('/coro/:id/candidate-transactions', ...protectedRoute, asyncHandler(controller.candidates));
router.post('/coro/:id/link-transaction', ...protectedRoute, asyncHandler(controller.link));
router.post('/coro/:id/expenses', ...protectedRoute, asyncHandler(controller.createOwnerExpense));
router.delete('/coro/:id/expenses/:expenseId', ...protectedRoute, asyncHandler(controller.removeOwnerExpense));
router.patch('/coro/:id/expenses/:expenseId', ...protectedRoute, asyncHandler(controller.updateOwnerExpense));
router.post('/coro/:id/settlements/:settlementId/confirm', ...protectedRoute, asyncHandler(controller.confirmOwner));
router.post('/coro/:id/settlements/:settlementId/mark-paid', ...protectedRoute, asyncHandler(controller.markPaidOwner));

export default router;
