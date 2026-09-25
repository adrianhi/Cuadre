import type { PaydayRitualDto, PaydaySavingsStatus } from '@bills/contracts';
import { calculatePaydayAmounts, currentPaydayCycle, santoDomingoDate } from '../domain/payday-cycle';
import type {
  PaydayActionRecorder, PaydayCommitmentReader, PaydayExpenseReader, PaydayIncomeReader,
  PaydayReviewRepository, PaydaySavingsReader,
} from './payday-ritual.ports';

const round = (value: number) => Math.round(value * 100) / 100;

export class PaydayRitualService {
  constructor(
    private readonly incomes: PaydayIncomeReader,
    private readonly expenses: PaydayExpenseReader,
    private readonly commitments: PaydayCommitmentReader,
    private readonly reviews: PaydayReviewRepository,
    private readonly events?: PaydayActionRecorder,
    private readonly savings?: PaydaySavingsReader,
  ) {}

  async current(workspaceId: string, profileId: string, currency: 'DOP' | 'USD', now = new Date()): Promise<PaydayRitualDto> {
    const incomeDetails = this.incomes.getIncomePlanDetails
      ? await this.incomes.getIncomePlanDetails(workspaceId, currency)
      : {
          plannedBiweeklyIncome: await this.incomes.plannedBiweeklyIncome(workspaceId, currency),
          savingsTarget: 0,
          paydayDays: [15, 30] as [number, number],
        };

    const cycle = currentPaydayCycle(santoDomingoDate(now), incomeDetails.paydayDays);
    const plannedIncome = incomeDetails.plannedBiweeklyIncome;
    const savingsTarget = incomeDetails.savingsTarget;

    if (plannedIncome <= 0) return {
      eligible: false, currency, status: 'UNAVAILABLE', cycleKey: null, cycleStart: null, cycleEnd: null,
      plannedIncome: 0, paidFixed: 0, otherSpent: 0, futureFixed: 0,
      savingsTarget: 0, savingsTransferred: 0, savingsStatus: 'NOT_SET', paydayDays: [15, 30],
      available: 0, overage: 0, dailyAvailable: 0, daysRemaining: 0, completedAt: null,
    };

    const [spending, futureFixed, completedAt, savingsTransferred] = await Promise.all([
      this.expenses.summarizeCycle(workspaceId, currency, cycle.start, cycle.today),
      this.commitments.sumFutureThrough(workspaceId, currency, cycle.today, cycle.end),
      this.reviews.completedAt(workspaceId, profileId, cycle.key),
      this.savings?.findSavingsTransfersInCycle(workspaceId, currency, cycle.start, cycle.today) ?? Promise.resolve(0),
    ]);

    const amounts = calculatePaydayAmounts({
      plannedIncome, ...spending, futureFixed, savingsTarget, daysRemaining: cycle.daysRemaining,
    });

    let savingsStatus: PaydaySavingsStatus = 'NOT_SET';
    if (savingsTarget > 0) {
      if (savingsTransferred >= savingsTarget) {
        savingsStatus = 'MET';
      } else if (savingsTransferred > 0) {
        savingsStatus = 'PARTIAL';
      } else {
        savingsStatus = 'PENDING';
      }
    }

    return {
      eligible: true, currency, status: completedAt ? 'COMPLETED' : 'OPEN',
      cycleKey: cycle.key, cycleStart: cycle.start, cycleEnd: cycle.end,
      plannedIncome: round(plannedIncome), paidFixed: round(spending.paidFixed),
      otherSpent: round(spending.otherSpent), futureFixed: round(futureFixed),
      savingsTarget: round(savingsTarget), savingsTransferred: round(savingsTransferred),
      savingsStatus, paydayDays: incomeDetails.paydayDays,
      ...amounts, daysRemaining: cycle.daysRemaining, completedAt: completedAt?.toISOString() || null,
    };
  }

  async complete(workspaceId: string, profileId: string, cycleKey: string, currency: 'DOP' | 'USD') {
    const current = await this.current(workspaceId, profileId, currency);
    if (!current.eligible || current.cycleKey !== cycleKey) return null;
    await this.reviews.complete(workspaceId, profileId, cycleKey);
    await this.events?.recordAction({
      workspaceId, profileId, name: 'PAYDAY_RITUAL_COMPLETED', contextKey: cycleKey,
      properties: { currency },
    });
    return this.current(workspaceId, profileId, currency);
  }
}
