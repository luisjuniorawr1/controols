# CONTROOLZ — Regras-base do TCG

> Documento vivo da nova fase do CONTROOLZ como TCG digital presencial 1x1.

## 1. Princípio do produto

CONTROOLZ é um jogo de cartas colecionáveis digital feito para duelos presenciais entre duas pessoas, cada uma usando o próprio celular.

A internet mantém coleção, inventário, ranking e estado das partidas; o encontro presencial é parte da experiência. Não existe matchmaking remoto como modo principal do jogo.

## 2. Condição de vitória

Cada jogador é um **Controller** e começa a partida com **20 de SINAL**.

A condição principal de vitória é reduzir o SINAL adversário a `0`.

- `SINAL > 0`: Controller permanece na partida.
- `SINAL <= 0`: conexão perdida; derrota.
- Se efeitos simultâneos levarem os dois Controllers a `0` ou menos, a regra de desempate deve ser definida antes do primeiro beta competitivo. Até lá, o engine deve retornar estado `DRAW_PENDING_RULE` em vez de inventar um vencedor.

## 3. Campo

Cada jogador possui **3 posições de campo**, formando três linhas frente a frente.

```text
ADVERSÁRIO
[ A ] [ B ] [ C ]
  |     |     |
[ A ] [ B ] [ C ]
VOCÊ
```

Uma posição pode conter no máximo 1 Controolz.

Quando um Controolz ataca:

1. se houver um Controolz inimigo na posição oposta, ocorre combate entre os dois;
2. se a posição adversária estiver vazia, o ataque pode atingir diretamente o SINAL do Controller inimigo.

O limite de três posições é intencional: o campo deve ser legível em celular, impedir mesas excessivamente largas e tornar posicionamento parte da estratégia.

## 4. Controolz

Cartas de unidade possuem:

- custo;
- classe;
- raridade;
- Ataque (ATQ);
- Defesa (DEF);
- eventualmente **CONEXÃO**;
- eventualmente **DESCONEXÃO**;
- eventualmente habilidade passiva.

### Defesa como vida da unidade

DEF é a resistência atual do Controolz.

Dano permanece entre turnos.

Exemplo:

- uma unidade `5 ATQ / 4 DEF` sofre 2 de dano;
- passa a permanecer em campo com 2 DEF atual;
- ao chegar a 0 DEF ou menos, é destruída.

DEF não é restaurada automaticamente no início do turno.

## 5. CONEXÃO

**CONEXÃO** é o efeito disparado quando um Controolz entra em campo.

Exemplo:

> CONEXÃO — Cause 2 de dano a um Controolz inimigo.

A carta pode não possuir CONEXÃO.

## 6. DESCONEXÃO

**DESCONEXÃO** é o efeito disparado quando um Controolz é destruído.

Exemplo:

> DESCONEXÃO — Compre 1 carta.

A carta pode não possuir DESCONEXÃO.

Efeitos de DESCONEXÃO devem ser protegidos contra loops infinitos de destruir/retornar/reinvocar.

Quando dois ou mais Controolz são destruídos pelo mesmo evento simultâneo, todos os que já receberam dano letal saem do campo **antes** de qualquer DESCONEXÃO daquele evento ser resolvida. Assim uma DESCONEXÃO não pode salvar retroativamente uma unidade que já foi destruída pelo mesmo combate.

A ordem definitiva para resolver múltiplas DESCONEXÕES simultâneas será formalizada antes do beta competitivo. O protótipo usa ordem determinística: efeitos do Controller ativo primeiro e depois os do adversário.

## 7. COMANDOS

**COMANDO** é o tipo de carta usado no lugar de “feitiço”.

O Controller executa um Comando, resolve seu efeito e, salvo futura palavra-chave específica, a carta não ocupa uma das três posições do campo.

Comandos devem respeitar a identidade mecânica de sua classe. Não devemos criar seis versões da mesma carta apenas mudando cor e nome.

## 8. Energia

Configuração-base inicial de energia por **turno próprio de cada Controller**:

- 1º turno próprio: máximo 1;
- 2º turno próprio: máximo 2;
- 3º turno próprio: máximo 3;
- ...;
- máximo padrão: 7.

Isso significa que o segundo jogador também começa seu primeiro turno próprio com 1 de energia; ele não recebe 2 apenas porque aquele é o segundo turno global da partida.

No início do próprio turno, o jogador recupera sua energia disponível até o máximo atual.

Essa curva fica centralizada em configuração de engine para ser alterada durante playtests sem reescrever cartas.

## 9. Invocação e ataque

Por padrão, um Controolz que entra em campo **não pode atacar no mesmo turno**.

A palavra-chave futura equivalente a ataque imediato será tratada pelo engine como habilidade explícita e não como exceção oculta.

Cada Controolz pode atacar no máximo uma vez por turno, salvo efeito que diga o contrário.

Efeitos de ataque adicional devem possuir limite explícito e nunca permitir cadeia infinita.

## 10. Resolução do combate

O dano entre Controolz é simultâneo.

Exemplo:

- atacante: `5 ATQ / 4 DEF`;
- defensor: `3 ATQ / 5 DEF`;

Após o combate:

- atacante sofre 3;
- defensor sofre 5;
- o defensor chega a 0 e é destruído;
- o atacante permanece com 1 DEF atual.

Se os dois chegarem a 0 DEF ou menos no mesmo combate, ambos são marcados como destruídos e removidos antes das DESCONEXÕES desse combate serem processadas.

### Dano excedente

Dano excedente não atinge o Controller por padrão.

Se uma unidade com 7 ATQ destruir uma unidade com 2 DEF, os 5 pontos restantes são ignorados.

Uma futura palavra-chave de **PERFURAÇÃO** pode permitir que o dano excedente atinja o SINAL adversário.

## 11. Estrutura de turno

Fluxo-base:

1. **RECARGA** — aumenta o máximo de energia quando aplicável e recupera energia disponível;
2. **COMPRA** — compra a carta do turno;
3. **CONTROLE** — jogar Controolz, executar Comandos e realizar ações permitidas;
4. **COMBATE** — declarar ataques;
5. **FIM** — resolver efeitos de fim de turno e passar prioridade.

A primeira versão do engine deve manter essas etapas explícitas para facilitar logs, replay e auditoria antifraude.

## 12. Classes

Classes fundadoras:

- **RAGE** — pressão, dano, risco e agressividade;
- **LOGIC** — planejamento, compra, eficiência e manipulação;
- **WILD** — crescimento, adaptação, cura e permanência;
- **GLITCH** — alteração de regras, transformação e caos controlável;
- **VOID** — sacrifício, descarte, destruição e DESCONEXÃO;
- **PRIME** — proteção, resistência, organização e controle de campo;
- **NEUTRAL** — ferramentas de uso amplo, com poder controlado para não eliminar a identidade das classes.

## 13. Combos

Combos são desejáveis, inclusive entre classes, mas devem obedecer a:

> combo = vantagem estratégica; combo != vitória automática.

Princípios obrigatórios:

- maioria dos combos relevantes: 2 cartas;
- combos de 3 cartas podem produzir jogadas mais fortes;
- nenhuma cadeia infinita;
- nenhuma geração infinita de energia, compra ou dano;
- nenhuma trava permanente que impeça o adversário de jogar;
- cartas devem continuar úteis fora de seu combo ideal;
- combos fortes precisam de janela de vulnerabilidade ou resposta;
- priorizar sinergia orgânica em vez de textos do tipo “se você controlar exatamente a carta X”.

Decks mono-classe e híbridos devem ser competitivamente viáveis por motivos diferentes: consistência e afinidade versus flexibilidade e combinação de ferramentas.

## 14. Ranking mundial

Existe **um único ranking global**, independente de país ou região.

O critério público principal é **porcentagem de vitórias em partidas ranqueadas válidas**.

```text
winRate = wins / rankedCompletedMatches * 100
```

Jogadores precisam atingir um número mínimo de partidas classificatórias antes de aparecer no ranking global. O valor exato será configurável por temporada.

Desempates não alteram a métrica principal; servem apenas para ordenar jogadores com percentual efetivamente igual.

Possíveis desempates, nesta ordem inicial:

1. precisão interna da porcentagem;
2. número de adversários distintos;
3. número de partidas ranqueadas válidas;
4. força histórica dos adversários como critério técnico secundário.

## 15. Recompensas por partidas

Recompensas de coleção baseadas em jogar **não dependem de vitória**.

Metas podem usar partidas completas válidas, por exemplo:

- completar 5 partidas;
- completar 15 partidas;
- completar 30 partidas;
- completar 50 partidas.

Isso reduz o incentivo para jogadores presenciais combinarem resultados para gerar recompensas.

Ranking continua dependendo do resultado; recompensas de participação dependem de conclusão válida.

## 16. Partida válida e antifarming

Uma partida pode ser concluída sem necessariamente contar para metas/ranking caso seja considerada inválida ou suspeita.

O servidor deve registrar sinais como:

- duração;
- número de turnos;
- número de cartas jogadas;
- ações realizadas por ambos;
- desconexões;
- frequência de partidas contra o mesmo adversário;
- repetição de padrões;
- contas recém-criadas relacionadas.

A política antifarming deve limitar progressivamente o valor competitivo/de recompensa de confrontos excessivamente repetidos contra a mesma pessoa sem impedir partidas casuais.

Regras antifraude devem ser servidor-side e auditáveis. O cliente nunca decide sozinho se uma partida é válida.

## 17. Aquisição de cartas

Loop econômico planejado:

```text
anúncio recompensado -> pacote -> cartas -> deck/coleção
                                      |-> repetidas -> moedas -> pacotes
                                      |-> troca entre jogadores
partidas completas -> metas -> pacotes especiais
```

Princípios:

- anúncios recompensados entregam pacotes, sujeitos a limites;
- pacotes possuem conteúdo aleatório;
- pacotes especiais aumentam chances de raridades sem garantir poder competitivo;
- repetidas podem ser mantidas, trocadas ou convertidas em moeda interna;
- raridade colecionável não pode equivaler automaticamente a vantagem competitiva;
- a primeira versão econômica deve permanecer fechada em moeda interna, sem saque em dinheiro real.

As probabilidades finais de drop devem ficar em configuração versionada e não hardcoded em telas.

## 18. Presencialidade

Duelos e transferências de cartas devem poder exigir prova de presença local por mecanismos de sessão, como QR dinâmico de curta duração.

GPS e Bluetooth não devem ser dependências obrigatórias do produto web.

O protocolo de presença será especificado separadamente e precisa impedir que um simples código enviado por mensagem transforme a experiência em partida remota comum.

## 19. Regra de implementação

O servidor é a fonte de verdade para:

- propriedade das cartas;
- abertura de pacotes;
- sorteio;
- moeda;
- decks válidos;
- estado competitivo da partida;
- resultado;
- ranking;
- elegibilidade de recompensa;
- transferências.

O cliente pode prever animações e interações, mas nunca deve conseguir definir sozinho um resultado econômico ou competitivo.
