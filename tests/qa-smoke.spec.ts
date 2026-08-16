import { expect, test } from '@playwright/test';

async function expectSceneMaster(image: ReturnType<Parameters<typeof expect>[0] extends never ? never : never>) {}

test('kids title screen loads original-resolution artwork and play modes', async ({ page }) => {
  await page.goto('/pt/');
  const art = page.getByRole('img', { name: /luna, theo, maya, caio e nina/i });
  await expect(art).toBeVisible();
  await expect(page.getByRole('button', { name: /1 jogador/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /2 jogadores/i })).toBeVisible();
  await expect.poll(async () => art.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThanOrEqual(1600);
  await expect.poll(async () => art.evaluate((img: HTMLImageElement) => img.naturalHeight)).toBeGreaterThanOrEqual(900);
});

test('one-player flow uses full-resolution character and scene masters', async ({ page }) => {
  await page.goto('/pt/');
  await page.getByRole('button', { name: /1 jogador/i }).click();
  const luna = page.getByRole('img', { name: 'Luna', exact: true });
  await expect(luna).toBeVisible();
  await expect.poll(async () => luna.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThanOrEqual(1100);
  await expect.poll(async () => luna.evaluate((img: HTMLImageElement) => img.naturalHeight)).toBeGreaterThanOrEqual(1400);
  await page.getByRole('button', { name: /começar aventura/i }).click();
  const scene = page.getByRole('img', { name: /mensagem suspeita do clube aurora/i });
  await expect(scene).toBeVisible();
  await expect.poll(async () => scene.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThanOrEqual(1600);
  await expect.poll(async () => scene.evaluate((img: HTMLImageElement) => img.naturalHeight)).toBeGreaterThanOrEqual(900);
  await page.getByRole('button', { name: /procurar pistas/i }).click();
  const clues = page.getByRole('img', { name: /quadro colorido com pistas/i });
  await expect(clues).toBeVisible();
  await expect.poll(async () => clues.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThanOrEqual(1600);
  await expect.poll(async () => clues.evaluate((img: HTMLImageElement) => img.naturalHeight)).toBeGreaterThanOrEqual(900);
});

test('two-player selection keeps five official characters and original masters on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/pt/');
  await page.getByRole('button', { name: /2 jogadores/i }).click();
  const cards = page.getByTestId('character-grid').locator('button');
  await expect(cards).toHaveCount(5);
  await expect(page.getByTestId('character-grid').locator('.is-selected')).toHaveCount(2);
  const firstImage = cards.first().locator('img');
  await expect.poll(async () => firstImage.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThanOrEqual(1100);
  await expect.poll(async () => firstImage.evaluate((img: HTMLImageElement) => img.naturalHeight)).toBeGreaterThanOrEqual(1400);
  await expect(page.getByRole('button', { name: /começar aventura/i })).toBeEnabled();
});
