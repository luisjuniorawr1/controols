import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const repo = 'luisjuniorawr1/controols';
const assets = {
  'public/game/assets/characters/luna.webp': 'b732147f3e7cbde2b708afd1f2b6149819bae0fc',
  'public/game/assets/characters/theo.webp': '1677c718929362b78e371d2546416071d0a96e09',
  'public/game/assets/characters/maya.webp': '7a910ca147ae3226bd966e45f1ad27e1ac49a97d',
  'public/game/assets/characters/caio.webp': 'a7e59ce383cd379fa69cc4f9290de453321045e5',
  'public/game/assets/characters/nina.webp': 'daf6647b9c4d1c7fc30113b018515d74c4901aba',
  'public/game/assets/reference/character-lineup.webp': '519947f3b16cf41aff26ad3454fed7126e4c24b2',
  'public/game/assets/scenes/title-a-mensagem-misteriosa.webp': '83c8d785a590eddfc47b6367aa1c97e6180e7ddd',
  'public/game/assets/scenes/mensagem-suspeita.webp': 'e7402cb6a827cba905d424b68a5c6f6ccead1ffc',
  'public/game/assets/scenes/quadro-de-pistas.webp': '96c1a28f2725a5537069daedb04c03802838ee89',
};

async function downloadBlob(path, sha) {
  const response = await fetch(`https://api.github.com/repos/${repo}/git/blobs/${sha}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'controols-build',
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    },
  });

  if (!response.ok) throw new Error(`Could not fetch ${path}: ${response.status}`);
  const payload = await response.json();
  if (payload.encoding !== 'base64' || !payload.content) throw new Error(`Unexpected blob payload for ${path}`);

  const bytes = Buffer.from(payload.content.replace(/\s/g, ''), 'base64');
  const isWebp = bytes.length > 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  if (!isWebp) throw new Error(`Invalid WebP asset: ${path}`);

  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, bytes);
  console.log(`asset ${path} (${bytes.length} bytes)`);
}

await Promise.all(Object.entries(assets).map(([path, sha]) => downloadBlob(path, sha)));
