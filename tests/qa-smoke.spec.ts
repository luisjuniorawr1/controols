import { expect, test } from '@playwright/test';

test('first Controols cyber mystery loads with five fixed characters', async ({ page }) => {
  await page.goto('/pt/');
  await expect(page.getByText('CONTROOLS', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'O Login da Meia-Noite' })).toBeVisible();
  await expect(page.locator('.character-card')).toHaveCount(5);
  await expect(page.getByRole('button', { name: /Iniciar investigação/i })).toBeVisible();
});

test('starting a game assigns a private role without exposing the other roles', async ({ page }) => {
  await page.goto('/pt/');
  await page.getByRole('button', { name: /Iniciar investigação/i }).click();
  await expect(page.getByText('SEU PAPEL SECRETO', { exact: true })).toBeVisible();
  await expect(page.locator('.compact-seats')).toContainText('PAPEL OCULTO');
  await expect(page.getByRole('button', { name: 'Estou pronto' })).toBeVisible();
});

test('prototype remains playable on a phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/pt/');
  await expect(page.getByRole('heading', { name: 'O Login da Meia-Noite' })).toBeVisible();
  await expect(page.locator('.character-card').first()).toBeVisible();
  await expect(page.getByRole('button', { name: /Iniciar investigação/i })).toBeVisible();
});
