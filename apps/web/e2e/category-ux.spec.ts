import { expect, test } from '@playwright/test';
import { mockAuthenticatedDashboard } from './helpers/mock-dashboard';

const catalog = [
  { id: null, key: 'supermercado', label: 'Supermercado', kind: 'SYSTEM', colorKey: 'emerald', icon: '🛒', isArchived: false },
  { id: null, key: 'renta', label: 'Renta', kind: 'LEGACY', colorKey: 'blue', icon: null, isArchived: false },
  { id: null, key: 'comida', label: 'Comida', kind: 'LEGACY', colorKey: 'amber', icon: null, isArchived: false },
  { id: null, key: 'transporte', label: 'Transporte', kind: 'SYSTEM', colorKey: 'violet', icon: '🚕', isArchived: false },
];

test('creates categories inline, excludes analytics slices and exposes modular settings', async ({ page }) => {
  const items = catalog.map((item) => ({ ...item }));
  await mockAuthenticatedDashboard(page);
  await page.route(/\/api\/v1\/me\/bootstrap$/, (route) => route.fulfill({ json: { success: true, data: {
    onboardingComplete: true, legalAcceptanceRequired: false,
    productGuide: { currentVersion: '2026-09-14.1', versionSeen: '2026-09-14.1', completedAt: '2026-09-14T00:00:00Z', completed: true },
  } } }));
  await page.route(/\/api\/v1\/category-catalog(?:\?|$)/, async (route) => {
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON();
      const created = { id: 'custom-1', key: 'gimnasio', label: 'Gimnasio', kind: 'CUSTOM', colorKey: body.colorKey, icon: body.icon, isArchived: false };
      items.push(created);
      return route.fulfill({ json: { success: true, data: created } });
    }
    return route.fulfill({ json: { success: true, data: items } });
  });
  await page.route(/\/api\/v1\/stats\/summary(?:\?|$)/, (route) => route.fulfill({ json: { success: true, data: {
    period: '2026-09', totalAmount: 50_000, totalIncome: 0, totalTransactions: 8,
    approvedCount: 8, rejectedCount: 0, reversedCount: 0, pendingCount: 0, currency: 'DOP', dailyAverage: 2_500,
    insights: [], byOrganization: [], dailyTrend: [], comparisonBasis: null,
    byCategory: [
      { category: 'Renta', total: 45_000, count: 1, percentage: 90 },
      { category: 'Comida', total: 3_000, count: 4, percentage: 6 },
      { category: 'Transporte', total: 2_000, count: 3, percentage: 4 },
    ],
  } } }));

  await page.goto('/app/home');
  await page.getByRole('button', { name: 'Nuevo movimiento' }).filter({ visible: true }).first().click();
  const actionSheetOption = page.getByRole('dialog', { name: 'Acciones rápidas' }).getByRole('button', { name: 'Nuevo movimiento' });
  if (await actionSheetOption.isVisible()) {
    await actionSheetOption.click();
  }
  await page.getByRole('button', { name: 'Nueva categoría…' }).click();
  await page.getByLabel('Nombre').fill('Gimnasio');
  await page.getByLabel('Emoji opcional').fill('🏋️');
  await page.getByRole('button', { name: 'Crear', exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'Categoría del movimiento' })).toHaveAttribute('data-category-value', 'Gimnasio');
  await expect(page.getByRole('combobox', { name: 'Categoría del movimiento' })).toContainText('Gimnasio');
  await page.keyboard.press('Escape');

  await page.goto('/app/analytics');
  await page.getByRole('button', { name: 'Ocultar Renta' }).click();
  await expect(page.getByText(/Mostrando/)).toContainText('1 oculta');
  await expect(page.getByRole('button', { name: 'Ocultar Comida' })).toContainText('60%');
  await page.getByRole('button', { name: /Abrir conexiones y privacidad/ }).click();
  await expect(page.getByRole('tab', { name: 'Bancos y Gmail' })).toBeVisible();
  await page.getByRole('tab', { name: 'Reglas y automatización' }).click();
  await expect(page.getByText('Tus categorías', { exact: true })).toBeVisible();
  await expect(page.getByText('Gimnasio', { exact: true })).toBeVisible();
});
