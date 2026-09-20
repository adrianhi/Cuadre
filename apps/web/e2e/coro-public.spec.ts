import { expect, test } from '@playwright/test';

const ownerId = '00000000-0000-4000-8000-000000000001';
const guestId = '00000000-0000-4000-8000-000000000002';
const groupId = '00000000-0000-4000-8000-000000000010';
const now = '2026-09-19T18:00:00.000Z';
const participants = [
  { id: ownerId, name: 'Adrian', isOwner: true, isClaimed: true, totalPaid: 0, totalOwed: 0, netBalance: 0 },
  { id: guestId, name: 'Pedro', isOwner: false, isClaimed: false, totalPaid: 0, totalOwed: 0, netBalance: 0 },
];
const detail = (claimed = false, withExpense = false) => ({
  id: groupId, slug: 'terrenas-public-test', name: '🏖️ Las Terrenas', description: 'Fin de semana',
  currency: 'DOP', status: 'ACTIVE', totalAmount: withExpense ? 3000 : 0,
  viewerParticipantId: claimed ? guestId : null,
  participants: participants.map((item) => item.id === guestId ? { ...item, isClaimed: claimed } : item),
  expenses: withExpense ? [{ id: '00000000-0000-4000-8000-000000000020', paidById: guestId,
    paidByName: 'Pedro', createdByParticipantId: guestId, title: 'Cena', amount: 3000, currency: 'DOP',
    category: 'Varios', expenseDate: now, notes: null, splitParticipantIds: [ownerId, guestId],
    transactionId: null, canEdit: true }] : [],
  settlements: withExpense ? [{ id: null, fromId: ownerId, fromName: 'Adrian', toId: guestId,
    toName: 'Pedro', amount: 1500, status: 'PENDING', canMarkPaid: false, canConfirm: false }] : [],
  createdAt: now, lockedAt: null, archivedAt: null,
});

test('an invited participant claims an identity and adds a shared expense', async ({ page }) => {
  let claimed = false; let withExpense = false;
  await page.route('**/api/v1/public/coro/terrenas-public-test', (route) => route.fulfill({
    json: { success: true, data: detail(claimed, withExpense) },
  }));
  await page.route('**/api/v1/public/coro/terrenas-public-test/claim', async (route) => {
    claimed = true;
    await route.fulfill({ json: { success: true, data: { token: 'a'.repeat(43), participantId: guestId, detail: detail(true, false) } } });
  });
  await page.route('**/api/v1/public/coro/terrenas-public-test/expenses', async (route) => {
    expect(route.request().headers()['x-coro-participant-token']).toBe('a'.repeat(43));
    withExpense = true;
    await route.fulfill({ status: 201, json: { success: true, data: detail(true, true) } });
  });

  await page.goto('/coro/terrenas-public-test');
  await expect(page.getByRole('heading', { name: '🏖️ Las Terrenas' })).toBeVisible();
  await page.locator('select').first().selectOption(guestId);
  await page.getByRole('button', { name: 'Soy yo' }).click();
  await page.getByRole('button', { name: 'Agregar gasto' }).click();
  await page.getByPlaceholder('Cena, gasolina, alojamiento…').fill('Cena');
  await page.getByLabel('Monto (DOP)').fill('3000');
  await page.getByRole('button', { name: 'Guardar gasto' }).click();
  await expect(page.getByText('Cena', { exact: true })).toBeVisible();
  await expect(page.getByText('RD$ 3,000.00').last()).toBeVisible();
  await page.getByRole('tab', { name: 'El Cuadre' }).click();
  await expect(page.getByText(/Adrian.*le paga a.*Pedro/)).toBeVisible();
});
