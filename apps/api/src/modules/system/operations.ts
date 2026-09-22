import { OperationsController } from './http/operations.controller';
import { PrismaOperationsRepository } from './infrastructure/prisma-operations.repository';

export const operationsController = new OperationsController(new PrismaOperationsRepository());
