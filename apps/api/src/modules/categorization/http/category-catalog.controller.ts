import type { Request, Response } from 'express';
import { createCategoryInputSchema, updateCategoryInputSchema } from '@bills/contracts';
import { requestContext } from '../../../shared/application/request-context';
import { CategoryCatalogService } from '../application/category-catalog.service';

export class CategoryCatalogController {
  constructor(private readonly service: CategoryCatalogService) {}

  list = async (req: Request, res: Response) => {
    const { actor } = requestContext(req);
    const includeArchived = req.query.includeArchived === 'true';
    res.json({ success: true, data: await this.service.list(actor.workspaceId, includeArchived) });
  };

  create = async (req: Request, res: Response) => {
    const { actor } = requestContext(req);
    const data = await this.service.create(actor.workspaceId, createCategoryInputSchema.parse(req.body));
    res.status(201).json({ success: true, data });
  };

  update = async (req: Request, res: Response) => {
    const { actor } = requestContext(req);
    const data = await this.service.update(actor.workspaceId, String(req.params.id), updateCategoryInputSchema.parse(req.body));
    res.json({ success: true, data });
  };

  archive = async (req: Request, res: Response) => {
    const { actor } = requestContext(req);
    const data = await this.service.archive(actor.workspaceId, String(req.params.id));
    res.json({ success: true, data });
  };
}

