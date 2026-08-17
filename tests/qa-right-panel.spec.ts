import { expect, test } from '@playwright/test';

test('desktop game interaction rail uses the full right side with large type', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 650 });
  await page.goto('/pt/');
  await page.getByRole('button', { name: /caso 002/i }).click();
  await expect(page.locator('.kids3-loader-card > strong')).toHaveText('100%', { timeout: 20_000 });
  await expect(page.locator('[data-screen="case002-warning"]')).toBeVisible({ timeout: 5_000 });
  await page.getByRole('button', { name: /descobrir o problema/i }).click();

  const scene = page.locator('[data-screen="case002-weak"]');
  await expect(scene).toBeVisible();
  const metrics = await scene.evaluate((node) => {
    const panel = node.querySelector('.kids3-panel') as HTMLElement | null;
    const heading = node.querySelector('.kids3-panel h1') as HTMLElement | null;
    const choiceLabel = node.querySelector('.kids3-choice b') as HTMLElement | null;
    if (!panel || !heading || !choiceLabel) throw new Error('interaction rail missing');
    const p = panel.getBoundingClientRect();
    const h = getComputedStyle(heading);
    const c = getComputedStyle(choiceLabel);
    return {
      panel: { x: p.x, y: p.y, width: p.width, height: p.height, right: p.right, bottom: p.bottom },
      viewport: { width: innerWidth, height: innerHeight },
      headingSize: parseFloat(h.fontSize),
      choiceSize: parseFloat(c.fontSize),
      radius: getComputedStyle(panel).borderRadius,
    };
  });

  expect(metrics.panel.y).toBeLessThanOrEqual(1);
  expect(metrics.panel.right).toBeGreaterThanOrEqual(metrics.viewport.width - 1);
  expect(metrics.panel.bottom).toBeGreaterThanOrEqual(metrics.viewport.height - 1);
  expect(metrics.panel.height).toBeGreaterThanOrEqual(metrics.viewport.height - 1);
  expect(metrics.panel.width).toBeGreaterThanOrEqual(430);
  expect(metrics.panel.x).toBeGreaterThan(metrics.viewport.width * .55);
  expect(metrics.headingSize).toBeGreaterThanOrEqual(33);
  expect(metrics.choiceSize).toBeGreaterThanOrEqual(17);
  expect(metrics.radius).toBe('0px');

  const clippedButtons = await page.locator('.kids3-panel button:visible').evaluateAll(buttons => buttons.filter(button => {
    const rect = button.getBoundingClientRect();
    return rect.left < -1 || rect.top < -1 || rect.right > innerWidth + 1 || rect.bottom > innerHeight + 1;
  }).map(button => button.textContent?.trim()));
  expect(clippedButtons).toEqual([]);
});
