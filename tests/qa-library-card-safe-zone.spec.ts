import { expect, test } from '@playwright/test';

test('library cards keep title and play action inside the artwork right safe zone', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 650 });
  await page.goto('/pt/');

  const cards = page.locator('.kids3-game-card');
  await expect(cards).toHaveCount(2);

  const metrics = await cards.evaluateAll((nodes) => nodes.map((node) => {
    const card = node as HTMLElement;
    const content = card.querySelector(':scope > div') as HTMLElement | null;
    const title = card.querySelector('h2') as HTMLElement | null;
    const play = card.querySelector(':scope > div > b') as HTMLElement | null;
    if (!content || !title || !play) throw new Error('library card content missing');

    const c = card.getBoundingClientRect();
    const box = content.getBoundingClientRect();
    const button = play.getBoundingClientRect();

    return {
      cardLeft: c.left,
      cardRight: c.right,
      cardWidth: c.width,
      contentLeft: box.left,
      contentRight: box.right,
      buttonRight: button.right,
      titleAlign: getComputedStyle(title).textAlign,
      contentAlign: getComputedStyle(content).textAlign,
    };
  }));

  for (const card of metrics) {
    expect(card.contentLeft).toBeGreaterThanOrEqual(card.cardLeft + card.cardWidth * .54);
    expect(card.contentRight).toBeLessThanOrEqual(card.cardRight - 15);
    expect(Math.abs(card.contentRight - card.buttonRight)).toBeLessThanOrEqual(2);
    expect(card.titleAlign).toBe('right');
    expect(card.contentAlign).toBe('right');
  }
});
