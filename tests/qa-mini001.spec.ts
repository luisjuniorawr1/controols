import { expect, test } from '@playwright/test';

test('MG-001 loads the MexeMundo pairing screen and keeps TV viewport contained', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/pt/mini-001/');

  await expect(page.locator('.mg001-root')).toBeVisible();
  await expect(page.getByText('Conecte o celular')).toBeVisible();
  await expect(page.locator('.mg001-pairing-card strong')).toHaveText(/[A-Z0-9]{4}/);

  const bounds = await page.locator('.mg001-root').evaluate(node => {
    const rect = (node as HTMLElement).getBoundingClientRect();
    return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: innerWidth, height: innerHeight };
  });
  expect(bounds.left).toBe(0);
  expect(bounds.top).toBe(0);
  expect(bounds.right).toBe(bounds.width);
  expect(bounds.bottom).toBe(bounds.height);
});
