import { test, expect } from '@playwright/test';

test.describe('Landing Page E2E Suite', () => {
  test('renders full landing page, anchor navigation, and no horizontal overflow on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    // Check Headline
    await expect(page.getByRole('heading', { name: /¿Cuánto puedes gastar hoy/i })).toBeVisible();
    await expect(page.getByText('sin descuadrar tu quincena?')).toBeVisible();

    // Check Cohort badge & 30 days
    await expect(page.getByText(/Cohorte limitada a 100 fundadores/i).first()).toBeVisible();
    await expect(page.getByText(/30 días de acceso completo/i).first()).toBeVisible();

    // Check Anchor links work
    const howItWorksLink = page.getByRole('link', { name: 'Cómo funciona' });
    await expect(howItWorksLink).toHaveAttribute('href', '#como-funciona');
    await howItWorksLink.click();
    await expect(page.locator('#como-funciona')).toBeInViewport();

    // Check absence of forbidden claims
    const pageContent = await page.content();
    expect(pageContent).not.toContain('90 días');
    expect(pageContent).not.toContain('precio congelado');

    // Check no horizontal scroll overflow
    const hasHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(hasHorizontalScroll).toBe(false);
  });

  test('interactive simulator updates dial calculation on preset clicks and custom inputs', async ({ page }) => {
    await page.goto('/');

    // Check initial dial state for default 50k preset
    const dialMeter = page.getByRole('meter', { name: /Dinero simulado disponible/i });
    await expect(dialMeter).toBeVisible();
    await expect(page.getByText('Ritmo saludable')).toBeVisible();

    // Click on 30k preset
    await page.getByRole('button', { name: 'RD$ 30,000' }).click();
    await expect(page.getByLabel('Límite mensual previsto')).toHaveValue('30,000.00');

    // Click on 80k preset
    await page.getByRole('button', { name: 'RD$ 80,000' }).click();
    await expect(page.getByLabel('Límite mensual previsto')).toHaveValue('80,000.00');

    // Input high spending today to trigger adjusting state
    const todayInput = page.getByLabel('Gastado hoy');
    await todayInput.fill('10000');
    await expect(page.getByText(/Margen de hoy agotado/i)).toBeVisible();
  });

  test('handles accessible FAQ accordion toggling with details and summary', async ({ page }) => {
    await page.goto('/#preguntas');

    const firstFaq = page.locator('details[data-faq-index="0"]');
    await expect(firstFaq).toBeVisible();

    // Initially closed
    await expect(firstFaq).not.toHaveAttribute('open', '');

    // Click summary to open
    await firstFaq.locator('summary').click();
    await expect(firstFaq).toHaveAttribute('open', '');
    await expect(firstFaq.getByText(/Cuadre no pide contraseñas/i)).toBeVisible();

    // Click again to close
    await firstFaq.locator('summary').click();
    await expect(firstFaq).not.toHaveAttribute('open', '');
  });

  test('validates waitlist form submission with mocked API', async ({ page }) => {
    let capturedBody: Record<string, unknown> | null = null;
    await page.route('**/api/v1/beta-interest', async (route) => {
      capturedBody = route.request().postDataJSON() as Record<string, unknown>;
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Recibimos tu solicitud. Te avisaremos por correo cuando tu acceso esté disponible.',
        }),
      });
    });

    await page.goto('/');

    const emailInput = page.getByPlaceholder('tu.correo@ejemplo.com');
    await emailInput.fill('tester.beta@gmail.com');

    await page.getByRole('button', { name: 'Solicitar acceso' }).click();

    await expect(page.getByText('Solicitud recibida')).toBeVisible();
    await expect(page.getByText(/Te avisaremos por correo/i)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Continuar con Google' })).toHaveCount(0);
    expect(capturedBody).toMatchObject({
      email: 'tester.beta@gmail.com',
      source: 'LANDING_HERO',
    });
  });

  test('renders properly without horizontal overflow across tablet and mobile viewports', async ({ page }) => {
    // Tablet viewport: 768x1024
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    let hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(hasOverflow).toBe(false);

    // Mobile viewport: 375x812
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(hasOverflow).toBe(false);

    // Check mobile hamburger menu toggle
    const hamburger = page.getByLabel('Abrir menú de navegación');
    await expect(hamburger).toBeVisible();
    await hamburger.click();
    await expect(page.getByRole('link', { name: 'Preguntas frecuentes' })).toBeVisible();
  });
});
