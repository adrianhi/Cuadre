import type { Request, Response } from 'express';
import {
  createCreditCardSchema,
  updateCreditCardSchema,
} from '@bills/contracts';
import { requestContext } from '../../../shared/application/request-context';
import type { CreditCardService } from '../application/credit-card.service';

export class CreditCardController {
  constructor(private readonly service: CreditCardService) {}

  public list = async (req: Request, res: Response): Promise<void> => {
    const { actor } = requestContext(req);
    const data = await this.service.listCards(actor.workspaceId);
    res.status(200).json({ success: true, data });
  };

  public recommendation = async (req: Request, res: Response): Promise<void> => {
    const { actor } = requestContext(req);
    const data = await this.service.getTrafficLightSummary(actor.workspaceId);
    res.status(200).json({ success: true, data });
  };

  public detected = async (req: Request, res: Response): Promise<void> => {
    const { actor } = requestContext(req);
    const data = await this.service.detectUnregistered(actor.workspaceId);
    res.status(200).json({ success: true, data });
  };

  public create = async (req: Request, res: Response): Promise<void> => {
    const { actor } = requestContext(req);
    const input = createCreditCardSchema.parse(req.body);
    const data = await this.service.createCard(actor.workspaceId, input);
    res.status(201).json({ success: true, data });
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    const { actor } = requestContext(req);
    const id = String(req.params.id);
    const input = updateCreditCardSchema.parse(req.body);
    const data = await this.service.updateCard(actor.workspaceId, id, input);
    res.status(200).json({ success: true, data });
  };

  public remove = async (req: Request, res: Response): Promise<void> => {
    const { actor } = requestContext(req);
    const id = String(req.params.id);
    await this.service.deleteCard(actor.workspaceId, id);
    res.status(200).json({ success: true });
  };
}
