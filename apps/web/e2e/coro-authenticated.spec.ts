import { expect, test, type Page } from '@playwright/test';
import { mockAuthenticatedDashboard } from './helpers/mock-dashboard';

const groupId = '00000000-0000-4000-8000-000000000010';
const ownerId = '00000000-0000-4000-8000-000000000001';
const guestId = '00000000-0000-4000-8000-000000000002';
const now = '2026-09-20T12:00:00.000Z';
const summary = { id: groupId, slug: 'coro-page-test', name: 'Viaje a Samaná', description: null, currency: 'DOP', status: 'ACTIVE', participantCount: 2, expenseCount: 1, totalAmount: 3000, updatedAt: now };
const detail = {
  ...summary, viewerParticipantId: ownerId,
  participants: [
    { id: ownerId, name: 'Adrian', isOwner: true, isClaimed: true, totalPaid: 3000, totalOwed: 1500, netBalance: 1500 },
    { id: guestId, name: 'Pedro', isOwner: false, isClaimed: true, totalPaid: 0, totalOwed: 1500, netBalance: -1500 },
  ],
  expenses: [{ id: '00000000-0000-4000-8000-000000000020', paidById: ownerId, paidByName: 'Adrian', createdByParticipantId: ownerId, title: 'Cena', amount: 3000, currency: 'DOP', category: 'Comida', expenseDate: now, notes: null, splitParticipantIds: [ownerId, guestId], transactionId: null, canEdit: true }],
  settlements: [{ id: null, fromId: guestId, fromName: 'Pedro', toId: ownerId, toName: 'Adrian', amount: 1500, status: 'PENDING', canMarkPaid: false, canConfirm: false }],
  createdAt: now, lockedAt: null, archivedAt: null,
};

async function mockCoroDashboard(page: Page) {
  let currentDetail = detail;
  const ownerExpenseRequests: Array<Record<string, unknown>> = [];
  await mockAuthenticatedDashboard(page);
  await page.route(/\/api\/v1\/me\/bootstrap$/, (route) => route.fulfill({ json: { success: true, data: {
    onboardingComplete: true, legalAcceptanceRequired: false,
    productGuide: { currentVersion: '2026-09-14.1', versionSeen: '2026-09-14.1', completedAt: now, completed: true },
  } } }));
  await page.route(/\/api\/v1\/coro$/, (route) => route.fulfill({
    status: route.request().method() === 'POST' ? 201 : 200,
    json: { success: true, data: route.request().method() === 'POST' ? detail : [summary] },
  }));
  await page.route(/\/api\/v1\/category-catalog(?:\?|$)/, (route) => route.fulfill({ json: { success: true, data: [
    { id: null, key: 'varios', label: 'Varios', kind: 'SYSTEM', colorKey: 'slate', icon: null, isArchived: false },
    { id: null, key: 'comida', label: 'Comida', kind: 'SYSTEM', colorKey: 'amber', icon: '🍽️', isArchived: false },
  ] } }));
  await page.route(new RegExp(`/api/v1/coro/${groupId}$`), (route) => route.fulfill({ json: { success: true, data: currentDetail } }));
  await page.route(new RegExp(`/api/v1/coro/${groupId}/candidate-transactions$`), (route) => route.fulfill({ json: { success: true, data: [
    { id: 'bank-transaction-1', merchant: 'SUPERMERCADO CON NOMBRE EXTRAORDINARIAMENTE LARGO', amount: 2450.75,
      currency: 'DOP', category: 'Comida', transactionDate: now, institutionCode: 'BHD' },
  ] } }));
  await page.route(new RegExp(`/api/v1/coro/${groupId}/expenses$`), async (route) => {
    const body = route.request().postDataJSON() as Record<string, unknown>;
    ownerExpenseRequests.push(body);
    if (body.title === 'Peaje duplicado' && body.allowPossibleDuplicate !== true) {
      return route.fulfill({ status: 409, json: { success: false, error: { code: 'POSSIBLE_DUPLICATE',
        message: 'Encontramos un gasto parecido.', details: { candidates: [{ id: 'old-expense', title: 'Peaje duplicado', amount: 100 }] } } } });
    }
    const expense = { id: '00000000-0000-4000-8000-000000000030', paidById: body.paidById,
      paidByName: body.paidById === guestId ? 'Pedro' : 'Adrian', createdByParticipantId: ownerId,
      title: body.title, amount: body.amount, currency: 'DOP', category: body.category,
      expenseDate: body.expenseDate, notes: null, splitParticipantIds: body.splitParticipantIds,
      transactionId: null, canEdit: true };
    currentDetail = { ...detail, totalAmount: detail.totalAmount + Number(body.amount), expenses: [...detail.expenses, expense] };
    return route.fulfill({ status: 201, json: { success: true, data: currentDetail } });
  });
  await page.route(new RegExp(`/api/v1/coro/${groupId}/participants/([^/]+)$`), async (route) => {
    const participantId = route.request().url().split('/').pop();
    if (route.request().method() === 'PATCH') {
      const body = route.request().postDataJSON() as { name: string };
      currentDetail = {
        ...currentDetail,
        participants: currentDetail.participants.map((p) => p.id === participantId ? { ...p, name: body.name } : p),
      };
      return route.fulfill({ json: { success: true, data: { id: participantId, name: body.name } } });
    }
    if (route.request().method() === 'DELETE') {
      currentDetail = {
        ...currentDetail,
        participants: currentDetail.participants.filter((p) => p.id !== participantId),
      };
      return route.fulfill({ json: { success: true, data: { deleted: true } } });
    }
    return route.continue();
  });
  return { ownerExpenseRequests };
}

test('opens the authenticated Coro list and detail as separate pages', async ({ page }) => {
  await mockCoroDashboard(page);
  await page.goto('/app/coro');
  await expect(page.getByRole('heading', { name: 'Modo Coro', exact: true }).last()).toBeVisible();
  await expect(page.getByRole('button', { name: /Viaje a Samaná/ })).toBeVisible();
  await page.getByRole('button', { name: /Viaje a Samaná/ }).click();
  await expect(page).toHaveURL(`/app/coro/${groupId}`);
  await expect(page.getByRole('heading', { name: 'Viaje a Samaná' })).toBeVisible();
  await page.getByRole('tab', { name: 'Gastos' }).click();
  await page.getByRole('button', { name: 'Vincular tarjeta' }).click();
  await expect(page.getByRole('dialog', { name: 'Vincular movimiento' })).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar' }).click();
  await page.getByRole('button', { name: 'Mis coros' }).click();
  await expect(page).toHaveURL('/app/coro');
});

test('creates a coro in a focused dialog and navigates to its detail', async ({ page }) => {
  await mockCoroDashboard(page);
  await page.goto('/app/coro');
  await page.getByRole('button', { name: 'Nuevo coro' }).click();
  await page.getByLabel('Nombre', { exact: true }).fill('Cena de cumpleaños');
  await page.getByLabel('Nombre del participante').fill('Laura');
  await page.getByLabel('Nombre del participante').press('Enter');
  await expect(page.getByText('Laura', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Crear coro', exact: true }).click();
  await expect(page).toHaveURL(`/app/coro/${groupId}`);
  await expect(page.getByRole('heading', { name: 'Viaje a Samaná' })).toBeVisible();
});

test('registers an owner manual expense with category, payer and equal split', async ({ page }) => {
  const mock = await mockCoroDashboard(page);
  await page.goto(`/app/coro/${groupId}`);
  await page.getByRole('tab', { name: 'Gastos' }).click();
  await page.getByRole('button', { name: 'Registrar gasto' }).click();
  const dialog = page.getByRole('dialog', { name: 'Registrar gasto manual' });
  await dialog.getByPlaceholder('Picapollo, peaje, gasolina…').fill('Hielo y carbón');
  await dialog.getByLabel('Monto (DOP)').fill('750.50');
  await dialog.getByRole('combobox', { name: 'Categoría del gasto' }).click();
  await page.getByRole('option', { name: /Comida/ }).click();
  await dialog.getByRole('combobox', { name: 'Quién pagó' }).click();
  await page.getByRole('option', { name: 'Pedro' }).click();
  await dialog.getByRole('button', { name: 'Registrar gasto', exact: true }).click();
  await expect(page.getByText('Hielo y carbón', { exact: true })).toBeVisible();
  expect(mock.ownerExpenseRequests).toHaveLength(1);
  expect(mock.ownerExpenseRequests[0]).toMatchObject({ title: 'Hielo y carbón', amount: 750.5,
    category: 'Comida', paidById: guestId, splitParticipantIds: [ownerId, guestId], allowPossibleDuplicate: false });
});

test('requires confirmation before saving a possible duplicate', async ({ page }) => {
  const mock = await mockCoroDashboard(page);
  await page.goto(`/app/coro/${groupId}`);
  await page.getByRole('tab', { name: 'Gastos' }).click();
  await page.getByRole('button', { name: 'Registrar gasto' }).click();
  const dialog = page.getByRole('dialog', { name: 'Registrar gasto manual' });
  await dialog.getByPlaceholder('Picapollo, peaje, gasolina…').fill('Peaje duplicado');
  await dialog.getByLabel('Monto (DOP)').fill('100');
  await dialog.getByRole('button', { name: 'Registrar gasto', exact: true }).click();
  let duplicate = page.getByRole('dialog', { name: 'Posible gasto duplicado' });
  await expect(duplicate).toContainText('Peaje duplicado');
  await duplicate.getByRole('button', { name: 'Usar el existente' }).click();
  await expect(dialog).toBeHidden();
  expect(mock.ownerExpenseRequests).toHaveLength(1);
  await page.getByRole('button', { name: 'Registrar gasto' }).click();
  const retryDialog = page.getByRole('dialog', { name: 'Registrar gasto manual' });
  await retryDialog.getByPlaceholder('Picapollo, peaje, gasolina…').fill('Peaje duplicado');
  await retryDialog.getByLabel('Monto (DOP)').fill('100');
  await retryDialog.getByRole('button', { name: 'Registrar gasto', exact: true }).click();
  duplicate = page.getByRole('dialog', { name: 'Posible gasto duplicado' });
  await duplicate.getByRole('button', { name: 'Guardar de todos modos' }).click();
  await expect(page.getByText('Peaje duplicado', { exact: true })).toBeVisible();
  expect(mock.ownerExpenseRequests).toHaveLength(3);
  expect(mock.ownerExpenseRequests[2]).toMatchObject({ allowPossibleDuplicate: true });
});

test('hides expense creation actions after the coro is locked', async ({ page }) => {
  await mockCoroDashboard(page);
  await page.route(new RegExp(`/api/v1/coro/${groupId}$`), (route) => route.fulfill({ json: {
    success: true, data: { ...detail, status: 'LOCKED', lockedAt: now },
  } }));
  await page.goto(`/app/coro/${groupId}`);
  await page.getByRole('tab', { name: 'Gastos' }).click();
  await expect(page.getByRole('button', { name: 'Registrar gasto' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Vincular tarjeta' })).toHaveCount(0);
});

test('keeps a single page scroll and four primary sections at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockCoroDashboard(page);
  await page.goto(`/app/coro/${groupId}`);
  await expect(page.getByRole('heading', { name: 'Viaje a Samaná' })).toBeVisible();
  const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width);
  await expect(page.locator('main')).not.toHaveCSS('max-height', '736.469px');
  const bottomNav = page.getByRole('navigation', { name: 'Navegación principal' }).filter({ visible: true });
  await expect(bottomNav.getByRole('button', { name: 'Inicio' })).toBeVisible();
  await expect(bottomNav.getByRole('button', { name: 'Movimientos' })).toBeVisible();
  await expect(bottomNav.getByRole('button', { name: 'Presupuesto' })).toBeVisible();
  await expect(bottomNav.getByRole('button', { name: 'Analítica' })).toBeVisible();
  await expect(bottomNav.getByRole('button', { name: 'Modo Coro' })).toHaveCount(0);
  await page.getByRole('tab', { name: 'Gastos' }).click();
  await page.getByRole('button', { name: 'Vincular tarjeta' }).click();
  const candidateDialog = page.getByRole('dialog', { name: 'Vincular movimiento' });
  await expect(candidateDialog.getByText('RD$ 2,450.75')).toBeVisible();
  const linkButton = candidateDialog.getByRole('button', { name: 'Vincular', exact: true });
  await expect(linkButton).toBeVisible();
  const [dialogBox, buttonBox] = await Promise.all([candidateDialog.boundingBox(), linkButton.boundingBox()]);
  expect(dialogBox).not.toBeNull(); expect(buttonBox).not.toBeNull();
  expect(dialogBox!.x).toBeGreaterThanOrEqual(0); expect(dialogBox!.x + dialogBox!.width).toBeLessThanOrEqual(390);
  expect(buttonBox!.x).toBeGreaterThanOrEqual(dialogBox!.x); expect(buttonBox!.x + buttonBox!.width).toBeLessThanOrEqual(dialogBox!.x + dialogBox!.width);
  const dialogDimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(dialogDimensions.scrollWidth).toBeLessThanOrEqual(dialogDimensions.width);
});

test('edits participant name and deletes non-owner participant', async ({ page }) => {
  await mockCoroDashboard(page);
  await page.goto(`/app/coro/${groupId}`);
  await page.getByRole('tab', { name: 'Participantes' }).click();

  // Test inline edit
  await page.getByRole('button', { name: 'Editar Pedro' }).click();
  const input = page.getByRole('textbox', { name: 'Editar nombre del participante' });
  await input.fill('Pedro Gómez');
  await page.getByRole('button', { name: 'Guardar nombre' }).click();
  await expect(page.getByText('Pedro Gómez', { exact: true })).toBeVisible();

  // Test delete participant
  await page.getByRole('button', { name: 'Eliminar Pedro Gómez' }).click();
  const confirmDialog = page.getByRole('dialog', { name: '¿Eliminar a Pedro Gómez?' });
  await expect(confirmDialog).toBeVisible();
  await confirmDialog.getByRole('button', { name: 'Eliminar participante' }).click();
  await expect(page.getByText('Pedro Gómez')).toHaveCount(0);
});
