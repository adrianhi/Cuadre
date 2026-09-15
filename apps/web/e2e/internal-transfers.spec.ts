import { expect, test } from '@playwright/test';
import { mockAuthenticatedDashboard } from './helpers/mock-dashboard';

const transaction = (id: string, merchant: string, amount: number, role: 'EXPENSE' | 'INCOME' | 'INTERNAL_TRANSFER',
  suggestedFinancialRole: 'INTERNAL_TRANSFER' | null = null) => ({
  id, externalId: `external-${id}`, cardLast4: '1234', cardType: 'Cuenta', rawMerchant: `RAW ${merchant}`,
  merchant, amount, currency: 'DOP', status: 'Aprobada', statusCode: 'APPROVED',
  transactionType: role === 'INTERNAL_TRANSFER' ? 'Transferencia entre Cuentas' : role === 'EXPENSE' && suggestedFinancialRole ? 'Transferencia Enviada' : 'Compra',
  financialRole: role, financialRoleOrigin: 'SYSTEM', suggestedFinancialRole,
  category: role === 'INTERNAL_TRANSFER' ? 'Transferencias Propias' : suggestedFinancialRole ? 'Transferencias' : 'Supermercado',
  source: 'BHD_EMAIL', institutionCode: 'BHD', ingestionChannel: 'GMAIL_OAUTH', notes: null,
  transactionDate: '2026-09-14T12:00:00.000Z', createdAt: '2026-09-14T12:00:00.000Z',
});

test('shows both transfer legs as neutral and confirms a conservative suggestion', async ({ page }) => {
  await mockAuthenticatedDashboard(page);
  const rows = [
    transaction('out', 'Cuenta BHD', 5000, 'INTERNAL_TRANSFER'),
    transaction('in', 'Cuenta Qik', 5000, 'INTERNAL_TRANSFER'),
    transaction('expense', 'Supermercado Bravo', 100, 'EXPENSE'),
    transaction('suggested', 'Adrian Joel Hidalgo', 3000, 'EXPENSE', 'INTERNAL_TRANSFER'),
  ];
  let patchBody: unknown;
  await page.route(/\/api\/v1\/me\/bootstrap$/, (route) => route.fulfill({ json: {
    success: true, data: { onboardingComplete: true, legalAcceptanceRequired: false,
      productGuide: { currentVersion: '2026-09-14.1', versionSeen: '2026-09-14.1', completedAt: '2026-09-14T12:00:00Z', completed: true } },
  } }));
  await page.route(/\/api\/v1\/transactions(?:\/[^/?]+)?(?:\?|$)/, async (route) => {
    if (route.request().method() === 'PATCH') {
      patchBody = route.request().postDataJSON();
      const id = new URL(route.request().url()).pathname.split('/').pop()!;
      return route.fulfill({ json: { success: true, data: { ...rows.find((row) => row.id === id), ...patchBody } } });
    }
    return route.fulfill({ json: {
      success: true, data: rows,
      pagination: { page: 1, limit: 20, total: rows.length, totalItems: rows.length, totalPages: 1 },
      summary: { totalTransactions: rows.length, totalDOP: 3100, totalUSD: 0, byCategory: {} },
    } });
  });

  await page.goto('/app/transactions');
  await expect(page.getByText('Cuenta BHD', { exact: true }).filter({ visible: true })).toHaveCount(1);
  await expect(page.getByText('Cuenta Qik', { exact: true }).filter({ visible: true })).toHaveCount(1);
  await expect(page.locator('tbody').getByText('Entre cuentas', { exact: true })).toHaveCount(2);

  const mobileRow = page.getByRole('button', { name: /Adrian Joel Hidalgo/ });
  if (await mobileRow.isVisible()) await mobileRow.click();
  else await page.locator('tr').filter({ hasText: 'Adrian Joel Hidalgo' }).getByTitle('Editar clasificación').click();
  await expect(page.getByText('¿Este movimiento fue entre tus cuentas?')).toBeVisible();
  await page.getByRole('button', { name: 'Sí, entre mis cuentas' }).click();
  await page.getByRole('button', { name: 'Guardar Cambios' }).click();
  await expect.poll(() => patchBody).toMatchObject({
    financialRole: 'INTERNAL_TRANSFER', category: 'Transferencias Propias',
  });
});
