import fs from 'node:fs';
import path from 'node:path';
import { GoogleAuth } from 'google-auth-library';

const files = [
  ['1SoL2XGfFp84CcNzWi7lnypQotY2yN_1-', '00_capa_o_jogador_desconhecido.png'],
  ['11BH8R6yNp4RivMFk_jSJYYQ7k8I3slzD', '01_luna_convite_inesperado.png'],
  ['1BVt_NMX9hAVDct494T58O__jAqsY_l20', '02_maya_informacao_pessoal.png'],
  ['1cB2J_ChlXyQesqm8bCJ_8DZRS2yd86oT', '03_theo_mudar_de_aplicativo.png'],
  ['15R0tr1w8GmAsJ1K3_9j03AEOMITmB11f', '04_nina_colocar_limites.png'],
  ['15hr7nXJnmi2tquegZcQy9k8-P_ap8Ypa', '05_caio_pedido_de_foto.png'],
  ['1uKSQhiuJpa0Ls3cPCBTB_bRSjRbhdXld', '06_luna_escudo_do_jogador.png'],
  ['1gtJ0BTF8SrC0aOIF3XejfWo2NwjAeYMK', '07_final_jogue_proteja_peca_ajuda.png'],
];

const credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
const auth = new GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/drive.readonly'] });
const client = await auth.getClient();
const access = await client.getAccessToken();
const token = typeof access === 'string' ? access : access.token;
if (!token) throw new Error('Could not obtain Google Drive token');

const target = path.join('public', 'game', 'assets', 'case-005');
fs.mkdirSync(target, { recursive: true });
for (const [id, name] of files) {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`${name}: ${response.status} ${await response.text()}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(path.join(target, name), buffer);
  console.log(name, buffer.length);
}
