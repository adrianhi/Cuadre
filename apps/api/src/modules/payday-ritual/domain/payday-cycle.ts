const DAY_MS = 86_400_000;

export interface PaydayCycle {
  key: string;
  start: string;
  end: string;
  today: string;
  daysRemaining: number;
}

const dateOnly = (date: Date) => date.toISOString().slice(0, 10);
const atUtc = (year: number, month: number, day: number) => new Date(Date.UTC(year, month - 1, day));
const secondPayday = (year: number, month: number, targetDay = 30) =>
  Math.min(targetDay, new Date(Date.UTC(year, month, 0)).getUTCDate());

export function santoDomingoDate(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santo_Domingo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now);
}

export function currentPaydayCycle(
  today = santoDomingoDate(),
  paydayDays: [number, number] = [15, 30],
): PaydayCycle {
  const [year, month, day] = today.split('-').map(Number);
  const [d1, d2] = paydayDays;
  const second = secondPayday(year, month, d2);
  const first = Math.min(d1, second - 1);
  let start: Date;
  let end: Date;

  if (day >= second) {
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const nextFirst = Math.min(d1, secondPayday(nextYear, nextMonth, d2) - 1);
    start = atUtc(year, month, second);
    end = atUtc(nextYear, nextMonth, nextFirst - 1);
  } else if (day >= first) {
    start = atUtc(year, month, first);
    end = atUtc(year, month, second - 1);
  } else {
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevSecond = secondPayday(prevYear, prevMonth, d2);
    start = atUtc(prevYear, prevMonth, prevSecond);
    end = atUtc(year, month, first - 1);
  }

  return {
    key: dateOnly(start),
    start: dateOnly(start),
    end: dateOnly(end),
    today,
    daysRemaining: Math.max(0, Math.round((end.getTime() - atUtc(year, month, day).getTime()) / DAY_MS) + 1),
  };
}

export function calculatePaydayAmounts(input: {
  plannedIncome: number;
  paidFixed: number;
  otherSpent: number;
  futureFixed: number;
  savingsTarget?: number;
  daysRemaining: number;
}) {
  const round = (value: number) => Math.round(value * 100) / 100;
  const savings = Math.max(0, input.savingsTarget || 0);
  const deductions = savings + input.paidFixed + input.otherSpent + input.futureFixed;
  const available = Math.max(input.plannedIncome - deductions, 0);
  return {
    available: round(available),
    overage: round(Math.max(deductions - input.plannedIncome, 0)),
    dailyAvailable: round(input.daysRemaining > 0 ? available / input.daysRemaining : 0),
  };
}
