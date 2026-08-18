from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    p = Path(path)
    text = p.read_text()
    if new in text:
        return
    if old not in text:
        raise RuntimeError(f'pattern not found in {path}: {old[:120]!r}')
    p.write_text(text.replace(old, new, 1))


# src/game/kidsStory.ts
path = Path('src/game/kidsStory.ts')
text = path.read_text()
if "'case-006'" not in text:
    text = text.replace(
        "export type KidsGameId = 'case-002' | 'case-004' | 'case-005';",
        "export type KidsGameId = 'case-002' | 'case-004' | 'case-005' | 'case-006';",
        1,
    )
    story_block = r'''
/**
 * Case 006 teaches children to pause and independently verify urgent messages
 * that appear to come from someone they know.
 */
export const sixthKidsStory = {
  id: 'case-006' as KidsGameId,
  number: '006',
  title: 'A Mensagem que Parecia Verdadeira',
  subtitle: 'Pare, confirme e peça ajuda quando uma mensagem parece estranha.',
  age: '7–10 anos',
  accent: '#ffd45c',
  cover: '/game/assets/case-006/00_capa_a_mensagem_que_parecia_verdadeira.png',
  scenes: {
    warning: '/game/assets/case-006/01_luna_pedido_urgente.png',
    clues: '/game/assets/case-006/02_maya_pistas_da_mensagem.png',
    confirm: '/game/assets/case-006/03_theo_confirmar_por_outro_caminho.png',
    pause: '/game/assets/case-006/04_nina_parar_antes_de_responder.png',
    risk: '/game/assets/case-006/05_caio_pedido_de_compra.png',
    lighthouse: '/game/assets/case-006/06_luna_farol_da_verdade.png',
    ending: '/game/assets/case-006/07_final_pare_confirme_peca_ajuda.png',
  },
} as const;

'''
    marker = "export const kidsGames = [fifthKidsStory, fourthKidsStory, secondKidsStory] as const;"
    if marker not in text:
        raise RuntimeError('kidsGames marker not found')
    text = text.replace(marker, story_block + "export const kidsGames = [sixthKidsStory, fifthKidsStory, fourthKidsStory, secondKidsStory] as const;", 1)
    text = text.replace(
        "export const case005Assets = [fifthKidsStory.cover, ...Object.values(fifthKidsStory.scenes)];",
        "export const case005Assets = [fifthKidsStory.cover, ...Object.values(fifthKidsStory.scenes)];\nexport const case006Assets = [sixthKidsStory.cover, ...Object.values(sixthKidsStory.scenes)];",
        1,
    )
    habits = r'''
export const messageHabits = [
  { id: 'pause', label: 'Parar antes de agir', icon: '⏸️', correct: true },
  { id: 'confirm', label: 'Confirmar por outro caminho', icon: '🔎', correct: true },
  { id: 'adult', label: 'Pedir ajuda a um adulto', icon: '🤝', correct: true },
  { id: 'profile', label: 'Confiar na foto ou na voz', icon: '🖼️', correct: false },
  { id: 'rush', label: 'Responder rápido para não perder tempo', icon: '⚡', correct: false },
] as const;

'''
    text = text.replace('export const playerHabits = [', habits + 'export const playerHabits = [', 1)
    path.write_text(text)


# src/components/KidsStoryPrototype.tsx
path = Path('src/components/KidsStoryPrototype.tsx')
text = path.read_text()
if 'function Case006Game' not in text:
    text = text.replace('  case005Assets,\n', '  case005Assets,\n  case006Assets,\n', 1)
    text = text.replace('  fifthKidsStory,\n', '  fifthKidsStory,\n  sixthKidsStory,\n', 1)
    text = text.replace('  playerHabits,\n', '  playerHabits,\n  messageHabits,\n', 1)
    text = text.replace(
        "type Case005Screen = 'warning' | 'personal' | 'app' | 'limits' | 'pressure' | 'shield' | 'ending';",
        "type Case005Screen = 'warning' | 'personal' | 'app' | 'limits' | 'pressure' | 'shield' | 'ending';\ntype Case006Screen = 'warning' | 'clues' | 'confirm' | 'pause' | 'risk' | 'lighthouse' | 'ending';",
        1,
    )
    text = text.replace("useState<KidsGameId>('case-005');", "useState<KidsGameId>('case-006');", 1)
    text = text.replace(
        "const featuredLabel = featuredId === 'case-005' ? 'NOVA AVENTURA' : featuredId === 'case-002' ? 'HISTÓRIA REFERÊNCIA' : 'AVENTURA CONTROOLS';",
        "const featuredLabel = featuredId === 'case-006' ? 'NOVA AVENTURA' : featuredId === 'case-002' ? 'HISTÓRIA REFERÊNCIA' : 'AVENTURA CONTROOLS';",
        1,
    )
    text = text.replace(
        "<span><small>{story.id === 'case-005' ? 'NOVA' : story.id === 'case-002' ? 'REFERÊNCIA' : 'AVENTURA'}</small><b>{story.title}</b></span>",
        "<span><small>{story.id === 'case-006' ? 'NOVA' : story.id === 'case-002' ? 'REFERÊNCIA' : 'AVENTURA'}</small><b>{story.title}</b></span>",
        1,
    )

    game = r'''
function Case006Game({ onExit }: { onExit: () => void }) {
  const [screen, setScreen] = useState<Case006Screen>('warning');
  const [clueAnswer, setClueAnswer] = useState<'rush' | 'photo' | 'emoji' | null>(null);
  const [confirmAnswer, setConfirmAnswer] = useState<'other' | 'same' | 'profile' | null>(null);
  const [pauseAnswer, setPauseAnswer] = useState<'pause' | 'rush' | null>(null);
  const [riskAnswer, setRiskAnswer] = useState<'adult' | 'buy' | 'details' | null>(null);
  const [habits, setHabits] = useState<string[]>([]);
  const [habitsChecked, setHabitsChecked] = useState(false);
  const lighthouseSuccess = habits.length === 3 && habits.every(id => messageHabits.find(item => item.id === id)?.correct);

  function toggleHabit(id: string) {
    if (habitsChecked) return;
    setHabits(current => current.includes(id) ? current.filter(item => item !== id) : current.length < 3 ? [...current, id] : current);
  }

  function reset() {
    setScreen('warning');
    setClueAnswer(null);
    setConfirmAnswer(null);
    setPauseAnswer(null);
    setRiskAnswer(null);
    setHabits([]);
    setHabitsChecked(false);
  }

  if (screen === 'warning') return (
    <Scene storyTitle={sixthKidsStory.title} src={sixthKidsStory.scenes.warning} alt="Luna recebe uma mensagem urgente que parece vir de alguém conhecido" screen="case006-warning" progress={14}>
      <span className="kids3-tag blue">MENSAGEM URGENTE</span>
      <h1>Tem algo estranho aqui.</h1>
      <p>A mensagem parece conhecida, mas o pedido não parece.</p>
      <div className="kids3-story-chip">💬 <b>Pare antes de obedecer a um pedido inesperado.</b></div>
      <button className="kids3-primary cyan" type="button" onClick={() => setScreen('clues')}>Investigar →</button>
    </Scene>
  );

  if (screen === 'clues') return (
    <Scene storyTitle={sixthKidsStory.title} src={sixthKidsStory.scenes.clues} alt="Maya encontra sinais de pressa, segredo e pedido incomum em uma mensagem" screen="case006-clues" progress={28} compact>
      <span className="kids3-tag blue">PISTA 1</span>
      <h1>Qual pista merece mais atenção?</h1>
      <div className="kids3-choice-grid one">
        <Choice icon="🚨" label="Pede segredo e pressa" selected={clueAnswer === 'rush'} onClick={() => setClueAnswer('rush')} />
        <Choice icon="🖼️" label="Tem uma foto conhecida" selected={clueAnswer === 'photo'} wrong={clueAnswer === 'photo'} onClick={() => setClueAnswer('photo')} />
        <Choice icon="🙂" label="Usa um emoji" selected={clueAnswer === 'emoji'} wrong={clueAnswer === 'emoji'} onClick={() => setClueAnswer('emoji')} />
      </div>
      {clueAnswer && <div className={`kids3-feedback ${clueAnswer === 'rush' ? 'good' : 'hint'}`}><b>{clueAnswer === 'rush' ? 'Boa! 🚨' : 'Olhe para o comportamento.'}</b><p>{clueAnswer === 'rush' ? 'Pressa e segredo podem ser usados para impedir você de conferir.' : 'Foto e emoji podem parecer familiares, mas não provam quem enviou.'}</p></div>}
      {clueAnswer === 'rush' && <button className="kids3-primary cyan" type="button" onClick={() => setScreen('confirm')}>Aprender a confirmar →</button>}
    </Scene>
  );

  if (screen === 'confirm') return (
    <Scene storyTitle={sixthKidsStory.title} src={sixthKidsStory.scenes.confirm} alt="Theo mostra um caminho independente para confirmar uma mensagem suspeita" screen="case006-confirm" progress={42} compact>
      <span className="kids3-tag blue">PISTA 2</span>
      <h1>Como confirmar de verdade?</h1>
      <div className="kids3-choice-grid one">
        <Choice icon="📞" label="Confirmar por outro caminho" selected={confirmAnswer === 'other'} onClick={() => setConfirmAnswer('other')} />
        <Choice icon="💬" label="Perguntar no mesmo chat" selected={confirmAnswer === 'same'} wrong={confirmAnswer === 'same'} onClick={() => setConfirmAnswer('same')} />
        <Choice icon="👤" label="Confiar na foto do perfil" selected={confirmAnswer === 'profile'} wrong={confirmAnswer === 'profile'} onClick={() => setConfirmAnswer('profile')} />
      </div>
      {confirmAnswer && <div className={`kids3-feedback ${confirmAnswer === 'other' ? 'good' : 'hint'}`}><b>{confirmAnswer === 'other' ? 'Isso! 🔎' : 'Use uma segunda rota.'}</b><p>{confirmAnswer === 'other' ? 'Ligue para um contato já salvo, fale pessoalmente ou peça ajuda a um adulto.' : 'O mesmo chat e a foto podem fazer parte da mensagem falsa.'}</p></div>}
      {confirmAnswer === 'other' && <button className="kids3-primary cyan" type="button" onClick={() => setScreen('pause')}>Continuar →</button>}
    </Scene>
  );

  if (screen === 'pause') return (
    <Scene storyTitle={sixthKidsStory.title} src={sixthKidsStory.scenes.pause} alt="Nina usa uma pausa antes de responder a uma mensagem urgente" screen="case006-pause" progress={56} compact>
      <span className="kids3-tag blue">PISTA 3</span>
      <h1>Urgência manda em você?</h1>
      <div className="kids3-choice-grid two">
        <Choice icon="⚡" label="Sim, respondo agora" selected={pauseAnswer === 'rush'} wrong={pauseAnswer === 'rush'} onClick={() => setPauseAnswer('rush')} />
        <Choice icon="⏸️" label="Não. Posso parar e conferir" selected={pauseAnswer === 'pause'} onClick={() => setPauseAnswer('pause')} />
      </div>
      {pauseAnswer && <div className={`kids3-feedback ${pauseAnswer === 'pause' ? 'good' : 'hint'}`}><b>{pauseAnswer === 'pause' ? 'Perfeito. ⏸️' : 'Pressa não decide por você.'}</b><p>Quem está com pressa ainda pode esperar você checar com segurança.</p></div>}
      {pauseAnswer === 'pause' && <button className="kids3-primary cyan" type="button" onClick={() => setScreen('risk')}>Continuar →</button>}
    </Scene>
  );

  if (screen === 'risk') return (
    <Scene storyTitle={sixthKidsStory.title} src={sixthKidsStory.scenes.risk} alt="Caio recebe um pedido inesperado de compra digital em uma mensagem" screen="case006-risk" progress={70} compact>
      <span className="kids3-tag blue">PEDIDO ESTRANHO</span>
      <h1>O pedido parece real. E agora?</h1>
      <div className="kids3-choice-grid one">
        <Choice icon="🤝" label="Parar e chamar um adulto para confirmar" selected={riskAnswer === 'adult'} onClick={() => setRiskAnswer('adult')} />
        <Choice icon="💳" label="Fazer logo para ajudar" selected={riskAnswer === 'buy'} wrong={riskAnswer === 'buy'} onClick={() => setRiskAnswer('buy')} />
        <Choice icon="💬" label="Responder pedindo mais detalhes" selected={riskAnswer === 'details'} wrong={riskAnswer === 'details'} onClick={() => setRiskAnswer('details')} />
      </div>
      {riskAnswer && <div className={`kids3-feedback ${riskAnswer === 'adult' ? 'good' : 'hint'}`}><b>{riskAnswer === 'adult' ? 'Boa escolha! 🛡️' : 'Não aja dentro da pressão.'}</b><p>Pedido de dinheiro ou compra precisa ser confirmado fora da mensagem.</p></div>}
      {riskAnswer === 'adult' && <button className="kids3-primary cyan" type="button" onClick={() => setScreen('lighthouse')}>Acender o farol →</button>}
    </Scene>
  );

  if (screen === 'lighthouse') return (
    <Scene storyTitle={sixthKidsStory.title} src={sixthKidsStory.scenes.lighthouse} alt="Luna monta o Farol da Verdade com três hábitos de segurança" screen="case006-lighthouse" progress={84} compact>
      <span className="kids3-tag blue">FAROL DA VERDADE</span>
      <h1>Escolha 3 hábitos!</h1>
      <div className="kids3-choice-grid one tiny">
        {messageHabits.map(item => <Choice key={item.id} icon={item.icon} label={item.label} selected={habits.includes(item.id)} onClick={() => toggleHabit(item.id)} />)}
      </div>
      <div className="kids3-counter"><b>{habits.length}</b><span>/3 hábitos</span></div>
      {!habitsChecked && <button className="kids3-primary cyan" type="button" disabled={habits.length !== 3} onClick={() => setHabitsChecked(true)}>Acender o Farol 🔦</button>}
      {habitsChecked && !lighthouseSuccess && <div className="kids3-feedback hint"><b>O farol ainda não acendeu.</b><p>Pare, confirme por outro caminho e peça ajuda.</p><button type="button" onClick={() => { setHabits([]); setHabitsChecked(false); }}>Tentar outra vez</button></div>}
      {habitsChecked && lighthouseSuccess && <><div className="kids3-feedback good"><b>Farol aceso! ✨</b></div><button className="kids3-primary cyan" type="button" onClick={() => setScreen('ending')}>Ver o resultado →</button></>}
    </Scene>
  );

  return (
    <Scene storyTitle={sixthKidsStory.title} src={sixthKidsStory.scenes.ending} alt="A turma comemora depois de descobrir a mensagem falsa com o Farol da Verdade" screen="case006-ending" progress={100} compact>
      <span className="kids3-tag blue">MISTÉRIO RESOLVIDO</span>
      <h1>Mensagem desmascarada!</h1>
      <p><b>Pare. Confirme. Peça ajuda.</b></p>
      <div className="kids3-badges"><span>👀<b>Olho atento</b></span><span>⏸️<b>Calma primeiro</b></span><span>🔎<b>Dupla checagem</b></span></div>
      <button className="kids3-primary cyan" type="button" onClick={reset}>Jogar de novo ↻</button>
      <button className="kids3-secondary" type="button" onClick={onExit}>Voltar ao catálogo</button>
    </Scene>
  );
}

'''
    marker = 'export default function KidsStoryPrototype() {'
    if marker not in text:
        raise RuntimeError('component export marker not found')
    text = text.replace(marker, game + marker, 1)
    text = text.replace("const [gameId, setGameId] = useState<KidsGameId>('case-005');", "const [gameId, setGameId] = useState<KidsGameId>('case-006');", 1)
    text = text.replace(
        "const activeStory = gameId === 'case-005' ? fifthKidsStory : gameId === 'case-004' ? fourthKidsStory : secondKidsStory;",
        "const activeStory = gameId === 'case-006' ? sixthKidsStory : gameId === 'case-005' ? fifthKidsStory : gameId === 'case-004' ? fourthKidsStory : secondKidsStory;",
        1,
    )
    text = text.replace(
        "const activeAssets = gameId === 'case-005' ? case005Assets : gameId === 'case-004' ? case004Assets : case002Assets;",
        "const activeAssets = gameId === 'case-006' ? case006Assets : gameId === 'case-005' ? case005Assets : gameId === 'case-004' ? case004Assets : case002Assets;",
        1,
    )
    text = text.replace(
        "{mode === 'playing' && (gameId === 'case-005' ? <Case005Game onExit={exitGame} /> : gameId === 'case-004' ? <Case004Game onExit={exitGame} /> : <Case002Game onExit={exitGame} />)}",
        "{mode === 'playing' && (gameId === 'case-006' ? <Case006Game onExit={exitGame} /> : gameId === 'case-005' ? <Case005Game onExit={exitGame} /> : gameId === 'case-004' ? <Case004Game onExit={exitGame} /> : <Case002Game onExit={exitGame} />)}",
        1,
    )
    path.write_text(text)


# tests/qa-smoke.spec.ts
path = Path('tests/qa-smoke.spec.ts')
text = path.read_text()
if 'async function startCase006' not in text:
    helper = r'''async function startCase006(page: Page) {
  const card = page.getByRole('button', { name: /jogar a mensagem que parecia verdadeira/i });
  await expect(card).toBeVisible();
  await card.click();
  await expect(page.locator('[data-screen="loading-case-006"]')).toBeVisible();
  await expect(page.locator('.kids3-loader-card > strong')).toHaveText('100%', { timeout: 20_000 });
  await expect(page.locator('[data-screen="case006-warning"]')).toBeVisible({ timeout: 5_000 });
}

'''
    text = text.replace('async function startCase005(page: Page) {', helper + 'async function startCase005(page: Page) {', 1)
    text = text.replace(
        "async function startCase005(page: Page) {\n  const card = page.getByRole('button', { name: /jogar o jogador desconhecido/i });",
        "async function startCase005(page: Page) {\n  await page.getByRole('button', { name: /destacar o jogador desconhecido/i }).click();\n  const card = page.getByRole('button', { name: /jogar o jogador desconhecido/i });",
        1,
    )
    text = text.replace("test('library exposes Case 005, Case 004 and the Case 002 reference story'", "test('library exposes Case 006, Case 005, Case 004 and the Case 002 reference story'", 1)
    text = text.replace("await expect(page.getByRole('button', { name: /jogar o jogador desconhecido/i })).toBeVisible();", "await expect(page.getByRole('button', { name: /jogar a mensagem que parecia verdadeira/i })).toBeVisible();", 1)
    text = text.replace("await expect(page.getByRole('button', { name: /destacar o jogador desconhecido/i })).toBeVisible();", "await expect(page.getByRole('button', { name: /destacar a mensagem que parecia verdadeira/i })).toBeVisible();\n  await expect(page.getByRole('button', { name: /destacar o jogador desconhecido/i })).toBeVisible();", 1)
    text = text.replace("await expect(page.locator('.kids3-catalog-tile')).toHaveCount(3);", "await expect(page.locator('.kids3-catalog-tile')).toHaveCount(4);", 1)

    new_tests = r'''
test('Case 006 preloads all eight full-resolution assets before gameplay', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 650 });
  await page.goto('/pt/');
  await startCase006(page);
  const resources = await page.evaluate(() => performance.getEntriesByType('resource').map(entry => entry.name).filter(name => name.includes('/game/assets/case-006/')));
  expect(new Set(resources).size).toBeGreaterThanOrEqual(8);
  await expectFullScreenScene(page, 'case006-warning', /\/game\/assets\/case-006\/01_luna_pedido_urgente\.png$/);
});

test('Case 006 completes the gold-standard seven-beat learning arc', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 650 });
  await page.goto('/pt/');
  await startCase006(page);
  await page.getByRole('button', { name: /investigar/i }).click();
  await expectFullScreenScene(page, 'case006-clues', /02_maya_pistas_da_mensagem\.png$/);
  await page.getByRole('button', { name: /pede segredo e pressa/i }).click();
  await page.getByRole('button', { name: /aprender a confirmar/i }).click();
  await expectFullScreenScene(page, 'case006-confirm', /03_theo_confirmar_por_outro_caminho\.png$/);
  await page.getByRole('button', { name: /confirmar por outro caminho/i }).click();
  await page.getByRole('button', { name: /^continuar →$/i }).click();
  await expectFullScreenScene(page, 'case006-pause', /04_nina_parar_antes_de_responder\.png$/);
  await page.getByRole('button', { name: /não\. posso parar e conferir/i }).click();
  await page.getByRole('button', { name: /^continuar →$/i }).click();
  await expectFullScreenScene(page, 'case006-risk', /05_caio_pedido_de_compra\.png$/);
  await page.getByRole('button', { name: /parar e chamar um adulto para confirmar/i }).click();
  await page.getByRole('button', { name: /acender o farol/i }).click();
  await expectFullScreenScene(page, 'case006-lighthouse', /06_luna_farol_da_verdade\.png$/);
  await page.getByRole('button', { name: /parar antes de agir/i }).click();
  await page.getByRole('button', { name: /confirmar por outro caminho/i }).click();
  await page.getByRole('button', { name: /pedir ajuda a um adulto/i }).click();
  await page.getByRole('button', { name: /acender o farol/i }).click();
  await page.getByRole('button', { name: /ver o resultado/i }).click();
  await expect(page.getByText(/pare\. confirme\. peça ajuda\./i)).toBeVisible();
  await expectFullScreenScene(page, 'case006-ending', /07_final_pare_confirme_peca_ajuda\.png$/);
});

'''
    text = text.replace("test('Case 005 preloads all eight full-resolution assets before gameplay'", new_tests + "test('Case 005 preloads all eight full-resolution assets before gameplay'", 1)
    text = text.replace("test('new library and Case 005 first scene fit a phone viewport without scrolling'", "test('new library and Case 006 first scene fit a phone viewport without scrolling'", 1)
    old_mobile = "await expect(page.getByRole('button', { name: /jogar o jogador desconhecido/i })).toBeVisible();\n  await expectSingleViewport(page);\n\n  await startCase005(page);\n  await expectFullScreenScene(page, 'case005-warning', /\\/game\\/assets\\/case-005\\/01_luna_convite_inesperado\\.png$/);"
    new_mobile = "await expect(page.getByRole('button', { name: /jogar a mensagem que parecia verdadeira/i })).toBeVisible();\n  await expectSingleViewport(page);\n\n  await startCase006(page);\n  await expectFullScreenScene(page, 'case006-warning', /\\/game\\/assets\\/case-006\\/01_luna_pedido_urgente\\.png$/);"
    if old_mobile not in text:
        raise RuntimeError('mobile smoke marker not found')
    text = text.replace(old_mobile, new_mobile, 1)
    path.write_text(text)


# tests/qa-library-card-safe-zone.spec.ts
path = Path('tests/qa-library-card-safe-zone.spec.ts')
text = path.read_text()
if 'four adventure tiles' not in text:
    text = text.replace('plus three adventure tiles', 'plus four adventure tiles')
    text = text.replace('three-story streaming catalog', 'four-story streaming catalog')
    text = text.replace('/o jogador desconhecido/i', '/a mensagem que parecia verdadeira/i', 2)
    text = text.replace("toHaveCount(3)", "toHaveCount(4)")
    path.write_text(text)

print('Case 006 source and QA patches applied')
