import { expect, test } from '@playwright/test';

test('compact story headlines stay large and bold on the supported TV viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 650 });
  await page.goto('/pt/');
  await page.getByRole('button', { name: /jogar o jogador desconhecido/i }).click();
  await expect(page.locator('.kids3-loader-card > strong')).toHaveText('100%', { timeout: 20_000 });

  const scene = page.locator('[data-screen="case005-warning"]');
  await expect(scene).toBeVisible({ timeout: 5_000 });
  const metrics = await scene.evaluate((node) => {
    const panel = node.querySelector('.kids3-panel') as HTMLElement | null;
    const heading = node.querySelector('h1') as HTMLElement | null;
    if (!panel || !heading) throw new Error('Case 005 interaction rail missing');
    const rect = panel.getBoundingClientRect();
    const style = getComputedStyle(heading);
    return {
      fontSize: parseFloat(style.fontSize),
      fontWeight: parseInt(style.fontWeight, 10),
      panelLeft: rect.left,
      panelRight: rect.right,
      viewportWidth: innerWidth,
      viewportHeight: innerHeight,
      scrollHeight: document.documentElement.scrollHeight,
    };
  });

  expect(metrics.fontSize).toBeGreaterThanOrEqual(40);
  expect(metrics.fontWeight).toBeGreaterThanOrEqual(700);
  expect(metrics.panelLeft).toBeGreaterThan(metrics.viewportWidth * .55);
  expect(metrics.panelRight).toBeGreaterThanOrEqual(metrics.viewportWidth - 1);
  expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.viewportHeight + 1);

  const clippedButtons = await scene.locator('button:visible').evaluateAll(buttons => buttons.flatMap(button => {
    const rect = button.getBoundingClientRect();
    return rect.left < -1 || rect.top < -1 || rect.right > innerWidth + 1 || rect.bottom > innerHeight + 1
      ? [button.textContent?.trim() || 'unnamed button']
      : [];
  }));
  expect(clippedButtons).toEqual([]);
});
