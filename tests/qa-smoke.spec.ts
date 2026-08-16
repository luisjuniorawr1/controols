import { expect, test, type Page } from '@playwright/test';

async function expectSingleViewport(page: Page) {
  const metrics = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    htmlWidth: document.documentElement.scrollWidth,
    htmlHeight: document.documentElement.scrollHeight,
    bodyWidth: document.body.scrollWidth,
    bodyHeight: document.body.scrollHeight,
  }));

  expect(metrics.htmlWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);
  expect(metrics.bodyWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);
  expect(metrics.htmlHeight).toBeLessThanOrEqual(metrics.innerHeight + 1);
  expect(metrics.bodyHeight).toBeLessThanOrEqual(metrics.innerHeight + 1);

  const activeScreen = page.locator('main.kids-game > section:visible').first();
  await expect(activeScreen).toBeVisible();
  const screenBox = await activeScreen.boundingBox();
  expect(screenBox).not.toBeNull();
  expect(screenBox!.x).toBeGreaterThanOrEqual(-1);
  expect(screenBox!.y).toBeGreaterThanOrEqual(-1);
  expect(screenBox!.x + screenBox!.width).toBeLessThanOrEqual(metrics.innerWidth + 1);
  expect(screenBox!.y + screenBox!.height).toBeLessThanOrEqual(metrics.innerHeight + 1);

  const clippedButtons = await page.locator('main.kids-game button:visible').evaluateAll((buttons) => buttons.flatMap((button) => {
    const rect = button.getBoundingClientRect();
    const clipped = rect.left < -1 || rect.top < -1 || rect.right > window.innerWidth + 1 || rect.bottom > window.innerHeight + 1;
    return clipped ? [button.textContent?.trim() || 'unnamed button'] : [];
  }));
  expect(clippedButtons).toEqual([]);
}

async function expectLargeGuide(page: Page, testId: string, minHeight: number) {
  const guide = page.getByTestId(testId);
  await expect(guide).toBeVisible();
  const box = await guide.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.height).toBeGreaterThanOrEqual(minHeight);
}

test('kids title screen is single-player only and keeps original-resolution artwork', async ({ page }) => {
  await page.goto('/pt/');
  const art = page.getByRole('img', { name: /luna, theo, maya, caio e nina/i });
  await expect(art).toBeVisible();
  await expect(page.getByRole('button', { name: /jogar/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /2 jogadores/i })).toHaveCount(0);
  await expect.poll(async () => art.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThanOrEqual(1600);
  await expect.poll(async () => art.evaluate((img: HTMLImageElement) => img.naturalHeight)).toBeGreaterThanOrEqual(900);
  await expectSingleViewport(page);
});

test('Case 001 uses large bold child-first type and illustrated guides', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/pt/');
  await page.getByRole('button', { name: /jogar/i }).click();
  await page.getByRole('button', { name: /começar/i }).click();

  const heading = page.getByRole('heading', { name: /mensagem estranha/i });
  const action = page.getByRole('button', { name: /ver pistas/i });
  await expect(heading).toBeVisible();
  await expect(action).toBeVisible();

  const type = await heading.evaluate((node) => {
    const style = getComputedStyle(node);
    return { size: parseFloat(style.fontSize), weight: parseInt(style.fontWeight, 10), family: style.fontFamily };
  });
  expect(type.size).toBeGreaterThanOrEqual(34);
  expect(type.weight).toBeGreaterThanOrEqual(900);
  expect(type.family.toLowerCase()).toMatch(/rounded|trebuchet|comic|system/);

  await action.click();
  await page.getByRole('button', { name: /link estranho/i }).click();
  await page.getByRole('button', { name: /muita pressa/i }).click();
  await page.getByRole('button', { name: /^conferir$/i }).click();
  await page.getByRole('button', { name: /próxima pista/i }).click();
  await expect(page.getByRole('img', { name: /theo mostra uma pista/i })).toBeVisible();
  await expectSingleViewport(page);
});

test('story challenges keep characters large and visually fill the TV stage', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 650 });
  await page.goto('/pt/');
  await page.getByRole('button', { name: /jogar/i }).click();
  await page.getByRole('button', { name: /começar/i }).click();
  await page.getByRole('button', { name: /ver pistas/i }).click();
  await page.getByRole('button', { name: /link estranho/i }).click();
  await page.getByRole('button', { name: /muita pressa/i }).click();
  await page.getByRole('button', { name: /^conferir$/i }).click();
  await page.getByRole('button', { name: /próxima pista/i }).click();

  await expectLargeGuide(page, 'theo-guide', 245);
  const theoStage = await page.getByTestId('theo-guide-stage').boundingBox();
  expect(theoStage).not.toBeNull();
  expect(theoStage!.width).toBeGreaterThanOrEqual(300);
  await expect(page.locator('.kids-visual-equation')).toBeVisible();
  await expectSingleViewport(page);

  await page.getByRole('button', { name: /^não$/i }).click();
  await page.getByRole('button', { name: /continuar/i }).click();
  await expectLargeGuide(page, 'nina-guide', 245);
  await expectSingleViewport(page);

  await page.getByRole('button', { name: /abrir o app/i }).click();
  await page.getByRole('button', { name: /juntar pistas/i }).click();
  await expectLargeGuide(page, 'maya-guide', 150);
  await expectLargeGuide(page, 'caio-guide', 150);
  await expect(page.getByTestId('team-guide-stage')).toBeVisible();
  await expectSingleViewport(page);

  await page.getByRole('button', { name: 'clubeaurora.com.br', exact: true }).click();
  await page.getByRole('button', { name: /um adulto de confiança/i }).click();
  await page.getByRole('button', { name: /montar escudo/i }).click();
  await expectLargeGuide(page, 'luna-guide', 245);
  await expectSingleViewport(page);
});

test('solo flow uses full-resolution character and scene masters', async ({ page }) => {
  await page.goto('/pt/');
  await page.getByRole('button', { name: /jogar/i }).click();
  const luna = page.getByRole('img', { name: 'Luna', exact: true });
  await expect(luna).toBeVisible();
  await expect.poll(async () => luna.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThanOrEqual(1100);
  await expect.poll(async () => luna.evaluate((img: HTMLImageElement) => img.naturalHeight)).toBeGreaterThanOrEqual(1400);
  await page.getByRole('button', { name: /começar/i }).click();
  const scene = page.getByRole('img', { name: /mensagem suspeita do clube aurora/i });
  await expect(scene).toBeVisible();
  await expect.poll(async () => scene.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThanOrEqual(1600);
  await expect.poll(async () => scene.evaluate((img: HTMLImageElement) => img.naturalHeight)).toBeGreaterThanOrEqual(900);
  await page.getByRole('button', { name: /ver pistas/i }).click();
  const clues = page.getByRole('img', { name: /quadro colorido com pistas/i });
  await expect(clues).toBeVisible();
  await expect.poll(async () => clues.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThanOrEqual(1600);
  await expect.poll(async () => clues.evaluate((img: HTMLImageElement) => img.naturalHeight)).toBeGreaterThanOrEqual(900);
});

test('mobile character selection always has exactly one active player and no page scroll', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/pt/');
  await page.getByRole('button', { name: /jogar/i }).click();
  const cards = page.getByTestId('character-grid').locator('button');
  await expect(cards).toHaveCount(5);
  await expect(page.getByTestId('character-grid').locator('.is-selected')).toHaveCount(1);
  await page.getByRole('button', { name: /theo/i }).click();
  await expect(page.getByTestId('character-grid').locator('.is-selected')).toHaveCount(1);
  const firstImage = cards.first().locator('img');
  await expect.poll(async () => firstImage.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThanOrEqual(1100);
  await expect.poll(async () => firstImage.evaluate((img: HTMLImageElement) => img.naturalHeight)).toBeGreaterThanOrEqual(1400);
  await expect(page.getByRole('button', { name: /começar/i })).toBeEnabled();
  await expectSingleViewport(page);
});

test('the complete episode fits in one 1280x650 TV-like browser viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 650 });
  await page.goto('/pt/');
  await expectSingleViewport(page);

  await page.getByRole('button', { name: /jogar/i }).click();
  await expectSingleViewport(page);

  await page.getByRole('button', { name: /começar/i }).click();
  await expectSingleViewport(page);

  await page.getByRole('button', { name: /ver pistas/i }).click();
  await expectSingleViewport(page);
  await page.getByRole('button', { name: /link estranho/i }).click();
  await page.getByRole('button', { name: /muita pressa/i }).click();
  await page.getByRole('button', { name: /^conferir$/i }).click();
  await expectSingleViewport(page);
  await page.getByRole('button', { name: /próxima pista/i }).click();

  await page.getByRole('button', { name: /^não$/i }).click();
  await expectSingleViewport(page);
  await page.getByRole('button', { name: /continuar/i }).click();

  await page.getByRole('button', { name: /abrir o app/i }).click();
  await expectSingleViewport(page);
  await page.getByRole('button', { name: /juntar pistas/i }).click();

  await page.getByRole('button', { name: 'clubeaurora.com.br', exact: true }).click();
  await page.getByRole('button', { name: /um adulto de confiança/i }).click();
  await expectSingleViewport(page);
  await page.getByRole('button', { name: /montar escudo/i }).click();

  await page.getByRole('button', { name: /parar antes de clicar/i }).click();
  await page.getByRole('button', { name: /abrir o app ou site oficial/i }).click();
  await page.getByRole('button', { name: /pedir ajuda a um adulto de confiança/i }).click();
  await expectSingleViewport(page);
  await page.getByRole('button', { name: /missão cumprida/i }).click();

  await expect(page.getByRole('heading', { name: /você conseguiu/i })).toBeVisible();
  await expectSingleViewport(page);
});
