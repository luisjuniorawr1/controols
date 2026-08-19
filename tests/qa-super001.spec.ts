import { expect, test, type Page } from '@playwright/test';

async function startSuper001(page: Page) {
  const play = page.getByRole('button', { name: /jogar a cidade que ficou no escuro/i });
  await expect(play).toBeVisible();
  await play.click();
  await expect(page.locator('[data-screen="loading-super-001"]')).toBeVisible();
  await expect(page.locator('.kids3-loader-card > strong')).toHaveText('100%', { timeout: 30_000 });
  await expect(page.locator('[data-screen="super001-blackout"]')).toBeVisible({ timeout: 8_000 });
}

async function expectScene(page: Page, screen: string, asset: RegExp) {
  const scene = page.locator(`[data-screen="${screen}"]`);
  await expect(scene).toBeVisible();
  const art = scene.locator('.kids3-scene-art');
  await expect(art).toHaveAttribute('src', asset);
  await expect.poll(async () => art.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(1672);
  await expect.poll(async () => art.evaluate((img: HTMLImageElement) => img.naturalHeight)).toBe(941);
}

test('Super 001 is the featured adventure and preloads all 17 cinematic masters', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 650 });
  await page.goto('/pt/');

  await expect(page.locator('.kids3-game-card')).toContainText(/super aventura/i);
  await expect(page.locator('.kids3-game-card')).toContainText(/a cidade que ficou no escuro/i);
  await expect(page.locator('.kids3-catalog-tile')).toHaveCount(5);

  await startSuper001(page);
  const resources = await page.evaluate(() => performance
    .getEntriesByType('resource')
    .map(entry => entry.name)
    .filter(name => name.includes('/game/assets/super-001/')));
  expect(new Set(resources).size).toBeGreaterThanOrEqual(17);
  await expectScene(page, 'super001-blackout', /\/game\/assets\/super-001\/01_clubhouse_apagao\.png$/);
});

test('Super 001 completes the full 16-scene learning mission', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1280, height: 650 });
  await page.goto('/pt/');
  await startSuper001(page);

  await page.getByRole('button', { name: /ficar junto e procurar uma luz segura/i }).click();
  await page.getByRole('button', { name: /encontrar uma luz/i }).click();
  await expectScene(page, 'super001-lantern', /02_nina_lanterna\.png$/);

  await page.getByRole('button', { name: /^lanterna$/i }).click();
  await page.getByRole('button', { name: /olhar lá fora/i }).click();
  await expectScene(page, 'super001-cable', /03_nina_fio_caido\.png$/);

  await page.getByRole('button', { name: /manter distância e avisar um adulto/i }).click();
  await page.getByRole('button', { name: /preparar a mochila/i }).click();
  await expectScene(page, 'super001-backpack', /04_nina_mochila\.png$/);

  await page.getByRole('button', { name: /^lanterna$/i }).click();
  await page.getByRole('button', { name: /^água$/i }).click();
  await page.getByRole('button', { name: /rádio ou celular carregado/i }).click();
  await page.getByRole('button', { name: /conferir mochila/i }).click();
  await page.getByRole('button', { name: /investigar a energia/i }).click();
  await expectScene(page, 'super001-map', /05_theo_mapa_energia\.png$/);

  await page.getByRole('button', { name: /procurar a falha/i }).click();
  await expectScene(page, 'super001-interruption', /06_theo_caminho_interrompido\.png$/);
  await page.getByRole('button', { name: /uma rota de energia foi interrompida/i }).click();
  await page.getByRole('button', { name: /ver quem usa energia/i }).click();
  await expectScene(page, 'super001-objects', /07_theo_objetos_energia\.png$/);

  await page.getByRole('button', { name: /^lâmpada$/i }).click();
  await page.getByRole('button', { name: /definir prioridades/i }).click();
  await expectScene(page, 'super001-priorities', /08_maya_mapa_prioridades\.png$/);
  await page.getByRole('button', { name: /escolher prioridades/i }).click();
  await expectScene(page, 'super001-priority-choice', /09_maya_escolha_prioridades\.png$/);

  await page.getByRole('button', { name: /posto de saúde/i }).click();
  await page.getByRole('button', { name: /^cruzamento$/i }).click();
  await page.getByRole('button', { name: /abrigo comunitário/i }).click();
  await page.getByRole('button', { name: /enviar energia/i }).click();
  await page.getByRole('button', { name: /caçar desperdícios/i }).click();
  await expectScene(page, 'super001-waste', /10_caio_caca_desperdicio\.png$/);

  await page.getByRole('button', { name: /aparelho ligado sem ninguém usando/i }).click();
  await page.getByRole('button', { name: /ver a reserva/i }).click();
  await expectScene(page, 'super001-reserve', /11_caio_reserva_energia\.png$/);

  await page.getByRole('button', { name: /guardar parte para necessidades essenciais/i }).click();
  await page.getByRole('button', { name: /olhar a cidade/i }).click();
  await expectScene(page, 'super001-neighborhood', /12_luna_bairro_apagado\.png$/);

  await page.getByRole('button', { name: /reunir a turma/i }).click();
  await expectScene(page, 'super001-team', /13_luna_monte_equipe\.png$/);
  await page.getByRole('button', { name: /juntar habilidades diferentes/i }).click();
  await page.getByRole('button', { name: /montar o plano da luz/i }).click();
  await expectScene(page, 'super001-plan', /14_plano_da_luz\.png$/);

  await page.getByRole('button', { name: /cuidar das pessoas, usar só o necessário e cooperar/i }).click();
  await page.getByRole('button', { name: /acender a cidade/i }).click();
  await expectScene(page, 'super001-lighting', /15_cidade_acendendo\.png$/);

  await page.getByRole('button', { name: /ver o amanhecer/i }).click();
  await expectScene(page, 'super001-ending', /16_final_cidade_iluminada\.png$/);
  await expect(page.getByRole('heading', { name: /a cidade voltou a brilhar/i })).toBeVisible();
  await expect(page.getByText(/segurança\. prioridade\. consciência\. equipe\./i)).toBeVisible();
});

test('Super 001 first scene respects the phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/pt/');
  await startSuper001(page);
  await expectScene(page, 'super001-blackout', /01_clubhouse_apagao\.png$/);

  const overflow = await page.evaluate(() => ({
    width: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
    height: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
    viewportWidth: innerWidth,
    viewportHeight: innerHeight,
  }));
  expect(overflow.width).toBeLessThanOrEqual(overflow.viewportWidth + 1);
  expect(overflow.height).toBeLessThanOrEqual(overflow.viewportHeight + 1);
});