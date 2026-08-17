import { expect, test } from '@playwright/test';

test('Case 002 weak-password clue matches the artwork and centers feedback with options', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 650 });
  await page.goto('/pt/');
  await page.getByRole('button', { name: /caso 002/i }).click();
  await expect(page.locator('.kids3-loader-card > strong')).toHaveText('100%', { timeout: 20_000 });
  await expect(page.locator('[data-screen="case002-warning"]')).toBeVisible({ timeout: 5_000 });
  await page.getByRole('button', { name: /descobrir o problema/i }).click();

  const scene = page.locator('[data-screen="case002-weak"]');
  await expect(scene).toBeVisible();
  await expect(page.getByRole('heading', { name: /qual senha é fácil de adivinhar/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /^123456$/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /bolo com 3 velas/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /3 chaves douradas/i })).toBeVisible();
  await expect(page.getByText(/nuvem salta sobre 4 luas/i)).toHaveCount(0);
  await expect(page.getByText(/pato roxo viaja 27/i)).toHaveCount(0);

  await page.getByRole('button', { name: /bolo com 3 velas/i }).click();
  const feedback = scene.locator('.case002-weak-feedback');
  await expect(feedback).toContainText(/pense nas três pistas da imagem/i);

  const alignment = await scene.evaluate((node) => {
    const options = node.querySelector('.password-options') as HTMLElement | null;
    const note = node.querySelector('.case002-weak-feedback') as HTMLElement | null;
    if (!options || !note) throw new Error('Case 002 clue alignment elements missing');
    const optionRect = options.getBoundingClientRect();
    const noteRect = note.getBoundingClientRect();
    const style = getComputedStyle(note);
    return {
      optionLeft: optionRect.left,
      optionWidth: optionRect.width,
      noteLeft: noteRect.left,
      noteWidth: noteRect.width,
      alignItems: style.alignItems,
      justifyContent: style.justifyContent,
      textAlign: style.textAlign,
      viewportHeight: innerHeight,
      noteBottom: noteRect.bottom,
    };
  });

  expect(Math.abs(alignment.noteLeft - alignment.optionLeft)).toBeLessThanOrEqual(1);
  expect(Math.abs(alignment.noteWidth - alignment.optionWidth)).toBeLessThanOrEqual(1);
  expect(alignment.alignItems).toBe('center');
  expect(alignment.justifyContent).toBe('center');
  expect(alignment.textAlign).toBe('center');
  expect(alignment.noteBottom).toBeLessThanOrEqual(alignment.viewportHeight + 1);
});
