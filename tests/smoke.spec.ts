import { test, expect } from '@playwright/test';

test('welcome page loads', async ({ page }) => {
  // Log runtime console and errors for debugging
  page.on('console', (msg) => console.log('[browser]', msg.type(), msg.text()));
  page.on('pageerror', (err) => console.log('[pageerror]', err.message));

  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // Title check
  await expect(page).toHaveTitle(/React App|Armora/i);

  // Wait for React to mount content under #root (avoid checking #root visibility directly)
  await page.waitForFunction(() => {
    const root = document.getElementById('root');
    return !!root && root.childElementCount > 0;
  }, undefined, { timeout: 15000 });

  // Assert a specific heading from the Login screen to avoid ambiguity
  await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible({ timeout: 10000 });
});
