import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CONTROOLS — Um universo de jogos e aventuras',
  description: 'CONTROOLS é um universo de jogos e aventuras para crianças. A turma explora diferentes temas por meio de histórias, desafios e descobertas.',
  alternates: { canonical: 'https://controols.com/' },
  openGraph: {
    title: 'CONTROOLS — Um universo de jogos e aventuras',
    description: 'Jogos, personagens e aventuras que transformam diferentes temas em experiências para descobrir brincando.',
    url: 'https://controols.com/',
    siteName: 'CONTROOLS',
    type: 'website',
  },
};

const characters = [
  { id: 'luna', name: 'Luna', trait: 'Curiosa', copy: 'Sempre quer descobrir o que existe por trás de cada pista.', color: '#f6bd22' },
  { id: 'theo', name: 'Theo', trait: 'Inventor', copy: 'Transforma ideias em experiências, testes e novas possibilidades.', color: '#1ec4c8' },
  { id: 'maya', name: 'Maya', trait: 'Observadora', copy: 'Percebe detalhes que passam despercebidos e conecta as pistas.', color: '#8b5bd9' },
  { id: 'caio', name: 'Caio', trait: 'Corajoso', copy: 'Gosta de desafios e entra de cabeça em cada nova aventura.', color: '#f2643c' },
  { id: 'nina', name: 'Nina', trait: 'Cuidadosa', copy: 'Pensa antes de agir e ajuda a turma a encontrar bons caminhos.', color: '#76ad42' },
] as const;

export default function HomePage() {
  return (
    <main className="marketing-home">
      <header className="marketing-header">
        <a className="marketing-brand" href="#top" aria-label="CONTROOLS"><span>CONTR</span><b>OO</b><span>LS</span></a>
        <nav aria-label="Navegação principal">
          <a href="#projeto">O projeto</a>
          <a href="#turma">A turma</a>
          <a href="#temas">Temas</a>
          <a href="#demo">Demo</a>
        </nav>
        <a className="marketing-header-action" href="#demo">Demo em breve</a>
      </header>

      <section className="marketing-hero" id="top">
        <div className="marketing-hero-copy">
          <span className="marketing-kicker">UM UNIVERSO DE JOGOS E AVENTURAS</span>
          <h1>Aprender pode parecer uma <em>aventura.</em></h1>
          <p>CONTROOLS transforma diferentes temas em histórias para jogar, investigar, experimentar e descobrir junto com uma turma que acompanha cada nova missão.</p>
          <div className="marketing-hero-actions">
            <a className="marketing-button primary" href="#projeto">Conheça o CONTROOLS <span>→</span></a>
            <a className="marketing-button secondary" href="#demo">Demo para pais em breve</a>
          </div>
          <div className="marketing-hero-facts" aria-label="Informações do CONTROOLS">
            <span><b>5</b> personagens fixos</span>
            <span><b>1</b> universo, muitos temas</span>
            <span><b>7–10</b> anos</span>
          </div>
        </div>

        <div className="marketing-cast-stage" aria-label="Turma do CONTROOLS">
          <div className="marketing-orbit orbit-one" />
          <div className="marketing-orbit orbit-two" />
          <img
            className="marketing-hero-lineup"
            src="/game/assets/reference/character-lineup.png"
            alt="Luna, Theo, Maya, Caio e Nina, a turma do CONTROOLS"
          />
          <span className="marketing-stage-badge badge-one">DESCOBRIR</span>
          <span className="marketing-stage-badge badge-two">JOGAR</span>
          <span className="marketing-stage-badge badge-three">APRENDER</span>
        </div>
      </section>

      <section className="marketing-section marketing-project" id="projeto">
        <div className="marketing-section-heading">
          <span className="marketing-kicker">O PROJETO</span>
          <h2>Uma turma. Muitos mundos para explorar.</h2>
          <p>Segurança digital é um dos temas que estamos explorando — não o limite do CONTROOLS. Os mesmos personagens podem viver histórias sobre tecnologia, ciência, cidadania, meio ambiente, finanças, cultura e muitos outros assuntos.</p>
        </div>
        <div className="marketing-principles">
          <article><span>01</span><b>Histórias primeiro</b><p>Cada tema vira uma missão, não uma aula disfarçada.</p></article>
          <article><span>02</span><b>Aprender fazendo</b><p>A criança observa, escolhe, testa e vê as consequências.</p></article>
          <article><span>03</span><b>Um elenco reconhecível</b><p>Luna, Theo, Maya, Caio e Nina continuam os mesmos em todas as aventuras.</p></article>
          <article><span>04</span><b>Universo expansível</b><p>Novos temas podem virar novos mundos sem perder a identidade do CONTROOLS.</p></article>
        </div>
      </section>

      <section className="marketing-section marketing-cast" id="turma">
        <div className="marketing-section-heading split">
          <div><span className="marketing-kicker">CONHEÇA A TURMA</span><h2>Os personagens são a alma do CONTROOLS.</h2></div>
          <p>Rosto, cabelo, roupas, cores e personalidade permanecem consistentes. O mundo muda; a turma continua reconhecível.</p>
        </div>
        <div className="marketing-character-grid">
          {characters.map(character => (
            <article key={character.id} className={`marketing-character-card character-${character.id}`} style={{ '--kid-accent': character.color } as React.CSSProperties}>
              <div className="marketing-character-portrait"><img src={`/game/assets/characters/${character.id}.png`} alt="" /></div>
              <div><small>{character.trait}</small><h3>{character.name}</h3><p>{character.copy}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="marketing-section marketing-worlds" id="temas">
        <div className="marketing-section-heading">
          <span className="marketing-kicker">UM CONTROOLS, VÁRIOS TEMAS</span>
          <h2>O assunto muda. A aventura continua.</h2>
          <p>Os temas abaixo mostram a direção do universo, sem fechar agora quais serão as aventuras definitivas.</p>
        </div>
        <div className="marketing-world-grid">
          <article className="world-card is-live"><span>🛡️</span><small>EM EXPLORAÇÃO</small><h3>Segurança digital</h3><p>Privacidade, golpes, senhas, links e decisões digitais podem virar histórias para investigar e jogar.</p><b>Tema em desenvolvimento</b></article>
          <article className="world-card"><span>🔬</span><small>POSSIBILIDADES</small><h3>Conhecimento & descoberta</h3><p>Ciência, curiosidade, tecnologia e assuntos que convidam a observar, testar e descobrir.</p><b>Universo aberto a novos temas</b></article>
          <article className="world-card"><span>🌎</span><small>POSSIBILIDADES</small><h3>Vida & sociedade</h3><p>Cidadania, meio ambiente, finanças, cultura e outros assuntos que fazem parte da vida real.</p><b>Universo aberto a novos temas</b></article>
        </div>
      </section>

      <section className="marketing-section marketing-demo" id="demo">
        <div className="marketing-section-heading split">
          <div><span className="marketing-kicker">DEMO PARA PAIS E RESPONSÁVEIS</span><h2>Em breve, vai dar para conhecer jogando.</h2></div>
          <p>Antes de apresentar aventuras definitivas, vamos colocar uma demo jogável na página para as famílias entenderem, na prática, como funciona a experiência do CONTROOLS.</p>
        </div>
        <div className="marketing-demo-panel">
          <div className="marketing-demo-copy">
            <span className="marketing-demo-pill">PRÓXIMA NOVIDADE</span>
            <h3>Uma primeira experiência para sentir o formato.</h3>
            <p>A demo vai mostrar como narrativa, escolhas, investigação e os personagens funcionam juntos — sem transformar conceitos ainda em desenvolvimento em aventuras oficiais.</p>
            <button type="button" disabled>Demo em breve</button>
          </div>
          <div className="marketing-demo-preview" aria-hidden="true">
            <div className="marketing-demo-browserbar"><i /><i /><i /><span>controols.com / demo</span></div>
            <div className="marketing-demo-screen">
              <small>CONTROOLS · DEMO</small>
              <strong>Jogar. Escolher. Descobrir.</strong>
              <div className="marketing-demo-steps"><span>01</span><span>02</span><span>03</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="marketing-access" id="acesso">
        <div className="marketing-access-intro">
          <span className="marketing-kicker">PRÓXIMOS PASSOS</span>
          <h2>A demo vem primeiro. O app vem depois.</h2>
          <p>A página será a primeira porta para pais e responsáveis experimentarem o CONTROOLS. Mais adiante, o aplicativo e os convites por código ou QR Code poderão ampliar as formas de acesso.</p>
        </div>
        <div className="marketing-access-grid">
          <article className="marketing-access-card download-card">
            <div className="access-icon">↓</div><small>ANDROID</small><h3>Aplicativo</h3><p>A versão Android faz parte dos próximos passos. O download oficial aparecerá aqui quando estiver pronto para distribuição.</p><button type="button" disabled>Android mais adiante</button>
          </article>
          <article className="marketing-access-card code-card">
            <div className="access-icon">#</div><small>ACESSO POR CONVITE</small><h3>Código ou QR Code</h3><p>Também planejamos formas de liberar experiências para famílias, escolas, eventos e parceiros por meio de convites válidos.</p><div className="marketing-code-demo"><span>K7F4</span><i>—</i><span>P9</span></div><button type="button" disabled>Convites mais adiante</button>
          </article>
        </div>
      </section>

      <footer className="marketing-footer">
        <a className="marketing-brand footer-brand" href="#top" aria-label="CONTROOLS"><span>CONTR</span><b>OO</b><span>LS</span></a>
        <p>Um universo para jogar, descobrir e aprender.</p>
        <small>© 2026 CONTROOLS</small>
      </footer>
    </main>
  );
}
