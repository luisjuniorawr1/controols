import { test, expect } from '@playwright/test';

const MP4_BASE64='AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAMtbW9vdgAAAGxtdmhkAAAAAAAAAAAAAAAAAAAD6AAAAfQAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAlh0cmFrAAAAXHRraGQAAAADAAAAAAAAAAAAAAABAAAAAAAAAfQAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAGAAAABAAAAAAAAkZWR0cwAAABxlbHN0AAAAAAAAAAEAAAH0AAAAAAABAAAAAAHQbWRpYQAAACBtZGhkAAAAAAAAAAAAAAAAAAAwAAAAGABVxAAAAAAALWhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZXIAAAABe21pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAATtzdGJsAAAAt3N0c2QAAAAAAAAAAQAAAKdhdmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAGAAQABIAAAASAAAAAAAAAABFUxhdmM2MS4xOS4xMDEgbGlieDI2NAAAAAAAAAAAAAAAGP//AAAALWF2Y0MBQsAK/+EAFmdCwAraGJsBEAAAAwAQAAADAMjxImoBAARozg/IAAAAEHBhc3AAAAABAAAAAQAAABRidHJ0AAAAAAAAKUAAAAAAAAAAGHN0dHMAAAAAAAAAAQAAAAMAAAgAAAAAFHN0c3MAAAAAAAAAAQAAAAEAAAAcc3RzYwAAAAAAAAABAAAAAQAAAAMAAAABAAAAIHN0c3oAAAAAAAAAAAAAAAMAAAKAAAAACgAAAAoAAAAUc3RjbwAAAAAAAAABAAADXQAAAGF1ZHRhAAAAWW1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAALGlsc3QAAAAkqXRvbwAAABxkYXRhAAAAAQAAAABMYXZmNjEuNy4xMDMAAAAIZnJlZQAAApxtZGF0AAACUwYF//9P3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE2NCByMzEwOCAzMWUxOWY5IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAyMyAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTAgcmVmPTEgZGVibG9jaz0wOjA6MCBhbmFseXNlPTA6MCBtZT1kaWEgc3VibWU9MCBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0wIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MCA4eDhkY3Q9MCBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0wIHRocmVhZHM9MSBsb29rYWhlYWRfdGhyZWFkcz0xIHNsaWNlZF90aHJlYWRzPTAgbnI9MCBkZWNpbWF0ZT0xIGludGVybGFjZWQ9MCBibHVyYXlfY29tcGF0PTAgY29uc3RyYWluZWRfaW50cmE9MCBiZnJhbWVzPTAgd2VpZ2h0cD0wIGtleWludD0yNTAga2V5aW50X21pbj02IHNjZW5lY3V0PTAgaW50cmFfcmVmcmVzaD0wIHJjPWNyZiBtYnRyZWU9MCBjcmY9MjMuMCBxY29tcD0wLjYwIHFwbWluPTAgcXBtYXg9NjkgcXBzdGVwPTQgaXBfcmF0aW89MS40MCBhcT0wAIAAAAAlZYiEOhGKAAIxccAAQ8o4AAgFycnJycnXXXXXXXXXXXXXXXXXXgAAAAZBmiASoMwAAAAGQZpAE6DM';

test('066/648 MP4 fixture converts successfully', async ({ page }) => {
  const response=await page.goto('/pt/tools/mp4-to-webm/',{waitUntil:'domcontentloaded'});
  expect(response?.ok(),'MP4 converter: HTTP').toBeTruthy();
  await expect(page.locator('h1')).toBeVisible();
  const description=page.locator('.tool-description').first();
  await expect(description).toBeVisible();
  expect((await description.innerText()).trim().length).toBeGreaterThan(20);
  await expect(page.locator('.runner')).toBeVisible();

  const input=page.locator('.asset-controls input[type=file]').first();
  await expect(input).toBeVisible();
  await input.setInputFiles({name:'qa.mp4',mimeType:'video/mp4',buffer:Buffer.from(MP4_BASE64,'base64')});

  const button=page.locator('.asset-controls button.primary, .asset-controls button.big-action').first();
  await expect(button,'MP4 converter: process button').toBeEnabled({timeout:20_000});
  await button.click();
  await expect(page.locator('.asset-result'),'MP4 converter: asset result').toBeVisible({timeout:85_000});
  const out=(await page.locator('.asset-result').innerText()).trim();
  expect(out,'MP4 converter: asset error').not.toMatch(/^Error:/im);
  expect(out.length,'MP4 converter: empty asset result').toBeGreaterThan(0);
});
