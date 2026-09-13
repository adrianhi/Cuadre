import { expect, test, type Page } from '@playwright/test';
import { mockAuthenticatedDashboard } from './helpers/mock-dashboard';

const INVITE_CODE = 'a'.repeat(43);
const STORAGE_KEY = 'cuadre.betaInviteCode';
const GUIDE_VERSION = '2026-09-13.1';

async function storeInvite(page: Page) {
  await page.addInitScript(({ key, code }) => {
    window.sessionStorage.setItem(key, code);
  }, { key: STORAGE_KEY, code: INVITE_CODE });
}

async function mockBootstrapFailure(page: Page, code: string, message: string) {
  await page.route('**/api/v1/me/bootstrap', (route) => route.fulfill({
    status: 403,
    contentType: 'application/json',
    body: JSON.stringify({ success: false, error: { code, message } }),
  }));
  await page.route('**/auth/v1/logout**', (route) => route.fulfill({ status: 204 }));
}

test('captures an invitation, removes the secret from the URL, and explains the next action', async ({ page }) => {
  await page.goto(`/login?invite=${INVITE_CODE}`);

  await expect(page).toHaveURL(/\/login\?invited=true$/);
  await expect(page.getByText('Invitación verificada.')).toBeVisible();
  await expect(page.getByText(/Tus 30 días comienzan al activar/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Entrar con la cuenta invitada' })).toBeVisible();
  await expect(page.getByText('Este paso solo confirma tu identidad. Conectar Gmail viene después.')).toBeVisible();
  await expect(page.getByText(/Antes de conectar datos podrás revisar nuestros/)).toBeVisible();
  await expect.poll(() => page.evaluate((key) => window.sessionStorage.getItem(key), STORAGE_KEY))
    .toBe(INVITE_CODE);
  expect(page.url()).not.toContain(INVITE_CODE);
});

test('retains the invitation after an email mismatch and offers account recovery', async ({ page }) => {
  await mockAuthenticatedDashboard(page);
  await storeInvite(page);
  await mockBootstrapFailure(
    page,
    'BETA_INVITE_EMAIL_MISMATCH',
    'Usa la misma cuenta de Google que recibió la invitación.',
  );

  await page.goto('/auth/callback');

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText('Esta no es la cuenta invitada', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cambiar cuenta de Google' })).toBeVisible();
  await expect.poll(() => page.evaluate((key) => window.sessionStorage.getItem(key), STORAGE_KEY))
    .toBe(INVITE_CODE);
});

test('clears an expired invitation and provides one recovery action', async ({ page }) => {
  await mockAuthenticatedDashboard(page);
  await storeInvite(page);
  await mockBootstrapFailure(
    page,
    'BETA_INVITE_EXPIRED',
    'La invitación ha vencido.',
  );

  await page.goto('/auth/callback');

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText('La invitación venció', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Solicitar acceso a la beta' })).toHaveAttribute('href', '/#beta-waitlist');
  await expect.poll(() => page.evaluate((key) => window.sessionStorage.getItem(key), STORAGE_KEY))
    .toBeNull();
});

test('activates the monthly margin through the legal to onboarding to dashboard sequence', async ({ page }) => {
  await mockAuthenticatedDashboard(page);
  await storeInvite(page);
  let savedBudget: Record<string, unknown> | undefined;
  let savedIncome: Record<string, unknown> | undefined;
  let savedRecurring: Record<string, unknown> | undefined;

  await page.route('**/api/v1/me/bootstrap', (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({
      success: true,
      data: {
        onboardingComplete: false,
        legalAcceptanceRequired: true,
        productGuide: {
          currentVersion: GUIDE_VERSION,
          versionSeen: null,
          completedAt: null,
          completed: false,
        },
      },
    }),
  }));
  await page.route('**/api/v1/legal/me/current', (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({
      success: true,
      data: [
        {
          type: 'TERMS', version: '1.0', title: 'Términos y Condiciones', slug: 'terms',
          effectiveAt: '2026-09-01T00:00:00.000Z', content: '# Términos', required: true, accepted: false,
        },
        {
          type: 'PRIVACY', version: '1.0', title: 'Política de Privacidad', slug: 'privacy',
          effectiveAt: '2026-09-01T00:00:00.000Z', content: '# Privacidad', required: true, accepted: false,
        },
      ],
    }),
  }));
  await page.route('**/api/v1/legal/accept', (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ success: true }),
  }));
  await page.route('**/api/v1/financial-institutions', (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({
      success: true,
      data: [
        { code: 'bhd', displayName: 'BHD', status: 'PILOT', selectable: true },
        { code: 'popular', displayName: 'Popular', status: 'PILOT', selectable: true },
      ],
    }),
  }));
  await page.route('**/api/v1/me/onboarding/complete', (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ success: true, data: { onboardingComplete: true } }),
  }));
  await page.route('**/api/v1/budgets/monthly', async (route) => {
    const request = route.request();
    if (request.method() !== 'PUT') return route.fallback();
    savedBudget = request.postDataJSON() as Record<string, unknown>;
    const month = String(savedBudget.month);
    return route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          month, currency: 'DOP', hasBudget: true, propagation: 'CURRENT_AND_FUTURE',
          totalSpent: 0, totalPending: 0, unbudgetedSpent: 0,
          global: {
            scope: 'GLOBAL', categoryKey: null, categoryLabel: null, limit: 45000,
            spent: 0, pending: 0, remaining: 45000, exceededBy: 0,
            percentUsed: 0, projected: 0, status: 'ON_TRACK',
          },
          categories: [], alerts: [],
        },
      }),
    });
  });
  await page.route('**/api/v1/budgets/safe-to-spend?*', (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({
      success: true,
      data: {
        date: '2026-09-13', month: '2026-09', currency: 'DOP', status: 'SURPLUS', reason: 'NONE',
        globalLimit: 45000, spentBeforeToday: 9000, spentToday: 0, futureConfirmedCommitments: 0,
        daysRemaining: 18, dailyAllowance: 2000, todayAvailable: 2000, todayOverage: 0,
        nextDailyAllowance: 2117.65,
      },
    }),
  }));
  await page.route('**/api/v1/incomes/streams', (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({
      success: true,
      data: [{
        id: 'income-1', name: 'Nómina Principal', amount: 25000, currency: 'DOP',
        frequency: 'BIWEEKLY_15_30', dayOfMonth: null, isActive: true,
      }],
    }),
  }));
  await page.route('**/api/v1/incomes/streams/income-1', (route) => {
    savedIncome = route.request().postDataJSON() as Record<string, unknown>;
    return route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { id: 'income-1', ...savedIncome } }),
    });
  });
  await page.route('**/api/v1/recurring', (route) => {
    if (route.request().method() !== 'POST') return route.fallback();
    savedRecurring = route.request().postDataJSON() as Record<string, unknown>;
    return route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          id: 'recurring-1', ...savedRecurring, lastSeenAt: '2026-09-13T12:00:00.000Z',
          occurrenceCount: 1, confidence: 1, status: 'CONFIRMED', userEdited: true,
          daysRemaining: 0, monthStatus: 'UPCOMING', lastPaidAmount: null, lastPaidDate: null, alerts: [],
        },
      }),
    });
  });

  await page.goto('/auth/callback');

  await expect(page.getByRole('heading', { name: 'Tu privacidad, antes que todo' })).toBeVisible();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Aceptar y continuar' }).click();

  await expect(page.getByText('Paso 1 de 2 · Movimientos')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Trae tus movimientos automáticamente' })).toBeVisible();
  await page.getByRole('button', { name: 'Continuar con movimientos manuales por ahora' }).click();

  await expect(page.getByText('Paso 2 de 2 · Margen Seguro')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Calcula tu Margen Seguro' })).toBeVisible();
  const finish = page.getByRole('button', { name: 'Guardar y ver mi Margen Seguro' });
  await expect(finish).toBeDisabled();
  await expect(page.getByRole('button', { name: /Internet \/ Telecom/ })).toHaveAttribute('aria-pressed', 'false');
  await page.getByLabel('Límite mensual (DOP)').fill('45000');
  await page.getByLabel('Monto (DOP)').fill('30000');
  await page.getByRole('button', { name: /Internet \/ Telecom/ }).click();
  await page.getByLabel('Monto mensual estimado (DOP)').fill('2500');
  await expect(page.getByText(/Estimación inicial de tu Margen Seguro/)).toBeVisible();
  await finish.click();

  await expect(page.getByRole('heading', { name: 'Tu panorama' })).toBeVisible();
  await expect(page.getByText('Margen Seguro Diario', { exact: true })).toBeVisible();
  await expect(page.getByText('Puedes gastar', { exact: true })).toBeVisible();
  const marginBox = await page.locator('[data-product-tour="safe-to-spend"]').boundingBox();
  const connectionBox = await page.locator('[data-product-tour="connection-health"]').boundingBox();
  expect(marginBox).not.toBeNull();
  expect(connectionBox).not.toBeNull();
  expect(marginBox!.y).toBeLessThan(connectionBox!.y);
  await expect(page.getByText('¿Quieres un recorrido rápido?')).toBeVisible();
  expect(savedBudget).toMatchObject({
    currency: 'DOP', propagation: 'CURRENT_AND_FUTURE', globalLimit: 45000, categories: [],
  });
  expect(savedIncome).toMatchObject({
    amount: 30000, frequency: 'BIWEEKLY_15_30', currency: 'DOP', isActive: true,
  });
  expect(savedRecurring).toMatchObject({
    displayName: 'Internet / Telecom (Claro/Altice)', expectedAmount: 2500,
    currency: 'DOP', cadence: 'MONTHLY',
  });
  await expect.poll(() => page.evaluate((key) => window.sessionStorage.getItem(key), STORAGE_KEY))
    .toBeNull();
});

test('keeps the user in the margin step when the budget cannot be saved', async ({ page }) => {
  await mockAuthenticatedDashboard(page);
  let completionRequests = 0;

  await page.route('**/api/v1/me/bootstrap', (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({
      success: true,
      data: {
        onboardingComplete: false,
        legalAcceptanceRequired: false,
        productGuide: {
          currentVersion: GUIDE_VERSION,
          versionSeen: null,
          completedAt: null,
          completed: false,
        },
      },
    }),
  }));
  await page.route('**/api/v1/financial-institutions', (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ success: true, data: [] }),
  }));
  await page.route('**/api/v1/budgets/monthly', (route) => route.fulfill({
    status: 503,
    contentType: 'application/json',
    body: JSON.stringify({
      success: false,
      error: { code: 'BUDGET_SAVE_FAILED', message: 'No pudimos guardar tu límite mensual.' },
    }),
  }));
  await page.route('**/api/v1/me/onboarding/complete', (route) => {
    completionRequests += 1;
    return route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { onboardingComplete: true } }),
    });
  });

  await page.goto('/app');
  await page.getByRole('button', { name: 'Continuar con movimientos manuales por ahora' }).click();
  await page.getByLabel('Límite mensual (DOP)').fill('45000');
  await page.getByRole('button', { name: 'Guardar y ver mi Margen Seguro' }).click();

  await expect(page.getByRole('heading', { name: 'Calcula tu Margen Seguro' })).toBeVisible();
  await expect(page.getByText('No pudimos guardar tu límite mensual.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Guardar y ver mi Margen Seguro' })).toBeEnabled();
  expect(completionRequests).toBe(0);
});
