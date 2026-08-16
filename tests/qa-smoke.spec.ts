import { expect, test } from '@playwright/test';

test('kids title screen loads its official artwork and play modes', async ({ page }) => {
  await page.goto('/pt/');
  const art = page.getByRole('img', { name: /luna, theo, maya, caio e nina/i });
  await expect(art).toBeVisible();
  await expect(page.getByRole('button', { name: /1 jogador/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /2 jogadores/i })).toBeVisible();
  await expect.poll(async () => art.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
});

test('one-player flow reaches the first visual challenge with artwork loaded', async ({ page }) => {
  await page.goto('/pt/');
  await page.getByRole('button', { name: /1 jogador/i }).click();
  await expect(page.getByRole('heading', { name: /quem vai entrar na aventura/i })).toBeVisible();
  await page.getByRole('button', { name: /começar aventura/i }).click();
  const scene = page.getByRole('img', { name: /mensagem suspeita do clube aurora/i });
  await expect(scene).toBeVisible();
  await expect.poll(async () => scene.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  await page.getByRole('button', { name: /procurar pistas/i }).click();
  await expect(page.getByRole('heading', { name: /escolha 2 sinais de alerta/i })).toBeVisible();
});

test('two-player selection keeps five official characters and two active seats on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/pt/');
  await page.getByRole('button', { name: /2 jogadores/i }).click();
  await expect(page.getByTestId('character-grid').locator('button')).toHaveCount(5);
  await expect(page.getByTestId('character-grid').locator('.is-selected')).toHaveCount(2);
  await expect(page.getByRole('button', { name: /começar aventura/i })).toBeEnabled();
});
