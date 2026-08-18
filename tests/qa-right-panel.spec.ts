import { expect, test } from '@playwright/test';

test('desktop game interaction rail uses the full right side with child-readable type', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 650 });
  await page.goto('/pt/');
  await page.getByRole('button', { name: /o cofre das senhas/i }).click();
  await expect(page.locator('.kids3-loader-card > strong')).toHaveText('100%', { timeout: 20_000 });
  await expect(page.locator('[data-screen="case002-warning"]')).toBeVisible({ timeout: 5_000 });

  const warning = page.locator('[data-screen="case002-warning"]');
  const warningMetrics = await warning.evaluate((node) => {
    const panel = node.querySelector('.kids3-panel') as HTMLElement | null;
    const heading = node.querySelector('.kids3-panel h1') as HTMLElement | null;
    const copy = node.querySelector('.kids3-panel p') as HTMLElement | null;
    const tag = node.querySelector('.kids3-tag') as HTMLElement | null;
    const primary = node.querySelector('.kids3-primary') as HTMLElement | null;
    if (!panel || !heading || !copy || !tag || !primary) throw new Error('interaction rail missing');
    const p = panel.getBoundingClientRect();
    return {
      panel: { x: p.x, y: p.y, width: p.width, height: p.height, right: p.right, bottom: p.bottom },
      viewport: { width: innerWidth, height: innerHeight },
      headingSize: parseFloat(getComputedStyle(heading).fontSize),
      copySize: parseFloat(getComputedStyle(copy).fontSize),
      tagSize: parseFloat(getComputedStyle(tag).fontSize),
      primarySize: parseFloat(getComputedStyle(primary).fontSize),
      radius: getComputedStyle(panel).borderRadius,
    };
  });

  expect(warningMetrics.panel.y).toBeLessThanOrEqual(1);
  expect(warningMetrics.panel.right).toBeGreaterThanOrEqual(warningMetrics.viewport.width - 1);
  expect(warningMetrics.panel.bottom).toBeGreaterThanOrEqual(warningMetrics.viewport.height - 1);
  expect(warningMetrics.panel.height).toBeGreaterThanOrEqual(warningMetrics.viewport.height - 1);
  expect(warningMetrics.panel.width).toBeGreaterThanOrEqual(480);
  expect(warningMetrics.panel.x).toBeGreaterThan(warningMetrics.viewport.width * .55);
  expect(warningMetrics.headingSize).toBeGreaterThanOrEqual(39);
  expect(warningMetrics.copySize).toBeGreaterThanOrEqual(16.5);
  expect(warningMetrics.tagSize).toBeGreaterThanOrEqual(12.5);
  expect(warningMetrics.primarySize).toBeGreaterThanOrEqual(17.5);
  expect(warningMetrics.radius).toBe('0px');

  await page.getByRole('button', { name: /descobrir o problema/i }).click();
  const scene = page.locator('[data-screen="case002-weak"]');
  await expect(scene).toBeVisible();
  const typeMetrics = await scene.evaluate((node) => {
    const choiceLabel = node.querySelector('.kids3-choice b') as HTMLElement | null;
    if (!choiceLabel) throw new Error('choice label missing');
    return { choiceSize: parseFloat(getComputedStyle(choiceLabel).fontSize) };
  });
  expect(typeMetrics.choiceSize).toBeGreaterThanOrEqual(18.5);

  await page.getByRole('button', { name: /^123456$/ }).click();
  const feedbackMetrics = await scene.evaluate((node) => {
    const title = node.querySelector('.kids3-feedback b') as HTMLElement | null;
    const copy = node.querySelector('.kids3-feedback p') as HTMLElement | null;
    if (!title || !copy) throw new Error('feedback missing');
    return {
      titleSize: parseFloat(getComputedStyle(title).fontSize),
      copySize: parseFloat(getComputedStyle(copy).fontSize),
    };
  });
  expect(feedbackMetrics.titleSize).toBeGreaterThanOrEqual(17.5);
  expect(feedbackMetrics.copySize).toBeGreaterThanOrEqual(15.5);

  const clippedButtons = await page.locator('.kids3-panel button:visible').evaluateAll(buttons => buttons.filter(button => {
    const rect = button.getBoundingClientRect();
    return rect.left < -1 || rect.top < -1 || rect.right > innerWidth + 1 || rect.bottom > innerHeight + 1;
  }).map(button => button.textContent?.trim()));
  expect(clippedButtons).toEqual([]);
});