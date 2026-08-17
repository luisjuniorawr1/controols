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

  const activeScreen = page.locator('main.kids3-root > section:visible').first();
  await expect(activeScreen).toBeVisible();
  const screenBox = await activeScreen.boundingBox();
  expect(screenBox).not.toBeNull();
  expect(screenBox!.x).toBeGreaterThanOrEqual(-1);
  expect(screenBox!.y).toBeGreaterThanOrEqual(-1);
  expect(screenBox!.x + screenBox!.width).toBeLessThanOrEqual(metrics.innerWidth + 1);
  expect(screenBox!.y + screenBox!.height).toBeLessThanOrEqual(metrics.innerHeight + 1);

  const clippedButtons = await page.locator('main.kids3-root button:visible').evaluateAll((buttons) => buttons.flatMap((button) => {
    const rect = button.getBoundingClientRect();
    const clipped = rect.left < -1 || rect.top < -1 || rect.right > window.innerWidth + 1 || rect.bottom > window.innerHeight + 1;
    return clipped ? [button.textContent?.trim() || 'unnamed button'] : [];
  }));
  expect(clippedButtons).toEqual([]);
}

async function expectFullScreenScene(page: Page, screen: string, assetFolder: RegExp) {
  const scene = page.locator(`[data-screen="${screen}"]`);
  await expect(scene).toBeVisible();
  const art = scene.locator('.kids3-scene-art');
  await expect(art).toBeVisible();
  await expect(art).toHaveAttribute('src', assetFolder);
  await expect.poll(async () => art.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThanOrEqual(1600);
  await expect.poll(async () => art.evaluate((img: HTMLImageElement) => img.naturalHeight)).toBeGreaterThanOrEqual(900);

  const geometry = await scene.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    const panel = node.querySelector('.kids3-panel')?.getBoundingClientRect();
    const image = node.querySelector('.kids3-scene-art')?.getBoundingClientRect();
    return {
      scene: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      image: image ? { x: image.x, y: image.y, width: image.width, height: image.height } : null,
      panel: panel ? { x: panel.x, y: panel.y, width: panel.width, height: panel.height } : null,
      border: [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth],
      viewport: { width: innerWidth, height: innerHeight },
    };
  });

  expect(geometry.scene.x).toBeCloseTo(0, 0);
  expect(geometry.scene.y).toBeCloseTo(0, 0);
  expect(geometry.scene.width).toBeGreaterThanOrEqual(geometry.viewport.width - 1);
  expect(geometry.scene.height).toBeGreaterThanOrEqual(geometry.viewport.height - 1);
  expect(geometry.image).not.toBeNull();
  expect(geometry.image!.width).toBeGreaterThanOrEqual(geometry.viewport.width - 1);
  expect(geometry.image!.height).toBeGreaterThanOrEqual(geometry.viewport.height - 1);
  expect(geometry.border).toEqual(['0px', '0px', '0px', '0px']);
  expect(geometry.panel).not.toBeNull();
  expect(geometry.panel!.x).toBeGreaterThan(geometry.viewport.width * .55);
  await expectSingleViewport(page);
}

async function startCase(page: Page, number: '001' | '002') {
  const card = page.getByRole('button', { name: new RegExp(`caso ${number}`, 'i') });
  await expect(card).toBeVisible();
  await card.click();
  await expect(page.locator(`[data-screen="loading-case-00${number === '001' ? '1' : '2'}"]`)).toBeVisible();
  await expect(page.locator('.kids3-loader-card > strong')).toHaveText('100%', { timeout: 20_000 });
}

async function startCaseWithRealClock(page: Page, number: '001' | '002') {
  await startCase(page, number);
  const firstScreen = number === '001' ? 'case001-intro' : 'case002-warning';
  await expect(page.locator(`[data-screen="${firstScreen}"]`)).toBeVisible({ timeout: 5_000 });
}

async function startCaseWithMockClock(page: Page, number: '001' | '002') {
  await page.clock.install();
  await startCase(page, number);
  await page.clock.runFor(800);
  const firstScreen = number === '001' ? 'case001-intro' : 'case002-warning';
  await expect(page.locator(`[data-screen="${firstScreen}"]`)).toBeVisible();
}

test('library shows two games and no character-selection step', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 650 });
  await page.goto('/pt/');
  await expect(page.getByRole('heading', { name: /escolha uma aventura/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /caso 001/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /caso 002/i })).toBeVisible();
  await expect(page.getByText(/escolha seu amigo/i)).toHaveCount(0);
  await expect(page.locator('[data-testid="character-grid"]')).toHaveCount(0);
  await expectSingleViewport(page);
});

test('each game uses its cover as a preload screen before gameplay', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 650 });
  await page.goto('/pt/');
  await startCaseWithRealClock(page, '002');

  const resources = await page.evaluate(() => performance.getEntriesByType('resource').map(entry => entry.name).filter(name => name.includes('/game/assets/case-002/')));
  expect(new Set(resources).size).toBeGreaterThanOrEqual(8);
  await expect(page.locator('.kids3-loader')).toHaveCount(0);
  await expectFullScreenScene(page, 'case002-warning', /\/game\/assets\/case-002\/01_tentativa_senha_fraca\.png$/);
});

test('Case 001 starts directly after preload and keeps the 30-second observation mission', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 650 });
  await page.goto('/pt/');
  await startCaseWithMockClock(page, '001');

  await expect(page.getByRole('heading', { name: /olhe com atenção/i })).toBeVisible();
  await expect(page.locator('.kids3-timer strong')).toHaveText('30');
  const locked = page.getByRole('button', { name: /observe primeiro/i });
  await expect(locked).toBeDisabled();
  await expectFullScreenScene(page, 'case001-intro', /\/game\/assets\/v2-real\/02_luna_mensagem_suspeita\.png$/);

  await page.clock.runFor(31_000);
  await expect(page.getByRole('button', { name: /ver pistas/i })).toBeEnabled();
  await page.getByRole('button', { name: /ver pistas/i }).click();
  await expectFullScreenScene(page, 'case001-clues', /\/game\/assets\/v2-real\/03_maya_pistas\.png$/);
});

test('Case 002 complete flow teaches long unique passwords and secret verification codes', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 650 });
  await page.goto('/pt/');
  await startCaseWithRealClock(page, '002');

  await expectFullScreenScene(page, 'case002-warning', /\/game\/assets\/case-002\/01_tentativa_senha_fraca\.png$/);
  await page.getByRole('button', { name: /descobrir o problema/i }).click();

  await expectFullScreenScene(page, 'case002-weak', /\/game\/assets\/case-002\/02_maya_senhas_fracas\.png$/);
  await page.getByRole('button', { name: /^123456$/ }).click();
  await page.getByRole('button', { name: /fortalecer o cofre/i }).click();

  await expectFullScreenScene(page, 'case002-strong', /\/game\/assets\/case-002\/03_theo_senha_forte\.png$/);
  await page.getByRole('button', { name: /uma frase longa e só minha/i }).click();
  await page.getByRole('button', { name: /próxima pista/i }).click();

  await expectFullScreenScene(page, 'case002-reuse', /\/game\/assets\/case-002\/04_nina_reutilizar_senha\.png$/);
  await page.getByRole('button', { name: /^não$/i }).click();
  await page.getByRole('button', { name: /continuar/i }).click();

  await expectFullScreenScene(page, 'case002-code', /\/game\/assets\/case-002\/05_caio_codigo_secreto\.png$/);
  await page.getByRole('button', { name: /não compartilhar/i }).click();
  await page.getByRole('button', { name: /montar a chave/i }).click();

  await expectFullScreenScene(page, 'case002-key', /\/game\/assets\/case-002\/06_luna_chave_mestra\.png$/);
  await page.getByRole('button', { name: /usar uma senha longa/i }).click();
  await page.getByRole('button', { name: /uma senha diferente em cada conta/i }).click();
  await page.getByRole('button', { name: /manter códigos de verificação em segredo/i }).click();
  await page.getByRole('button', { name: /testar a chave/i }).click();
  await page.getByRole('button', { name: /abrir o resultado/i }).click();

  await expect(page.getByRole('heading', { name: /missão cumprida/i })).toBeVisible();
  await expectFullScreenScene(page, 'case002-ending', /\/game\/assets\/case-002\/07_final_cofre_protegido\.png$/);
});

test('Case 001 can still be completed without choosing a character', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 650 });
  await page.goto('/pt/');
  await startCaseWithMockClock(page, '001');
  await page.clock.runFor(31_000);
  await page.getByRole('button', { name: /ver pistas/i }).click();
  await page.getByRole('button', { name: /link estranho/i }).click();
  await page.getByRole('button', { name: /muita pressa/i }).click();
  await page.getByRole('button', { name: /^conferir$/i }).click();
  await page.getByRole('button', { name: /próxima missão/i }).click();
  await page.getByRole('button', { name: /^não$/i }).click();
  await page.getByRole('button', { name: /continuar/i }).click();
  await page.getByRole('button', { name: /abrir o app oficial/i }).click();
  await page.getByRole('button', { name: /juntar respostas/i }).click();
  await page.getByRole('button', { name: 'clubeaurora.com.br', exact: true }).click();
  await page.getByRole('button', { name: /um adulto de confiança/i }).click();
  await page.getByRole('button', { name: /montar escudo/i }).click();
  await page.getByRole('button', { name: /parar antes de clicar/i }).click();
  await page.getByRole('button', { name: /abrir o app ou site oficial/i }).click();
  await page.getByRole('button', { name: /pedir ajuda a um adulto de confiança/i }).click();
  await page.getByRole('button', { name: /ver resultado/i }).click();
  await expect(page.getByRole('heading', { name: /você conseguiu/i })).toBeVisible();
  await expectSingleViewport(page);
});

test('game library also fits a phone viewport without scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/pt/');
  await expect(page.getByRole('button', { name: /caso 001/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /caso 002/i })).toBeVisible();
  await expectSingleViewport(page);
});
