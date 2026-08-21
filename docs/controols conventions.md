# CONTROOLS CONVENTIONS

**Versão:** 1.0  
**Status:** CANÔNICO / OBRIGATÓRIO  
**Escopo:** Todas as histórias, cenas, assets visuais e interações do CONTROOLS  
**Uso:** Este arquivo deve ser citado como referência obrigatória antes de criar, revisar ou aprovar qualquer nova história do CONTROOLS.

---

## 1. Princípio geral

O CONTROOLS é uma experiência **exclusiva para televisão**, baseada em interação corporal por movimentos.

Toda nova história deve respeitar duas fundações imutáveis:

1. **Character Masters** — identidade visual canônica dos personagens.
2. **MexeMundo Motion Foundation** — padrão canônico de tracking e movimentos.

Nenhuma história, asset ou mecânica pode alterar essas fundações para se adaptar a uma cena específica.

> **A história deve se adaptar às fundações. As fundações não devem ser adaptadas à história.**

---

# PARTE I — CHARACTER MASTERS

## 2. Regra principal de identidade visual

Os personagens do CONTROOLS não devem ser recriados, reinterpretados ou redesenhados a cada nova imagem.

Toda geração visual com personagens deve usar os **Character Masters aprovados** como referência visual obrigatória.

### Elenco canônico

| ID canônico | Personagem | Cor principal |
|---|---|---|
| `CTR_LUNA_001` | Luna | Amarelo / azul |
| `CTR_THEO_001` | Theo | Ciano / teal |
| `CTR_MAYA_001` | Maya | Roxo |
| `CTR_CAIO_001` | Caio | Laranja / vermelho |
| `CTR_NINA_001` | Nina | Verde |

---

## 3. Character Masters 2D

As imagens originais individuais do projeto são a base visual canônica inicial:

- `public/game/assets/characters/luna.png`
- `public/game/assets/characters/theo.png`
- `public/game/assets/characters/maya.png`
- `public/game/assets/characters/caio.png`
- `public/game/assets/characters/nina.png`

Esses arquivos representam a identidade-base dos personagens e não devem ser substituídos silenciosamente.

---

## 4. Character Masters 3D

Cada personagem deve possuir também uma versão oficial em 3D.

Estrutura recomendada:

```text
public/game/assets/character-masters/
  luna/
    luna_master_2d.png
    luna_master_3d.png

  theo/
    theo_master_2d.png
    theo_master_3d.png

  maya/
    maya_master_2d.png
    maya_master_3d.png

  caio/
    caio_master_2d.png
    caio_master_3d.png

  nina/
    nina_master_2d.png
    nina_master_3d.png
```

### Regra

- Cena 2D → usar o **Master 2D**.
- Cena 3D → usar o **Master 3D**.
- Cena com vários personagens → usar os masters de **todos os personagens presentes**.

### Regra de elenco

Todas as histórias e Mini Jogos do CONTROOLS devem incluir os cinco personagens canônicos ao longo da experiência:

- Luna (`CTR_LUNA_001`)
- Theo (`CTR_THEO_001`)
- Maya (`CTR_MAYA_001`)
- Caio (`CTR_CAIO_001`)
- Nina (`CTR_NINA_001`)

Um personagem pode assumir o papel de guia ou protagonista de determinada fase, mas o elenco completo deve aparecer de forma reconhecível e relevante no conteúdo.

Não é obrigatório que os cinco estejam presentes em absolutamente todas as telas, porém:

- abertura, desenvolvimento e/ou conclusão devem garantir a presença do elenco completo;
- nenhum personagem deve ser substituído por uma interpretação genérica;
- quando os cinco aparecerem juntos, os cinco Character Masters correspondentes devem estar carregados como referência.

---

## 5. Elementos LOCKED

Os itens abaixo são imutáveis e não podem ser alterados sem criação formal de uma nova versão do personagem:

- formato do rosto;
- formato da cabeça;
- olhos;
- nariz;
- boca;
- cabelo;
- cor do cabelo;
- penteado principal;
- tom de pele;
- idade visual;
- proporções corporais;
- roupa principal;
- calçados;
- acessórios principais;
- paleta principal;
- identidade visual geral.

### Regra de precedência

Se uma nova geração parecer visualmente interessante, mas divergir do Character Master:

> **o Character Master vence.**

---

## 6. Elementos VARIABLE

Podem variar de acordo com a cena:

- pose;
- expressão;
- direção do olhar;
- posição das mãos;
- iluminação;
- enquadramento;
- câmera;
- emoção;
- sujeira;
- chuva;
- vento;
- roupa molhada;
- pequenas deformações naturais causadas pelo movimento.

Essas mudanças nunca podem alterar a identidade-base.

---

## 7. Versionamento

Nenhum Character Master deve ser sobrescrito silenciosamente.

Exemplo:

```text
CTR_LUNA_001
CTR_LUNA_002
CTR_LUNA_003
```

Uma mudança real de aparência exige:

1. nova versão;
2. aprovação explícita;
3. registro do novo ID;
4. definição das histórias/assets que passam a usar a nova versão.

---

## 8. Regra de geração de assets

### PRE-FLIGHT OBRIGATÓRIO

Nenhum asset com personagem pode ser enviado para geração antes de cumprir todos os itens abaixo:

1. classificar o conteúdo como `MINI_GAME` ou `SUPER_ADVENTURE`;
2. abrir e ler este arquivo `controols conventions.md`;
3. identificar nominalmente todos os personagens presentes;
4. carregar como **referências visuais reais** os Character Masters correspondentes;
5. confirmar que o formato visual está correto:
   - Mini Jogo = 2D;
   - Super Aventura = 3D;
6. confirmar que todos os textos visíveis destinados à criança estão em PT-BR;
7. confirmar que a composição é 16:9 para TV;
8. confirmar que UI, cursores e overlays não estão sendo queimados no cenário-base sem necessidade;
9. só então gerar o asset.

> **Um caminho de arquivo, nome de personagem ou descrição textual NÃO substitui a referência visual do Character Master.**

Se os Character Masters necessários não estiverem disponíveis como imagens utilizáveis na geração, o asset deve ser interrompido até que estejam disponíveis.

Antes de gerar qualquer asset:

1. identificar quais personagens aparecem;
2. carregar os Character Masters correspondentes;
3. preservar a identidade;
4. só então definir cenário, câmera, pose e iluminação.

Princípio:

> **CHARACTER FIRST. SCENE SECOND.**

### Fidelidade obrigatória

- O Character Master não pode ser reinterpretado para “combinar melhor” com uma cena.
- Não inventar nova roupa, penteado, proporção, idade visual, rosto, símbolo pessoal ou acessório sem aprovação formal.
- Para Mini Jogos, os arquivos 2D canônicos originais são a referência visual soberana.
- Uma imagem nova que divergir do master deve ser rejeitada, mesmo que tenha boa qualidade estética.
- Assets de cenário devem ser produzidos para a linguagem visual do formato sem redesenhar os personagens.

### Idioma canônico

Todo conteúdo voltado à criança deve ser produzido em **português do Brasil (PT-BR)** como idioma-base do projeto, salvo quando uma localização específica for solicitada.

Isso inclui:

- títulos;
- botões;
- instruções;
- placas relevantes ao gameplay;
- mensagens;
- diálogos;
- feedback;
- textos dentro de telas ou objetos que precisem ser compreendidos pela criança.

Não inserir textos em inglês por padrão.

---

# PARTE II — FORMATOS OFICIAIS DE CONTEÚDO

## 9. Dois formatos canônicos

O CONTROOLS possui dois formatos oficiais de experiência:

1. **MINI JOGOS**
2. **SUPER AVENTURAS**

Eles compartilham a mesma fundação de movimentos do MexeMundo e os mesmos Character Masters, mas possuem linguagens visuais e escopos diferentes.

---

## 10. MINI JOGOS — 2D

Os **Mini Jogos** são experiências curtas, diretas e altamente rejogáveis.

### Linguagem visual obrigatória

- **2D**
- personagens usando exclusivamente os **Character Masters 2D canônicos**
- não criar uma “nova versão 2D” do personagem para o Mini Jogo
- cenas mais simples e legíveis
- elementos interativos grandes
- leitura imediata na TV
- menor complexidade visual
- foco em uma mecânica principal por jogo
- composição em 16:9 apropriada para televisão
- manter UI, cursores, feedbacks e overlays em assets separados sempre que possível, evitando “queimar” a interface dentro da ilustração-base

### Estrutura recomendada

```text
ENTRADA
↓
OBJETIVO RÁPIDO
↓
GAMEPLAY
↓
FEEDBACK
↓
RESULTADO / REJOGAR
```

### Duração canônica

Os **Mini Jogos** devem ser projetados para uma duração-alvo de **até 5 minutos de gameplay ativo**.

Como crianças podem levar mais tempo para observar, compreender uma situação, decidir e executar um movimento, a experiência deve continuar confortável mesmo quando a sessão total chegar naturalmente a **7–8 minutos**.

#### Regra de duração

- **Meta de design:** até 5 minutos.
- **Tolerância natural:** até 7–8 minutos quando houver pausas de raciocínio ou execução.
- Não usar cronômetros agressivos como padrão.
- Nunca apressar a criança apenas para cumprir a duração nominal.
- A progressão deve continuar clara mesmo quando a criança passa mais tempo em uma fase.
- O jogo deve evitar sensação de espera, repetição artificial ou conteúdo inflado apenas para aumentar duração.

> **O limite de 5 minutos orienta o design; não deve virar pressão sobre a criança.**

### Características

- sessões curtas e completas;
- uma mecânica central bem definida;
- progressão em múltiplas rodadas ou fases;
- pequena curva de dificuldade;
- pouca ou nenhuma narrativa longa;
- instruções mínimas;
- resposta visual rápida;
- alto potencial de repetição;
- possibilidade de um desafio final ou clímax curto;
- duração planejada de até 5 minutos, com tolerância de 7–8 minutos.

### Exemplos de mecânicas

- alcançar alvos;
- mover objetos;
- organizar elementos;
- conectar itens;
- desviar;
- escolher zonas;
- distribuir recursos;
- reagir a sinais visuais.

### Regra de produção

> **Mini Jogo = 2D + mecânica direta + rápida compreensão + alta rejogabilidade.**

---

## 11. SUPER AVENTURAS — 3D

As **Super Aventuras** são experiências narrativas maiores, cinematográficas e progressivas.

### Linguagem visual obrigatória

- **3D**
- personagens usando os **Character Masters 3D**
- cenários cinematográficos
- maior profundidade visual
- continuidade entre cenas
- ambientação rica
- narrativa integrada ao gameplay

### Estrutura recomendada

```text
ABERTURA
↓
PROBLEMA
↓
EXPLORAÇÃO
↓
DESAFIOS
↓
CONSEQUÊNCIAS
↓
CLÍMAX
↓
RESOLUÇÃO
```

### Características

- histórias mais longas;
- múltiplas cenas;
- progressão narrativa;
- diferentes interações ao longo da aventura;
- maior presença dos personagens;
- acontecimentos e consequências persistentes;
- sensação de missão completa;
- possibilidade de capítulos.

### Regra de produção

> **Super Aventura = 3D + narrativa + progressão + múltiplas interações + experiência cinematográfica.**

---

## 12. Regra de separação visual

Não misturar linguagens sem justificativa explícita.

### Mini Jogos

Usar:

```text
CHARACTER MASTER 2D
+
CENÁRIO 2D
+
INTERFACE 2D
```

### Super Aventuras

Usar:

```text
CHARACTER MASTER 3D
+
CENÁRIO 3D
+
ILUMINAÇÃO CINEMATOGRÁFICA
```

Uma Super Aventura não deve trocar para personagens 2D no meio da experiência.

Um Mini Jogo não deve apresentar uma versão 3D alternativa dos personagens sem uma decisão formal de produto.

---

## 13. Regra de escopo

Antes de criar qualquer conteúdo novo, classificar obrigatoriamente como:

```text
TYPE: MINI_GAME
```

ou

```text
TYPE: SUPER_ADVENTURE
```

Essa classificação deve ser definida antes de:

- roteiro;
- storyboard;
- geração de assets;
- definição de mecânicas;
- layout;
- programação.

---

## 14. Regra de Character Master por formato

| Formato | Master obrigatório |
|---|---|
| Mini Jogo | Character Master 2D |
| Super Aventura | Character Master 3D |

Se um personagem não possuir ainda um master aprovado para o formato escolhido, o asset não deve avançar para produção final até que o master correspondente seja definido.

---

# PARTE III — CONTROOLS TV

## 9. Plataforma única

O CONTROOLS é um produto **TV-only**.

Não devem ser projetadas versões alternativas para:

- celular;
- tablet;
- desktop;
- mouse;
- toque.

O celular pode funcionar como sensor/câmera quando previsto pela fundação do MexeMundo, mas a experiência principal da criança acontece olhando para a televisão.

---

# PARTE IV — MEXEMUNDO MOTION FOUNDATION

## 10. Fundação imutável

O CONTROOLS deve reutilizar a fundação de movimentos estabelecida no MexeMundo.

O CONTROOLS não deve criar uma segunda lógica própria para:

- tracking corporal;
- suavização;
- filtros;
- calibração;
- normalização das coordenadas;
- interpretação-base dos pulsos e ombros;
- protocolo de pose;
- tolerância de tracking.

O CONTROOLS **consome** essa fundação.

> **Nunca alterar o Motion Foundation para fazer uma história funcionar. Alterar a interação da história.**

---

## 11. Movimentos proibidos

Nenhuma mecânica pode exigir:

- movimentos bruscos;
- golpes rápidos;
- sacudir braços;
- explosões de velocidade;
- movimentos que dependam de alta precisão;
- movimentos que atravessem rapidamente a tela;
- cruzamento dos braços;
- cruzamento das duas mãos;
- mão direita atravessando o corpo para atuar no lado esquerdo;
- mão esquerda atravessando o corpo para atuar no lado direito;
- coreografias complexas;
- movimentos simultâneos difíceis de coordenar.

---

## 12. Regra das zonas das mãos

A interação deve respeitar o espaço natural do corpo.

### Mão esquerda

Opera prioritariamente no lado esquerdo da criança.

### Mão direita

Opera prioritariamente no lado direito da criança.

### Centro

A região central deve funcionar como uma área segura/neutra para:

- confirmação;
- alvos grandes;
- transições;
- feedback;
- ações que não exijam cruzamento dos braços.

Representação conceitual:

```text
┌─────────────────────────────────────────┐
│                                         │
│   ZONA ESQUERDA      ZONA DIREITA       │
│    MÃO ESQUERDA        MÃO DIREITA      │
│                                         │
│          ÁREA CENTRAL SEGURA            │
│                                         │
└─────────────────────────────────────────┘
```

---

## 13. Características dos movimentos

Todo movimento deve ser:

- natural;
- confortável;
- previsível;
- suave;
- suficientemente amplo para ser detectado;
- simples de compreender;
- tolerante a pequenas imprecisões;
- apropriado para crianças.

---

## 14. Ações preferenciais

Priorizar ações já compatíveis com a fundação:

- apontar;
- mover suavemente uma mão;
- manter a mão sobre um alvo;
- levantar uma mão;
- levantar as duas mãos;
- aproximar a mão de um objeto;
- deslocar a mão para cima ou para baixo;
- deslocar suavemente para o lado;
- mover o corpo moderadamente;
- inclinar-se moderadamente;
- posicionar a mão em uma área;
- selecionar por permanência;
- pegar / mover / soltar com movimentos simples.

Evitar reconhecimento complexo de dedos quando uma solução com pulso/mão/corpo resolver a mesma interação.

---

## 15. Uma ação por vez

A experiência não deve exigir sequências motoras complexas.

Preferir:

```text
PEGUE
↓
MOVA
↓
SOLTE
```

Evitar:

```text
SEGURE COM A ESQUERDA
+
GIRE A DIREITA
+
INCLINE O CORPO
+
MANTENHA A POSIÇÃO
```

---

## 16. Tolerância motora

O sistema deve ser generoso.

Usar:

- áreas de interação grandes;
- snap suave;
- magnetismo;
- tolerância de posição;
- tempo suficiente;
- recuperação após perda breve de tracking;
- feedback claro;
- confirmação antes de ações irreversíveis.

A criança não deve ser penalizada por pequenas imperfeições motoras.

---

# PARTE V — FILOSOFIA DE INTERAÇÃO

## 17. Fazer em vez de escolher

Sempre que possível:

> **não perguntar o que a criança faria — permitir que ela faça.**

Evitar que a experiência vire:

```text
A
B
C
```

quando a mesma decisão puder ser representada corporalmente.

Exemplo:

Em vez de:

> Qual lugar deve receber energia?

Fazer:

> Distribua a energia onde ela é mais necessária.

---

## 18. Consequência em vez de “erro”

Sempre que possível, evitar:

- “Resposta errada”;
- bloqueio imediato;
- punição seca.

Preferir:

- reação do mundo;
- consequência visual;
- personagem orientando;
- chance de tentar novamente;
- feedback pedagógico integrado à história.

---

## 19. O cenário é a interface

A imagem não deve ser apenas fundo decorativo.

Sempre que possível, o próprio cenário deve conter:

- alvos;
- objetos manipuláveis;
- zonas de ação;
- personagens reagindo;
- elementos que chamem a atenção;
- feedback visual.

A criança deve sentir:

> **“Eu estou agindo dentro da história.”**

E não:

> **“Estou respondendo uma pergunta sobre a história.”**

---

# PARTE VI — CHECKLIST OBRIGATÓRIO PARA NOVAS HISTÓRIAS

Antes de aprovar qualquer nova história, verificar:

## Character Masters

- [ ] Todos os personagens usam o Character Master correto.
- [ ] Nenhuma feição foi redesenhada.
- [ ] Cabelo, pele, idade e proporções estão consistentes.
- [ ] Roupa e acessórios principais estão corretos.
- [ ] O estilo 2D/3D corresponde ao master adequado.
- [ ] Todos os personagens presentes possuem referência visual carregada.

## Formato do conteúdo

- [ ] O conteúdo foi classificado como `MINI_GAME` ou `SUPER_ADVENTURE`.
- [ ] Mini Jogos estão sendo produzidos em 2D.
- [ ] Super Aventuras estão sendo produzidas em 3D.
- [ ] O Character Master usado corresponde ao formato.
- [ ] A linguagem visual não mistura 2D e 3D sem aprovação formal.
- [ ] O Mini Jogo foi desenhado para até 5 minutos de gameplay ativo.
- [ ] O fluxo continua confortável caso a criança leve 7–8 minutos para concluir.
- [ ] Não há pressão de tempo desnecessária para compensar demora de raciocínio ou movimento.

## Motion Foundation

- [ ] A interação usa a fundação do MexeMundo sem alterá-la.
- [ ] Não existem movimentos bruscos.
- [ ] As mãos não precisam se cruzar.
- [ ] A mão esquerda permanece prioritariamente na esquerda.
- [ ] A mão direita permanece prioritariamente na direita.
- [ ] Não exige precisão excessiva.
- [ ] Não exige gestos complexos desnecessários.
- [ ] A criança consegue executar uma ação por vez.
- [ ] Existem zonas de interação suficientemente grandes.
- [ ] Existe tolerância para perda momentânea de tracking.

## UX infantil

- [ ] A ação é compreensível sem longas instruções.
- [ ] A cena reage imediatamente ao movimento.
- [ ] O feedback é visual e claro.
- [ ] O erro é tratado como consequência/aprendizado.
- [ ] A interação parece brincadeira, não prova.
- [ ] Existe motivo para a criança querer continuar.

---

# PARTE VII — REGRA DE REFERÊNCIA PARA PESQUISA E CRIAÇÃO

Ao iniciar qualquer nova história, briefing, roteiro, geração de assets ou revisão do CONTROOLS, usar este arquivo como referência primária.

Prompt de referência recomendado:

> **Leia e siga integralmente `controols conventions.md` antes de propor qualquer história, interação ou asset. Trate todas as regras marcadas como canônicas ou obrigatórias como imutáveis.**

Se houver conflito entre uma ideia nova e este documento:

> **este documento tem precedência.**

---

## Regra final

O CONTROOLS pode inovar livremente em:

- histórias;
- cenários;
- desafios;
- temas;
- consequências;
- missões;
- narrativa;
- ambientação.

Mas deve permanecer consistente em:

1. **identidade visual dos personagens**;
2. **fundação de movimentos do MexeMundo**;
3. **segurança e conforto motor**;
4. **TV como plataforma principal e única**;
5. **Mini Jogos em 2D e Super Aventuras em 3D**.

---

**Documento canônico:** `controols conventions.md`  
**Versão:** 1.0  
**Status:** Obrigatório para produção.
