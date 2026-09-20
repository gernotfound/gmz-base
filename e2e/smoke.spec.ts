import { expect, test } from '@playwright/test';

const gameRoutes = [
  ['/forza4', 'Forza 4 · GMZ Base'],
  ['/non-ho-mai', 'Non Ho Mai · GMZ Base'],
  ['/dnd', 'Duce o Non Duce · GMZ Base'],
  ['/dnd-pro', 'Duce o Non Duce · Pro · GMZ Base'],
] as const;

test('homepage renders the catalog and navigation', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('GMZ Base · Arcade Hub');
  await expect(page.getByRole('heading', { name: 'Una base per tutti i tuoi giochi.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Apri Forza 4' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Apri Non Ho Mai' })).toBeVisible();
});

test('all game routes lazy-load successfully', async ({ page }) => {
  for (const [path, title] of gameRoutes) {
    await page.goto(`/#${path}`);

    await expect(page).toHaveTitle(title);
    await expect(page.getByText('Qualcosa è andato storto')).toHaveCount(0);
  }
});

test('unknown routes render the not-found page and noindex metadata', async ({ page }) => {
  await page.goto('/#/missing-route');

  await expect(page).toHaveTitle('Pagina non trovata · GMZ Base');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
});
