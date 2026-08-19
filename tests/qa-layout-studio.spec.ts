import { expect, test } from '@playwright/test';

test('layout studio edits a cover and applies it to the game in the same browser', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 820 });
  await page.goto('/layout-studio/');

  await expect(page.getByRole('heading', { name: /studio de enquadramento/i })).toBeVisible();
  await expect(page.getByText(/a cidade que ficou no escuro/i).first()).toBeVisible();

  const horizontal = page.getByRole('slider', { name: /posição horizontal/i });
  const vertical = page.getByRole('slider', { name: /posição vertical/i });
  const zoom = page.getByRole('slider', { name: /zoom/i });

  await horizontal.fill('68');
  await vertical.fill('44');
  await zoom.fill('1.12');

  const preview = page.locator('main img[src="/game/assets/super-001/00_capa_cidade_no_escuro.png"]').last();
  await expect(preview).toHaveCSS('object-position', '68% 44%');

  await page.goto('/pt/');
  const featured = page.locator('.kids3-game-card > img');
  await expect(featured).toBeVisible();
  await expect.poll(async () => featured.evaluate(img => getComputedStyle(img).objectPosition)).toBe('68% 44%');
  await expect.poll(async () => featured.evaluate(img => getComputedStyle(img).transform)).not.toBe('none');
});
