import { CoroService } from './application/coro.service';
import { CoroController } from './http/coro.controller';
import { PrismaCoroExpenseStore } from './infrastructure/prisma-coro-expense.store';
import { PrismaCoroGroupStore } from './infrastructure/prisma-coro-group.store';
import { PrismaCoroSettlementStore } from './infrastructure/prisma-coro-settlement.store';

export function createCoroController() {
  const groups = new PrismaCoroGroupStore();
  const expenses = new PrismaCoroExpenseStore(groups);
  const settlements = new PrismaCoroSettlementStore(groups);
  return new CoroController(new CoroService(groups, expenses, settlements));
}
