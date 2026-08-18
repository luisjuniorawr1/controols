# CONTROOLS — Story Standard

Base oficial: **O Cofre das Senhas**.

Este documento define o padrão narrativo, visual e de interação para novas histórias do CONTROOLS. A referência não é o tema “senhas”; é a forma como O Cofre das Senhas transforma um assunto em uma aventura curta, clara, visual e progressiva.

## 1. O que torna O Cofre das Senhas a referência

A história funciona porque cada tela tem uma única função. A criança sempre entende três coisas rapidamente: o que está acontecendo, o que precisa decidir e por que a resposta importa.

O fluxo não começa com explicação. Começa com um problema visual concreto. Depois alterna observação, escolha, consequência e síntese. Não há cronômetro obrigatório, não há excesso de texto e não há mecânicas novas surgindo sem necessidade.

A aventura inteira cabe em uma estrutura previsível, mas não repetitiva: **capa + 7 cenas**.

## 2. Estrutura obrigatória: capa + 7 batidas

### Capa — promessa da aventura

- Uma imagem forte, legível à distância.
- O conflito principal deve ser reconhecível sem ler texto.
- Deve funcionar como card de catálogo e tela de preload.
- Não colocar UI essencial dentro da própria arte.

### Batida 1 — incidente

Referência: Luna encontra o cofre em risco.

Objetivo: criar urgência e curiosidade, sem testar a criança ainda.

Regras:
- um problema visual claro;
- uma frase curta de contexto;
- um objeto/símbolo memorável ligado ao tema;
- um único botão para começar a investigação.

### Batida 2 — identificar o problema

Referência: Maya identifica a senha óbvia.

Objetivo: fazer a criança reconhecer um exemplo claramente problemático.

Regras:
- 3 opções no máximo;
- uma resposta correta visualmente justificável;
- feedback imediato;
- erro não bloqueia nem pune: apenas orienta a olhar de novo.

### Batida 3 — descobrir o princípio melhor

Referência: Theo apresenta uma frase longa.

Objetivo: sair do exemplo ruim e apresentar o comportamento desejado.

Regras:
- não transformar em aula;
- a escolha correta deve representar uma regra reutilizável;
- explicar em uma frase por que funciona melhor.

### Batida 4 — transferir o princípio

Referência: Nina mostra que não devemos reutilizar a mesma senha.

Objetivo: provar que a criança entendeu a ideia em outro contexto.

Regras:
- pergunta simples, normalmente binária;
- situação visual diferente das cenas anteriores;
- consequência curta e concreta.

### Batida 5 — situação real de risco

Referência: Caio recebe um pedido de código.

Objetivo: colocar a criança diante de uma decisão que parece plausível no mundo real.

Regras:
- 3 ações no máximo;
- uma ação segura inequívoca;
- a resposta deve ensinar comportamento, não vocabulário técnico;
- feedback curto e firme.

### Batida 6 — síntese jogável

Referência: Luna monta a chave mestra com 3 hábitos.

Objetivo: reunir as ideias da aventura antes do final.

Regras:
- selecionar exatamente 3 hábitos/princípios;
- misturar opções corretas e distrações plausíveis;
- permitir tentar de novo sem reiniciar a história;
- usar um objeto temático de “construção” ou “montagem” (chave, mapa, escudo, kit, receita, máquina etc.);
- a criança precisa sentir que está completando algo, não respondendo a uma prova.

### Batida 7 — resolução e recompensa

Referência: cofre protegido e turma reunida.

Objetivo: encerrar emocionalmente a missão e fixar a mensagem principal.

Regras:
- consequência visual positiva e óbvia;
- turma reunida sempre que a composição permitir;
- uma frase-memória de aproximadamente 3 ideias, como “Longa. Única. Secreta.”;
- 3 badges/conquistas curtas;
- botões para jogar de novo e voltar ao catálogo.

## 3. Ritmo de dificuldade

A curva oficial é:

1. **Entender o problema** — sem erro possível.
2. **Reconhecer** — identificar a pista mais evidente.
3. **Escolher o princípio** — distinguir comportamento forte/fraco.
4. **Transferir** — aplicar a ideia em outro cenário.
5. **Decidir sob risco** — escolher uma ação concreta.
6. **Sintetizar** — combinar 3 aprendizados.
7. **Celebrar e memorizar** — nenhuma nova dificuldade.

Não aumentar a dificuldade adicionando texto. A dificuldade deve vir da decisão e da interpretação visual.

## 4. Uso dos personagens

O Cofre das Senhas faz a turma parecer uma equipe porque cada personagem assume uma função natural.

Padrão recomendado:

- **Luna — Curiosa:** abre o mistério e pode retornar na síntese.
- **Maya — Observadora:** encontra pistas, compara ou percebe detalhes.
- **Theo — Inventor:** apresenta uma solução, sistema ou princípio.
- **Nina — Cuidadosa:** demonstra prevenção, rotina ou decisão segura.
- **Caio — Corajoso:** enfrenta a situação de risco/pressão e precisa agir bem.
- **Final:** turma reunida.

Não é obrigatório usar exatamente essa ordem em todas as histórias, mas todos os papéis devem respeitar a personalidade visual e narrativa do personagem. Evitar trocar personagens apenas para “dar espaço” a todos.

## 5. Padrão visual das cenas

### Formato

- Master: **1672 × 941 px**, PNG, 16:9.
- Não reduzir, recomprimir com perda ou substituir por preview.
- A arte precisa funcionar em TV, desktop e mobile recortado por `object-fit: cover`.

### Composição

O padrão do Cofre é obrigatório para novas cenas:

- **55–65% da largura:** personagem, ação, objeto narrativo e cenário.
- **35–45% da direita:** área visualmente calma e reservada para as colunas de interação HTML.
- A safe zone direita é **obrigatória desde a criação da arte**; não deve ser improvisada depois com um painel cobrindo elementos importantes.
- A arte e a interface devem compartilhar a mesma divisão visual: narrativa à esquerda/centro, interação à direita.
- A safe zone deve fazer parte da composição da arte, não ser um vazio artificial.
- Fundo, luz, textura e elementos ambientais podem continuar na safe zone, desde que sejam discretos e não disputem atenção com a interface.
- Evitar rostos, mãos, pistas essenciais, objetos centrais, áreas de leitura e texto baked-in na área do painel.
- Nenhuma informação necessária para acertar uma escolha pode ficar escondida atrás da coluna de interação.

### Direção de arte

- ambiente acolhedor, cinematográfico e legível;
- iluminação e acabamento constantes ao longo de toda a história;
- personagem principal facilmente reconhecível;
- roupas, cabelo, rosto, acessórios e proporções oficiais preservados;
- um foco visual por cena;
- props e cenário devem reforçar a pergunta daquela tela;
- pouco ou nenhum texto dentro da imagem.

### Continuidade

Uma história deve parecer um único episódio. As cenas não podem parecer ilustrações independentes geradas em estilos diferentes.

Manter:
- paleta coerente;
- iluminação coerente;
- mesmo nível de detalhe;
- mesma interpretação dos personagens;
- objetos recorrentes consistentes quando reaparecem.

## 6. Padrão da interface

Cada estado do jogo ocupa **uma única viewport física**. Não existe scroll dentro da aventura.

### Coluna de interação à direita

A História 2 estabelece um contrato de layout: em desktop/TV, a interface principal vive no **lado direito da tela**, enquanto a ilustração mantém personagem e ação à esquerda/centro.

Regras obrigatórias:

- usar uma coluna/painel vertical principal no lado direito;
- ocupar aproximadamente **35–45% da largura** em desktop/TV;
- o painel deve chegar naturalmente à borda direita e pode ocupar toda a altura útil da viewport;
- título, apoio, escolhas, feedback e ação de avanço devem permanecer dentro dessa mesma coluna sempre que possível;
- não espalhar botões sobre a ilustração;
- não colocar escolhas em cima do rosto ou do objeto narrativo;
- manter alinhamento e posição consistentes entre as 7 cenas, para a criança aprender onde olhar e onde tocar;
- a coluna pode mudar sua densidade conforme a cena, mas não deve “pular” de um lado para outro;
- no mobile, o painel pode ocupar uma parcela maior da largura ou reorganizar-se, mas continua sendo o bloco principal de interação e toda a tela deve caber sem scroll.

A coluna direita não é decoração: ela faz parte do modelo de interação do CONTROOLS.

### Painel direito

- um único painel principal;
- largura aproximada de 35–45% no desktop/TV;
- headline grande e pesada;
- uma linha curta de apoio;
- escolhas grandes e tocáveis;
- feedback imediato;
- uma ação primária clara.

### Progresso

Usar 7 etapas com progressão equivalente a:

- 14%
- 28%
- 42%
- 56%
- 70%
- 84%
- 100%

Isso cria uma sensação de avanço constante sem precisar explicar quantidade de fases.

### Escolhas

- no máximo 3 opções quando possível;
- texto curto;
- ícones apenas quando ajudam a leitura;
- resposta errada pode ser marcada em vermelho/alerta, mas nunca humilhar ou encerrar a partida;
- resposta correta libera imediatamente a continuidade.

## 7. Padrão de texto e legibilidade

A criança deve conseguir jogar lendo pouco, **de forma rápida e à distância**. Tipografia não é acabamento; é parte da jogabilidade.

### Tipografia obrigatória

- usar letras **grandes, grossas e de alto contraste**;
- preferir pesos **bold / extra-bold / black** (`font-weight` aproximadamente 800–1000) para títulos, opções e ações importantes;
- evitar fontes finas, delicadas, condensadas demais ou com detalhes difíceis de reconhecer;
- títulos devem dominar visualmente a coluna de interação;
- textos de escolhas precisam ser maiores e mais fortes do que textos secundários;
- não reduzir fonte para “fazer caber”: reduzir o texto, simplificar a frase ou redesenhar o layout;
- nenhuma tela pode resolver excesso de conteúdo usando letra pequena;
- manter espaçamento suficiente entre linhas e controles para leitura sem esforço;
- botões devem ter rótulos grandes, bold e com área de toque confortável.

### Referência de tamanho em desktop/TV

Os valores podem variar com viewport, mas o padrão visual deve permanecer próximo de:

- **headline principal:** aproximadamente 40–60 px;
- **headline compacta:** aproximadamente 36–54 px;
- **texto de apoio:** aproximadamente 18–24 px;
- **rótulo de escolha:** aproximadamente 18–26 px;
- **botão principal:** aproximadamente 18–24 px;
- **metadados/progresso:** nunca tão pequenos a ponto de exigir aproximação da tela.

Em telas menores, usar escalas responsivas mantendo hierarquia forte. O mobile pode reduzir tamanhos, mas **não pode transformar a experiência em uma página de texto miúdo**.

### Headline

Preferir perguntas ou objetivos diretos:
- “Qual senha é fácil de adivinhar?”
- “Qual segredo é melhor?”
- “Pedirem seu código?”

### Feedback

Formato ideal:

**confirmação curta** + **uma frase explicativa**.

Exemplo:
- “Boa! 🛡️”
- “Comprida e difícil de adivinhar é uma ótima ideia.”

### Evitar

- parágrafos;
- texto pequeno para compensar excesso de conteúdo;
- `font-weight` leve em conteúdo infantil essencial;
- muitas linhas dentro de um botão;
- termos técnicos quando existe uma ação simples equivalente;
- moral da história antes da criança experimentar o problema;
- múltiplas instruções no mesmo bloco;
- linguagem escolar como “responda corretamente”, “teste de conhecimento” ou “lição”.

## 8. Padrão de interação

O Cofre funciona porque usa poucas mecânicas e as repete com pequenas variações.

Mecânicas preferidas:
- escolha única entre 2 ou 3 respostas;
- seleção de 3 itens para montar algo;
- feedback + botão de avanço.

Uma nova história não precisa inventar uma nova mecânica para parecer nova. O tema, a situação, os props, os personagens e as decisões é que devem trazer novidade.

## 9. Preload e performance

Cada aventura deve ter exatamente os assets necessários conhecidos antes de começar.

Fluxo:
1. criança escolhe a aventura;
2. capa permanece visível;
3. todas as cenas são pré-carregadas;
4. jogo só inicia quando os masters estão disponíveis;
5. erro de asset oferece “Tentar novamente”.

Não iniciar uma história com imagens carregando durante as decisões.

## 10. Critérios de aprovação de uma nova história

Uma nova aventura só está pronta quando todos estes pontos forem verdadeiros:

- [ ] capa + 7 cenas próprias;
- [ ] todos os masters em 1672 × 941 ou superior mantendo 16:9;
- [ ] identidade oficial dos personagens preservada;
- [ ] safe zone direita de 35–45% planejada na composição das 7 cenas;
- [ ] coluna de interação principal permanece à direita em desktop/TV;
- [ ] nenhuma pista ou elemento narrativo essencial fica atrás do painel direito;
- [ ] headlines grandes e bold em todas as cenas;
- [ ] escolhas e botões usam texto grande, pesado e de alto contraste;
- [ ] nenhum layout reduz tipografia para compensar excesso de conteúdo;
- [ ] uma única ideia principal por tela;
- [ ] curva reconhecer → aplicar → decidir → sintetizar;
- [ ] no máximo 3 opções por decisão, salvo justificativa forte;
- [ ] erros têm feedback útil e retry simples;
- [ ] etapa 6 reúne 3 aprendizados;
- [ ] final contém frase-memória e recompensa;
- [ ] nenhum estado exige scroll;
- [ ] desktop/TV e mobile cabem integralmente na viewport;
- [ ] preload cobre todos os assets;
- [ ] smoke QA percorre a história inteira;
- [ ] QA verifica legibilidade e posicionamento da coluna direita nos viewports suportados;
- [ ] nenhuma arte ou regra de uma história aposentada é reaproveitada como atalho.

## 11. Template para a próxima história

Antes de produzir qualquer imagem, preencher:

**Tema:**

**Título da aventura:**

**Frase curta/subtítulo:**

**Objeto visual central:**

**Batida 1 — incidente / Luna ou personagem de abertura:**

**Batida 2 — identificar o problema / Maya ou observador:**

**Batida 3 — princípio melhor / Theo ou solucionador:**

**Batida 4 — transferência / Nina ou prevenção:**

**Batida 5 — decisão real / Caio ou ação:**

**Batida 6 — síntese de 3 hábitos / objeto de montagem:**

**Batida 7 — resolução:**

**Frase-memória de 3 ideias:**

**3 badges finais:**

**Plano da safe zone direita (35–45%):**

**Headline principal de cada cena (curta, grande e bold):**

**Lista dos 8 arquivos de arte:**

A história só entra em produção visual depois que esse esqueleto estiver coerente. Isso evita gerar artes bonitas para uma narrativa ainda mal resolvida.
