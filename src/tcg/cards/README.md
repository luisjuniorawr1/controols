# Catálogo de cartas — contrato de entrada

Este diretório recebe as cartas criadas no processo de game design antes de qualquer arte final.

## Regra principal

A arte nunca é a fonte de verdade da carta.

A fonte de verdade é o objeto `CardDefinition`. A imagem deve apenas representar visualmente os dados já aprovados.

Isso permite:

- rebalancear custo/ATQ/DEF sem reconstruir toda a lógica do jogo;
- gerar cartas visuais a partir de dados consistentes;
- testar a coleção sem arte pronta;
- validar automaticamente ids, custos, raridades e textos;
- localizar o jogo no futuro.

## Identificadores

Use ids estáveis no formato:

```text
SET001-0001
SET001-0002
...
SET001-0200
```

O nome pode mudar durante desenvolvimento. O `id` não deve ser reutilizado para uma carta diferente depois que a carta entrar em produção.

## Exemplo de Controolz

```ts
{
  id: "SET001-0001",
  setId: "SET001",
  collectorNumber: 1,
  name: "Rex-09",
  type: "CONTROOLZ",
  cardClass: "RAGE",
  rarity: "RARE",
  cost: 4,
  attack: 5,
  defense: 4,
  subtype: "Dinossauro Mecânico",
  rulesText: "CONEXÃO — Cause 2 de dano a um Controolz inimigo.",
  archetypes: ["rage-pressure", "connection-damage"],
  effects: [
    {
      trigger: "CONNECTION",
      text: "Cause 2 de dano a um Controolz inimigo.",
      actions: [
        { type: "DEAL_DAMAGE", amount: 2, target: "ENEMY_CONTROOLZ" }
      ]
    }
  ]
}
```

## Exemplo de Comando

```ts
{
  id: "SET001-0149",
  setId: "SET001",
  collectorNumber: 149,
  name: "Sobrecarga",
  type: "COMMAND",
  cardClass: "RAGE",
  rarity: "COMMON",
  cost: 2,
  rulesText: "Um Controolz aliado recebe +3 ATQ neste turno.",
  archetypes: ["rage-pressure"],
  effects: [
    {
      trigger: "COMMAND_RESOLVE",
      text: "Um Controolz aliado recebe +3 ATQ neste turno.",
      actions: [
        {
          type: "MODIFY_ATTACK",
          amount: 3,
          target: "ALLY_CONTROOLZ",
          duration: "TURN"
        }
      ]
    }
  ]
}
```

## Importação das 200 cartas

Quando a planilha/lista criada no Work estiver pronta, converter cada linha para `CardDefinition`.

Campos mínimos para CONTROOLZ:

- Nº;
- Nome;
- Tipo = CONTROOLZ;
- Classe;
- Raridade;
- Custo;
- Ataque;
- Defesa;
- CONEXÃO, se houver;
- DESCONEXÃO, se houver;
- Habilidade/passiva, se houver;
- Arquétipo.

Campos mínimos para COMANDO:

- Nº;
- Nome;
- Tipo = COMMAND;
- Classe;
- Raridade;
- Custo;
- efeito;
- Arquétipo.

## Texto versus implementação

Durante o primeiro passe, `rulesText` e `effects[].text` podem ser preenchidos mesmo que `actions` ainda não esteja implementado.

Antes de uma carta entrar em partida competitiva, todo efeito que altera o estado do jogo precisa possuir implementação estruturada e teste automatizado.

Não execute strings de regra como código.

## Checklist antes de importar um set

- exatamente 200 números de coleção únicos;
- ids únicos;
- custos dentro da faixa aprovada;
- ATQ/DEF presentes apenas em Controolz;
- nenhuma carta marcada como Lendária apenas por ter números maiores;
- efeitos curtos;
- nenhum combo infinito conhecido;
- nenhuma carta que dependa obrigatoriamente de uma única outra carta para funcionar;
- sinergias mono-classe e cartas-ponte entre classes;
- toda mecânica nova registrada nas regras antes de ser usada por muitas cartas.
