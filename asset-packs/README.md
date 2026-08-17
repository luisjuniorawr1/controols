# Asset packs

Esta pasta recebe os pacotes binários de arte do CONTROOLS que são expandidos durante o build.

Para o Caso 001, o arquivo esperado é:

`asset-packs/controols-assets-v2.zip`

O ZIP deve conter exatamente a pasta `controols-assets-v2/scenes/` com os oito PNGs mestres 1672×941:

- `01_capa_hub.png`
- `02_luna_mensagem_suspeita.png`
- `03_maya_pistas.png`
- `04_theo_cadeado.png`
- `05_nina_escolhas_seguras.png`
- `06_maya_caio_duas_respostas.png`
- `07_luna_escudo_digital.png`
- `08_final_turma_comemorando.png`

O workflow copia esses PNGs para `public/game/assets/v2-real/` antes do build. Os PNGs são usados em resolução original e não são recomprimidos.
