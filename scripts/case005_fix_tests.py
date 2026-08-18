from pathlib import Path

smoke = Path('tests/qa-smoke.spec.ts')
text = smoke.read_text()
text = text.replace("getByRole('button', { name: /continuar/i })", "getByRole('button', { name: /^continuar →$/i })")
smoke.write_text(text)

right = Path('tests/qa-right-panel.spec.ts')
text = right.read_text()
old = "  await page.goto('/pt/');\n  await page.getByRole('button', { name: /jogar a foto que contava demais/i }).click();\n  await expect(page.locator('.kids3-loader-card > strong')).toHaveText('100%', { timeout: 20_000 });\n  const scene = page.locator('[data-screen=\"case004-warning\"]');"
new = "  await page.goto('/pt/');\n  await page.getByRole('button', { name: /destacar a foto que contava demais/i }).click();\n  await page.getByRole('button', { name: /jogar a foto que contava demais/i }).click();\n  await expect(page.locator('.kids3-loader-card > strong')).toHaveText('100%', { timeout: 20_000 });\n  const scene = page.locator('[data-screen=\"case004-warning\"]');"
if old not in text:
    raise SystemExit('Case 004 right-panel marker missing')
right.write_text(text.replace(old, new, 1))
