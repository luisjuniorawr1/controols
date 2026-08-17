import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import HomeHorizontalScroller from './HomeHorizontalScroller';

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
    <main className="marketing-home marketing-home-horizontal">
      <header className="marketing-header marketing-horizontal-header">
        <a className="marketing-brand" href="#top" aria-label="CONTROOLS"><span>CONTR</span><b>OO</b><span>LS</span></a>
        <nav aria-label="Navegação principal">
          <a href="#projeto">O projeto</a>
          <a href="#turma">A turma</a>
          <a href="#temas">Temas</a>
          <a href="#demo">Demo</a>
        </nav>
        <a className="marketing-header-action" href="#demo">Demo em breve</a>
      </header>

      <HomeHorizontalScroller>
        <section className="marketing-horizontal-panel marketing-panel-hero" id="top" data-panel-index="0">
          <div className="marketing-horizontal-inner marketing-hero">
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
              <div className="marketing-hero-lineup-row">
                {characters.map(character => (
                  <img
                    key={character.id}
                    className={`marketing-lineup-kid lineup-${character.id}`}
                    src={`/game/assets/characters/${character.id}.png`}
                    alt={character.name}
                  />
                ))}
              </div>
              <span className="marketing-stage-badge badge-one">DESCOBRIR</span>
              <span className="marketing-stage-badge badge-two">JOGAR</span>
              <span className="marketing-stage-badge badge-three">APRENDER</span>
            </div>
          </div>
        </section>

        <section className="marketing-horizontal-panel marketing-panel-project" id="projeto" data-panel-index="1">
          <div className="marketing-horizontal-inner marketing-horizontal-project-grid">
            <div className="marketing-section-heading">
              <span className="marketing-kicker">O PROJETO</span>
              <h2>Uma turma. Muitos mundos para explorar.</h2>
              <p>Segurança digital é um dos temas que estamos explorando — não o limite do CONTROOLS. O assunto muda, mas os personagens e a forma de aprender brincando continuam.</p>
            </div>
            <div className="marketing-principles marketing-principles-horizontal">
              <article><span>01</span><b>Histórias primeiro</b><p>Cada tema vira uma missão, não uma aula disfarçada.</p></article>
              <article><span>02</span><b>Aprender fazendo</b><p>A criança observa, escolhe, testa e vê consequências.</p></article>
              <article><span>03</span><b>Elenco reconhecível</b><p>A mesma turma acompanha cada mundo e cada descoberta.</p></article>
              <article><span>04</span><b>Universo expansível</b><p>Novos temas entram sem perder a identidade do CONTROOLS.</p></article>
            </div>
          </div>
        </section>

        <section className="marketing-horizontal-panel marketing-panel-cast" id="turma" data-panel-index="2">
          <div className="marketing-horizontal-inner marketing-horizontal-cast-layout">
            <div className="marketing-section-heading">
              <span className="marketing-kicker">CONHEÇA A TURMA</span>
              <h2>Os personagens são a alma do CONTROOLS.</h2>
              <p>O mundo muda; Luna, Theo, Maya, Caio e Nina continuam reconhecíveis.</p>
            </div>
            <div className="marketing-character-grid marketing-character-grid-horizontal">
              {characters.map(character => (
                <article key={character.id} className={`marketing-character-card character-${character.id}`} style={{ '--kid-accent': character.color } as CSSProperties}>
                  <div className="marketing-character-portrait"><img src={`/game/assets/characters/${character.id}.png`} alt="" /></div>
                  <div><small>{character.trait}</small><h3>{character.name}</h3><p>{character.copy}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="marketing-horizontal-panel marketing-panel-worlds" id="temas" data-panel-index="3">
          <div className="marketing-horizontal-inner marketing-horizontal-world-layout">
            <div className="marketing-section-heading">
              <span className="marketing-kicker">UM CONTROOLS, VÁRIOS TEMAS</span>
              <h2>O assunto muda. A aventura continua.</h2>
              <p>O universo está aberto para explorar assuntos diferentes sem definir agora quais serão as aventuras oficiais.</p>
            </div>
            <div className="marketing-world-grid marketing-world-grid-horizontal">
              <article className="world-card is-live"><span>🛡️</span><small>EM EXPLORAÇÃO</small><h3>Segurança digital</h3><p>Privacidade, golpes, senhas, links e decisões digitais.</p><b>Tema em desenvolvimento</b></article>
              <article className="world-card"><span>🔬</span><small>POSSIBILIDADES</small><h3>Conhecimento & descoberta</h3><p>Ciência, curiosidade, tecnologia e assuntos para observar e testar.</p><b>Universo aberto</b></article>
              <article className="world-card"><span>🌎</span><small>POSSIBILIDADES</small><h3>Vida & sociedade</h3><p>Cidadania, meio ambiente, finanças, cultura e vida real.</p><b>Universo aberto</b></article>
            </div>
          </div>
        </section>

        <section className="marketing-horizontal-panel marketing-panel-demo" id="demo" data-panel-index="4">
          <div className="marketing-horizontal-inner marketing-horizontal-demo-layout">
            <div className="marketing-section-heading">
              <span className="marketing-kicker">DEMO PARA PAIS E RESPONSÁVEIS</span>
              <h2>Em breve, vai dar para conhecer jogando.</h2>
              <p>Antes de apresentar aventuras definitivas, vamos colocar uma demo jogável para as famílias entenderem, na prática, como funciona a experiência.</p>
            </div>
            <div className="marketing-demo-panel marketing-demo-panel-horizontal">
              <div className="marketing-demo-copy">
                <span className="marketing-demo-pill">PRÓXIMA NOVIDADE</span>
                <h3>Uma primeira experiência para sentir o formato.</h3>
                <p>Narrativa, escolhas, investigação e os personagens funcionando juntos.</p>
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
          </div>
        </section>

        <section className="marketing-horizontal-panel marketing-panel-next" id="acesso" data-panel-index="5">
          <div className="marketing-horizontal-inner marketing-horizontal-next-layout">
            <div className="marketing-access-intro">
              <span className="marketing-kicker">PRÓXIMOS PASSOS</span>
              <h2>A demo vem primeiro. O app vem depois.</h2>
              <p>A página será a primeira porta para pais e responsáveis experimentarem o CONTROOLS. Depois vêm outras formas de acesso.</p>
            </div>
            <div className="marketing-access-grid marketing-access-grid-horizontal">
              <article className="marketing-access-card download-card">
                <div className="access-icon">↓</div><small>ANDROID</small><h3>Aplicativo</h3><p>O download oficial aparece quando a versão Android estiver pronta.</p><button type="button" disabled>Mais adiante</button>
              </article>
              <article className="marketing-access-card code-card">
                <div className="access-icon">#</div><small>ACESSO POR CONVITE</small><h3>Código ou QR Code</h3><p>Convites para famílias, escolas, eventos e parceiros entram depois.</p><div className="marketing-code-demo"><span>K7F4</span><i>—</i><span>P9</span></div><button type="button" disabled>Mais adiante</button>
              </article>
            </div>
            <footer className="marketing-footer marketing-horizontal-footer">
              <a className="marketing-brand footer-brand" href="#top" aria-label="CONTROOLS"><span>CONTR</span><b>OO</b><span>LS</span></a>
              <p>Um universo para jogar, descobrir e aprender.</p>
              <small>© 2026 CONTROOLS</small>
            </footer>
          </div>
        </section>
      </HomeHorizontalScroller>
    </main>
  );
}
