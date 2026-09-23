import type { Request, Response } from 'express';
import {
  claimCoroParticipantInputSchema, createCoroExpenseInputSchema, createCoroGroupInputSchema,
  createCoroParticipantInputSchema, linkCoroTransactionInputSchema, updateCoroExpenseInputSchema,
  updateCoroGroupInputSchema, updateCoroParticipantInputSchema, updateCoroPaymentInputSchema,
} from '@bills/contracts';
import { AppError } from '../../../errors/app-error';
import { requestContext } from '../../../shared/application/request-context';
import type { CoroService } from '../application/coro.service';

function token(req: Request): string {
  const value = req.headers['x-coro-participant-token'];
  if (typeof value !== 'string' || value.length < 32 || value.length > 128) {
    throw new AppError(401, 'CORO_PARTICIPANT_SESSION_REQUIRED', 'Selecciona tu identidad para continuar.');
  }
  return value;
}
const data = (res: Response, value: unknown, status = 200): void => {
  res.status(status).json({ success: true, data: value });
};

export class CoroController {
  constructor(private readonly service: CoroService) {}
  list = async (req: Request, res: Response) => data(res, await this.service.list(requestContext(req).actor));
  create = async (req: Request, res: Response) => data(res,
    await this.service.create(requestContext(req).actor, createCoroGroupInputSchema.parse(req.body)), 201);
  detail = async (req: Request, res: Response) => data(res,
    await this.service.detail(requestContext(req).actor, String(req.params.id)));
  update = async (req: Request, res: Response) => data(res,
    await this.service.update(requestContext(req).actor, String(req.params.id), updateCoroGroupInputSchema.parse(req.body)));
  addParticipant = async (req: Request, res: Response) => data(res,
    await this.service.addParticipant(requestContext(req).actor, String(req.params.id), createCoroParticipantInputSchema.parse(req.body).name), 201);
  releaseClaim = async (req: Request, res: Response) => {
    await this.service.releaseClaim(requestContext(req).actor, String(req.params.id), String(req.params.participantId));
    data(res, { released: true });
  };
  updateParticipant = async (req: Request, res: Response) => data(res,
    await this.service.updateParticipant(requestContext(req).actor, String(req.params.id), String(req.params.participantId),
      updateCoroParticipantInputSchema.parse(req.body).name));
  removeParticipant = async (req: Request, res: Response) => {
    await this.service.removeParticipant(requestContext(req).actor, String(req.params.id), String(req.params.participantId));
    data(res, { deleted: true });
  };
  lock = async (req: Request, res: Response) => data(res,
    await this.service.lock(requestContext(req).actor, String(req.params.id)));
  archive = async (req: Request, res: Response) => data(res,
    await this.service.archive(requestContext(req).actor, String(req.params.id)));
  candidates = async (req: Request, res: Response) => {
    const rows = await this.service.candidates(requestContext(req).actor, String(req.params.id)) as Array<Record<string, unknown>>;
    data(res, rows.map((row) => ({ ...row, amount: Number(row.amount), transactionDate: (row.transactionDate as Date).toISOString() })));
  };
  link = async (req: Request, res: Response) => {
    await this.service.link(requestContext(req).actor, String(req.params.id), linkCoroTransactionInputSchema.parse(req.body));
    data(res, { linked: true }, 201);
  };
  createOwnerExpense = async (req: Request, res: Response) => data(res,
    await this.service.createOwnerExpense(requestContext(req).actor, String(req.params.id), createCoroExpenseInputSchema.parse(req.body)), 201);
  removeOwnerExpense = async (req: Request, res: Response) => {
    await this.service.removeOwnerExpense(requestContext(req).actor, String(req.params.id), String(req.params.expenseId));
    data(res, { deleted: true });
  };
  updateOwnerExpense = async (req: Request, res: Response) => {
    await this.service.updateOwnerExpense(requestContext(req).actor, String(req.params.id), String(req.params.expenseId), updateCoroExpenseInputSchema.parse(req.body));
    data(res, { updated: true });
  };
  confirmOwner = async (req: Request, res: Response) => data(res,
    await this.service.confirmOwner(requestContext(req).actor, String(req.params.id), String(req.params.settlementId)));
  markPaidOwner = async (req: Request, res: Response) => data(res,
    await this.service.markPaidOwner(requestContext(req).actor, String(req.params.id), String(req.params.settlementId),
      typeof req.body?.paymentNote === 'string' ? req.body.paymentNote : undefined));
  publicDetail = async (req: Request, res: Response) => data(res,
    await this.service.publicDetail(String(req.params.slug), typeof req.headers['x-coro-participant-token'] === 'string'
      ? req.headers['x-coro-participant-token'] : undefined));
  claim = async (req: Request, res: Response) => data(res,
    await this.service.claim(String(req.params.slug), claimCoroParticipantInputSchema.parse(req.body)), 201);
  updatePayment = async (req: Request, res: Response) => data(res,
    await this.service.updatePayment(String(req.params.slug), token(req), updateCoroPaymentInputSchema.parse(req.body).paymentDestination));
  updateOwnerPayment = async (req: Request, res: Response) => data(res,
    await this.service.updateOwnerPayment(requestContext(req).actor, String(req.params.id), updateCoroPaymentInputSchema.parse(req.body).paymentDestination));
  createExpense = async (req: Request, res: Response) => data(res,
    await this.service.createExpense(String(req.params.slug), token(req), createCoroExpenseInputSchema.parse(req.body)), 201);
  updateExpense = async (req: Request, res: Response) => data(res,
    await this.service.updateExpense(String(req.params.slug), token(req), String(req.params.expenseId), updateCoroExpenseInputSchema.parse(req.body)));
  removeExpense = async (req: Request, res: Response) => data(res,
    await this.service.removeExpense(String(req.params.slug), token(req), String(req.params.expenseId)));
  markPaid = async (req: Request, res: Response) => data(res,
    await this.service.markPaid(String(req.params.slug), token(req), String(req.params.settlementId),
      typeof req.body?.paymentNote === 'string' ? req.body.paymentNote : undefined));
  confirm = async (req: Request, res: Response) => data(res,
    await this.service.confirm(String(req.params.slug), token(req), String(req.params.settlementId)));
}
