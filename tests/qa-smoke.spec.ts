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
    // Streaming rails intentionally keep later cards outside the viewport until the user scrolls.
    // They must not count as page-level clipping as long as their scroll container stays in-bounds.
    if (button.closest('.kids3-catalog-rail')) return [];
    const rect = button.getBoundingClientRect();
    const clipped = rect.left < -1 || rect.top < -1 || rect.right > window.innerWidth + 1 || rect.bottom > window.innerHeight + 1;
    return clipped ? [button.textContent?.trim() || 'unnamed button'] : [];
  }));
  expect(clippedButtons).toEqual([]);
}

async function expectFullScreenScene(page: Page, screen: string, asset: RegExp) {
  const scene = page.locator(`[data-screen="${screen}"]`);
  await expect(scene).toBeVisible();
  const art = scene.locator('.kids3-scene-art');
  await expect(art).toBeVisible();
  await expect(art).toHaveAttribute('src', asset);
  await expect.poll(async () => art.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThanOrEqual(1600);
  await expect.poll(async () => art.evaluate((img: HTMLImageElement) => img.naturalHeight)).toBeGreaterThanOrEqual(900);

  const geometry = await scene.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    const panel = node.querySelector('.kids3-panel')?.getBoundingClientRect();
    const image = node.querySelector('.kids3-scene-art')?.getBoundingClientRect();
    return {
      scene: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      image: image ? { x: image.x, y: image.y, width: image.width, height: image.height } : null,
      panel: panel ? { x: panel.x, y: panel.y, width: panel.width, height: panel.height, right: panel.right, bottom: panel.bottom } : null,
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
  expect(geometry.panel).not.toBeNull();

  if (geometry.viewport.width > 760) {
    expect(geometry.panel!.x).toBeGreaterThan(geometry.viewport.width * .55);
    expect(geometry.panel!.right).toBeGreaterThanOrEqual(geometry.viewport.width - 1);
  } else {
    expect(geometry.panel!.x).toBeGreaterThanOrEqual(-1);
    expect(geometry.panel!.right).toBeLessThanOrEqual(geometry.viewport.width + 1);
    expect(geometry.panel!.bottom).toBeLessThanOrEqual(geometry.viewport.height + 1);
  }
  await expectSingleViewport(page);
}

async function startCase006(page: Page) {
  await page.getByRole('button', { name: /destacar a mensagem que parecia verdadeira/i }).click();
  const card = page.getByRole('button', { name: /jogar a mensagem que parecia verdadeira/i });
  await expect(card).toBeVisible();
  await card.click();
  await expect(page.locator('[data-screen="loading-case-006"]')).toBeVisible();
  await expect(page.locator('.kids3-loader-card > strong')).toHaveText('100%', { timeout: 20_000 });
  await expect(page.locator('[data-screen="case006-warning"]')).toBeVisible({ timeout: 5_000 });
}

async function startCase005(page: Page) {
  await page.getByRole('button', { name: /destacar o jogador desconhecido/i }).click();
  const card = page.getByRole('button', { name: /jogar o jogador desconhecido/i });
  await expect(card).toBeVisible();
  await card.click();
  await expect(page.locator('[data-screen="loading-case-005"]')).toBeVisible();
  await expect(page.locator('.kids3-loader-card > strong')).toHaveText('100%', { timeout: 20_000 });
  await expect(page.locator('[data-screen="case005-warning"]')).toBeVisible({ timeout: 5_000 });
}

async function startCase004(page: Page) {
  await page.getByRole('button', { name: /destacar a foto que contava demais/i }).click();
  const card = page.getByRole('button', { name: /jogar a foto que contava demais/i });
  await expect(card).toBeVisible();
  await card.click();
  await expect(page.locator('[data-screen="loading-case-004"]')).toBeVisible();
  await expect(page.locator('.kids3-loader-card > strong')).toHaveText('100%', { timeout: 20_000 });
  await expect(page.locator('[data-screen="case004-warning"]')).toBeVisible({ timeout: 5_000 });
}

async function startReferenceStory(page: Page) {
  await page.getByRole('button', { name: /destacar o cofre das senhas/i }).click();
  const card = page.getByRole('button', { name: /jogar o cofre das senhas/i });
  await expect(card).toBeVisible();
  await card.click();
  await expect(page.locator('[data-screen="loading-case-002"]')).toBeVisible();
  await expect(page.locator('.kids3-loader-card > strong')).toHaveText('100%', { timeout: 20_000 });
  await expect(page.locator('[data-screen="case002-warning"]')).toBeVisible({ timeout: 5_000 });
}

test('library exposes Super 001, Case 006, Case 005, Case 004 and the Case 002 reference story', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 650 });
  await page.goto('/pt/');

  await expect(page.getByRole('heading', { name: /escolha uma aventura/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /jogar a cidade que ficou no escuro/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /destacar a mensagem que parecia verdadeira/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /destacar o jogador desconhecido/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /destacar a foto que contava demais/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /destacar o cofre das senhas/i })).toBeVisible();
  await expect(page.getByText(/a mensagem misteriosa/i)).toHaveCount(0);
  await expect(page.getByText(/o link fantasma/i)).toHaveCount(0);
  await expect(page.locator('.kids3-game-card')).toHaveCount(1);
  await expect(page.locator('.kids3-catalog-tile')).toHaveCount(5);
  await expectSingleViewport(page);
});


test('Case 006 preloads all eight full-resolution assets before gameplay', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 650 });
  await page.goto('/pt/');
  await startCase006(page);
  const resources = await page.evaluate(() => performance.getEntriesByType('resource').map(entry => entry.name).filter(name => name.includes('/game/assets/case-006/')));
  expect(new Set(resources).size).toBeGreaterThanOrEqual(8);
  await expectFullScreenScene(page, 'case006-warning', /\/game\/assets\/case-006\/01_luna_pedido_urgente\.png$/);
});

test('Case 006 completes the gold-standard seven-beat learning arc', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 650 });
  await page.goto('/pt/');
  await startCase006(page);
  await page.getByRole('button', { name: /investigar/i }).click();
  await expectFullScreenScene(page, 'case006-clues', /02_maya_pistas_da_mensagem\.png$/);
  await page.getByRole('button', { name: /pede segredo e pressa/i }).click();
  await page.getByRole('button', { name: /aprender a confirmar/i }).click();
  await expectFullScreenScene(page, 'case006-confirm', /03_theo_confirmar_por_outro_caminho\.png$/);
  await page.getByRole('button', { name: /confirmar por outro caminho/i }).click();
  await page.getByRole('button', { name: /^continuar →$/i }).click();
  await expectFullScreenScene(page, 'case006-pause', /04_nina_parar_antes_de_responder\.png$/);
  await page.getByRole('button', { name: /não\. posso parar e conferir/i }).click();
  await page.getByRole('button', { name: /^continuar →$/i }).click();
  await expectFullScreenScene(page, 'case006-risk', /05_caio_pedido_de_compra\.png$/);
  await page.getByRole('button', { name: /parar e chamar um adulto para confirmar/i }).click();
  await page.getByRole('button', { name: /acender o farol/i }).click();
  await expectFullScreenScene(page, 'case006-lighthouse', /06_luna_farol_da_verdade\.png$/);
  await page.getByRole('button', { name: /parar antes de agir/i }).click();
  await page.getByRole('button', { name: /confirmar por outro caminho/i }).click();
  await page.getByRole('button', { name: /pedir ajuda a um adulto/i }).click();
  await page.getByRole('button', { name: /acender o farol/i }).click();
  await page.getByRole('button', { name: /ver o resultado/i }).click();
  await expect(page.getByText(/pare\. confirme\. peça ajuda\./i)).toBeVisible();
  await expectFullScreenScene(page, 'case006-ending', /07_final_pare_confirme_peca_ajuda\.png$/);
});

test('Case 005 preloads all eight full-resolution assets before gameplay', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 650 });
  await page.goto('/pt/');
  await startCase005(page);
  const resources = await page.evaluate(() => performance.getEntriesByType('resource').map(entry => entry.name).filter(name => name.includes('/game/assets/case-005/')));
  expect(new Set(resources).size).toBeGreaterThanOrEqual(8);
  await expectFullScreenScene(page, 'case005-warning', /\/game\/assets\/case-005\/01_luna_convite_inesperado\.png$/);
});

test('Case 005 completes the gold-standard seven-beat learning arc', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 650 });
  await page.goto('/pt/');
  await startCase005(page);
  await page.getByRole('button', { name: /observar com calma antes de confiar/i }).click();
  await page.getByRole('button', { name: /ver a próxima mensagem/i }).click();
  await expectFullScreenScene(page, 'case005-personal', /02_maya_informacao_pessoal\.png$/);
  await page.getByRole('button', { name: /prefiro não contar informações pessoais/i }).click();
  await page.getByRole('button', { name: /^continuar →$/i }).click();
  await expectFullScreenScene(page, 'case005-app', /03_theo_mudar_de_aplicativo\.png$/);
  await page.getByRole('button', { name: /ficar no ambiente conhecido e falar com um adulto/i }).click();
  await page.getByRole('button', { name: /próxima pista/i }).click();
  await expectFullScreenScene(page, 'case005-limits', /04_nina_colocar_limites\.png$/);
  await page.getByRole('button', { name: /parar, bloquear se preciso e pedir ajuda/i }).click();
  await page.getByRole('button', { name: /^continuar →$/i }).click();
  await expectFullScreenScene(page, 'case005-pressure', /05_caio_pedido_de_foto\.png$/);
  await page.getByRole('button', { name: /dizer não, parar e avisar um adulto/i }).click();
  await page.getByRole('button', { name: /montar o escudo/i }).click();
  await expectFullScreenScene(page, 'case005-shield', /06_luna_escudo_do_jogador\.png$/);
  await page.getByRole('button', { name: /proteger informações pessoais/i }).click();
  await page.getByRole('button', { name: /não sair do jogo por pressão/i }).click();
  await page.getByRole('button', { name: /pedir ajuda a um adulto/i }).click();
  await page.getByRole('button', { name: /ativar o escudo/i }).click();
  await page.getByRole('button', { name: /terminar a partida/i }).click();
  await expect(page.getByText(/jogue\. proteja\. peça ajuda\./i)).toBeVisible();
  await expectFullScreenScene(page, 'case005-ending', /07_final_jogue_proteja_peca_ajuda\.png$/);
});

test('Case 004 preloads all eight full-resolution assets before gameplay', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 650 });
  await page.goto('/pt/');
  await startCase004(page);

  const resources = await page.evaluate(() => performance.getEntriesByType('resource').map(entry => entry.name).filter(name => name.includes('/game/assets/case-004/')));
  expect(new Set(resources).size).toBeGreaterThanOrEqual(8);
  await expect(page.locator('.kids3-loader')).toHaveCount(0);
  await expectFullScreenScene(page, 'case004-warning', /\/game\/assets\/case-004\/01_luna_foto_conta_demais\.png$/);
});

test('Case 004 completes the gold-standard seven-beat learning arc', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 650 });
  await page.goto('/pt/');
  await startCase004(page);

  await expectFullScreenScene(page, 'case004-warning', /\/game\/assets\/case-004\/01_luna_foto_conta_demais\.png$/);
  await page.getByRole('button', { name: /investigar a foto/i }).click();

  await expectFullScreenScene(page, 'case004-clues', /\/game\/assets\/case-004\/02_maya_pistas_da_foto\.png$/);
  await page.getByRole('button', { name: /o prédio ao fundo/i }).click();
  await page.getByRole('button', { name: /preparar a foto/i }).click();

  await expectFullScreenScene(page, 'case004-principle', /\/game\/assets\/case-004\/03_theo_foto_segura\.png$/);
  await page.getByRole('button', { name: /a que esconde detalhes do lugar/i }).click();
  await page.getByRole('button', { name: /próxima pista/i }).click();

  await expectFullScreenScene(page, 'case004-permission', /\/game\/assets\/case-004\/04_nina_pedir_permissao\.png$/);
  await page.getByRole('button', { name: /perguntar antes de postar/i }).click();
  await page.getByRole('button', { name: /^continuar →$/i }).click();

  await expectFullScreenScene(page, 'case004-risk', /\/game\/assets\/case-004\/05_caio_mensagem_invasiva\.png$/);
  await page.getByRole('button', { name: /não responder e avisar um adulto/i }).click();
  await page.getByRole('button', { name: /montar o escudo/i }).click();

  await expectFullScreenScene(page, 'case004-shield', /\/game\/assets\/case-004\/06_luna_escudo_da_foto\.png$/);
  await page.getByRole('button', { name: /olhar o fundo antes de postar/i }).click();
  await page.getByRole('button', { name: /pedir permissão para quem aparece/i }).click();
  await page.getByRole('button', { name: /esconder localização e informações pessoais/i }).click();
  await page.getByRole('button', { name: /ativar o escudo/i }).click();
  await page.getByRole('button', { name: /ver a foto segura/i }).click();

  await expect(page.getByRole('heading', { name: /missão cumprida/i })).toBeVisible();
  await expect(page.getByText(/olhe\. pergunte\. proteja\./i)).toBeVisible();
  await expectFullScreenScene(page, 'case004-ending', /\/game\/assets\/case-004\/07_final_foto_protegida\.png$/);
});

test('Case 002 still preloads all eight full-resolution assets before gameplay', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 650 });
  await page.goto('/pt/');
  await startReferenceStory(page);

  const resources = await page.evaluate(() => performance.getEntriesByType('resource').map(entry => entry.name).filter(name => name.includes('/game/assets/case-002/')));
  expect(new Set(resources).size).toBeGreaterThanOrEqual(8);
  await expectFullScreenScene(page, 'case002-warning', /\/game\/assets\/case-002\/01_tentativa_senha_fraca\.png$/);
});

test('Case 002 reference story still completes its seven-beat learning arc', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 650 });
  await page.goto('/pt/');
  await startReferenceStory(page);

  await page.getByRole('button', { name: /descobrir o problema/i }).click();
  await page.getByRole('button', { name: /^123456$/ }).click();
  await page.getByRole('button', { name: /fortalecer o cofre/i }).click();
  await page.getByRole('button', { name: /uma frase longa e só minha/i }).click();
  await page.getByRole('button', { name: /próxima pista/i }).click();
  await page.getByRole('button', { name: /^não$/i }).click();
  await page.getByRole('button', { name: /^continuar →$/i }).click();
  await page.getByRole('button', { name: /não compartilhar/i }).click();
  await page.getByRole('button', { name: /montar a chave/i }).click();
  await page.getByRole('button', { name: /usar uma senha longa/i }).click();
  await page.getByRole('button', { name: /uma senha diferente em cada conta/i }).click();
  await page.getByRole('button', { name: /manter códigos de verificação em segredo/i }).click();
  await page.getByRole('button', { name: /testar a chave/i }).click();
  await page.getByRole('button', { name: /abrir o resultado/i }).click();

  await expect(page.getByText(/longa\. única\. secreta\./i)).toBeVisible();
  await expectFullScreenScene(page, 'case002-ending', /\/game\/assets\/case-002\/07_final_cofre_protegido\.png$/);
});

test('five-story library and Case 006 first scene fit a phone viewport without page scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/pt/');
  await expect(page.getByRole('button', { name: /jogar a cidade que ficou no escuro/i })).toBeVisible();
  await expectSingleViewport(page);

  await startCase006(page);
  await expectFullScreenScene(page, 'case006-warning', /\/game\/assets\/case-006\/01_luna_pedido_urgente\.png$/);
});