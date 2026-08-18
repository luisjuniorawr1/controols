import { expect, test } from '@playwright/test';

test('streaming catalog keeps one cinematic featured story plus two adventure tiles', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 650 });
  await page.goto('/pt/');

  const cards = page.locator('.kids3-game-card');
  await expect(cards).toHaveCount(1);
  const card = cards.first();
  await expect(card).toContainText(/a foto que contava demais/i);
  await expect(page.locator('.kids3-catalog-tile')).toHaveCount(2);

  const metrics = await card.evaluate((node) => {
    const card = node as HTMLElement;
    const image = card.querySelector(':scope > img') as HTMLElement | null;
    const content = card.querySelector(':scope > div') as HTMLElement | null;
    const title = card.querySelector('h2') as HTMLElement | null;
    const play = card.querySelector(':scope > div > b') as HTMLElement | null;
    if (!image || !content || !title || !play) throw new Error('featured story content missing');

    const c = card.getBoundingClientRect();
    const art = image.getBoundingClientRect();
    const box = content.getBoundingClientRect();
    const button = play.getBoundingClientRect();

    return {
      viewport: { width: innerWidth, height: innerHeight },
      card: { left: c.left, top: c.top, right: c.right, bottom: c.bottom, width: c.width, height: c.height },
      art: { width: art.width, height: art.height },
      content: { left: box.left, right: box.right, width: box.width, bottom: box.bottom },
      button: { left: button.left, right: button.right, top: button.top, bottom: button.bottom },
      titleAlign: getComputedStyle(title).textAlign,
      titleWeight: parseInt(getComputedStyle(title).fontWeight, 10),
      contentAlign: getComputedStyle(content).textAlign,
    };
  });

  expect(metrics.card.left).toBeLessThanOrEqual(1);
  expect(metrics.card.top).toBeLessThanOrEqual(1);
  expect(metrics.card.right).toBeGreaterThanOrEqual(metrics.viewport.width - 1);
  expect(metrics.card.bottom).toBeGreaterThanOrEqual(metrics.viewport.height - 1);
  expect(metrics.art.width).toBeGreaterThanOrEqual(metrics.viewport.width - 1);
  expect(metrics.art.height).toBeGreaterThanOrEqual(metrics.viewport.height - 1);
  expect(metrics.content.left).toBeLessThanOrEqual(metrics.card.left + metrics.card.width * .15);
  expect(metrics.content.right).toBeLessThanOrEqual(metrics.card.left + metrics.card.width * .58);
  expect(metrics.titleAlign).toBe('left');
  expect(metrics.contentAlign).toBe('left');
  expect(metrics.titleWeight).toBeGreaterThanOrEqual(800);
  expect(metrics.button.left).toBeGreaterThanOrEqual(-1);
  expect(metrics.button.right).toBeLessThanOrEqual(metrics.viewport.width + 1);

  const tiles = await page.locator('.kids3-catalog-tile').evaluateAll(nodes => nodes.map(node => {
    const r = node.getBoundingClientRect();
    return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
  }));
  for (const tile of tiles) {
    expect(tile.left).toBeGreaterThanOrEqual(-1);
    expect(tile.right).toBeLessThanOrEqual(metrics.viewport.width + 1);
    expect(tile.top).toBeGreaterThanOrEqual(-1);
    expect(tile.bottom).toBeLessThanOrEqual(metrics.viewport.height + 1);
    expect(metrics.content.bottom).toBeLessThanOrEqual(tile.top + 8);
  }

  await page.getByRole('button', { name: /destacar o cofre das senhas/i }).click();
  await expect(page.getByRole('button', { name: /jogar o cofre das senhas/i })).toBeVisible();
  await expect(card).toContainText(/o cofre das senhas/i);
});

test('two-story streaming catalog remains fully usable on a phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/pt/');

  const card = page.locator('.kids3-game-card');
  await expect(card).toHaveCount(1);
  await expect(card).toContainText(/a foto que contava demais/i);
  await expect(page.locator('.kids3-catalog-tile')).toHaveCount(2);

  const overflow = await page.evaluate(() => ({
    width: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
    height: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
    viewportWidth: innerWidth,
    viewportHeight: innerHeight,
  }));
  expect(overflow.width).toBeLessThanOrEqual(overflow.viewportWidth + 1);
  expect(overflow.height).toBeLessThanOrEqual(overflow.viewportHeight + 1);

  const elements = await page.locator('.kids3-game-card > div, .kids3-catalog-tile').evaluateAll(nodes => nodes.map(node => {
    const r = node.getBoundingClientRect();
    return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
  }));
  for (const rect of elements) {
    expect(rect.left).toBeGreaterThanOrEqual(-1);
    expect(rect.right).toBeLessThanOrEqual(overflow.viewportWidth + 1);
    expect(rect.top).toBeGreaterThanOrEqual(-1);
    expect(rect.bottom).toBeLessThanOrEqual(overflow.viewportHeight + 1);
  }

  await page.getByRole('button', { name: /destacar o cofre das senhas/i }).click();
  await expect(page.getByRole('button', { name: /jogar o cofre das senhas/i })).toBeVisible();
});
