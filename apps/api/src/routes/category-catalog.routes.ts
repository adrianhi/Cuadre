import { Router } from 'express';
import { appContainer } from '../app-container';
import { asyncHandler } from '../shared/http/async-handler';
import { requireAuth, requireWorkspace } from '../middlewares/auth.middleware';
import { requireCurrentLegalAcceptance } from '../middlewares/legal.middleware';

const router = Router();
const protectedRoute = [requireAuth, requireCurrentLegalAcceptance, requireWorkspace];

router.get('/category-catalog', ...protectedRoute, asyncHandler(appContainer.categoryCatalogController.list));
router.post('/category-catalog', ...protectedRoute, asyncHandler(appContainer.categoryCatalogController.create));
router.patch('/category-catalog/:id', ...protectedRoute, asyncHandler(appContainer.categoryCatalogController.update));
router.delete('/category-catalog/:id', ...protectedRoute, asyncHandler(appContainer.categoryCatalogController.archive));

export default router;

