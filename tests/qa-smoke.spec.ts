import { expect, test } from '@playwright/test';

test('home loads the hacker theme and primary navigation', async ({ page }) => {
  await page.goto('/pt/');
  await expect(page.getByRole('link', { name: 'Controols', exact: true })).toBeVisible();
  await expect(page.locator('.system-chip')).toContainText('SYS://ONLINE');
  await expect(page.locator('.hub-hero h1')).toBeVisible();
  await expect(page.locator('#collections .collection-card').first()).toBeVisible();

  const accent = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim().toLowerCase());
  expect(accent).toBe('#00e676');
});

test('a representative tool page still exposes its runner', async ({ page }) => {
  await page.goto('/pt/tools/pixelate-image/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.runner')).toBeVisible();
});

test('mobile navigation opens without breaking the layout', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/pt/');
  const toggle = page.locator('.mobile-menu-toggle');
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#mobile-navigation')).toHaveClass(/open/);
  await expect(page.locator('.mobile-category-list a').first()).toBeVisible();
});
