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

const cases = [
  { number: '001', title: 'A Mensagem Misteriosa', copy: 'Pense antes de clicar.', image: '/game/assets/v2-real/01_capa_hub.png' },
  { number: '002', title: 'O Cofre das Senhas', copy: 'Proteja seus segredos digitais.', image: '/game/assets/case-002/00_capa_cofre_das_senhas.png' },
  { number: '003', title: 'O Link Fantasma', copy: 'Nem todo link é o que parece.', image: '/game/assets/case-003/00_capa_link_fantasma.png?v3-20260817' },
] as const;

export default function HomePage() {
  return (
    <main className="marketing-home">
      <header className="marketing-header">
        <a className="marketing-brand" href="#top" aria-label="CONTROOLS"><span>CONTR</span><b>OO</b><span>LS</span></a>
        <nav aria-label="Navegação principal">
          <a href="#projeto">O projeto</a>
          <a href="#turma">A turma</a>
          <a href="#aventuras">Aventuras</a>
          <a href="#acesso">Como jogar</a>
        </nav>
        <a className="marketing-header-action" href="#acesso">Tenho um código</a>
      </header>

      <section className="marketing-hero" id="top">
        <div className="marketing-hero-copy">
          <span className="marketing-kicker">UM UNIVERSO DE JOGOS E AVENTURAS</span>
          <h1>Aprender pode parecer uma <em>aventura.</em></h1>
          <p>CONTROOLS transforma diferentes temas em histórias para jogar, investigar, experimentar e descobrir junto com uma turma que acompanha cada nova missão.</p>
          <div className="marketing-hero-actions">
            <a className="marketing-button primary" href="#projeto">Conheça o CONTROOLS <span>→</span></a>
            <a className="marketing-button secondary" href="#acesso">Baixar para Android</a>
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
          {characters.map((character, index) => (
            <img
              key={character.id}
              className={`marketing-hero-kid kid-${character.id}`}
              src={`/game/assets/characters/${character.id}.png`}
              alt={character.name}
              style={{ zIndex: index === 2 ? 6 : 5 }}
            />
          ))}
          <span className="marketing-stage-badge badge-one">DESCOBRIR</span>
          <span className="marketing-stage-badge badge-two">JOGAR</span>
          <span className="marketing-stage-badge badge-three">APRENDER</span>
        </div>
      </section>

      <section className="marketing-section marketing-project" id="projeto">
        <div className="marketing-section-heading">
          <span className="marketing-kicker">O PROJETO</span>
          <h2>Uma turma. Muitos mundos para explorar.</h2>
          <p>Segurança digital é a nossa primeira coleção — não o limite do CONTROOLS. Os mesmos personagens podem viver aventuras sobre tecnologia, ciência, cidadania, meio ambiente, finanças, cultura e muitos outros assuntos.</p>
        </div>
        <div className="marketing-principles">
          <article><span>01</span><b>Histórias primeiro</b><p>Cada tema vira uma missão, não uma aula disfarçada.</p></article>
          <article><span>02</span><b>Aprender fazendo</b><p>A criança observa, escolhe, testa e vê as consequências.</p></article>
          <article><span>03</span><b>Um elenco reconhecível</b><p>Luna, Theo, Maya, Caio e Nina continuam os mesmos em todas as aventuras.</p></article>
          <article><span>04</span><b>Universo expansível</b><p>Novos temas entram como coleções sem perder a identidade do CONTROOLS.</p></article>
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

      <section className="marketing-section marketing-worlds">
        <div className="marketing-section-heading">
          <span className="marketing-kicker">UM CONTROOLS, VÁRIOS TEMAS</span>
          <h2>Cada coleção abre uma porta nova.</h2>
        </div>
        <div className="marketing-world-grid">
          <article className="world-card is-live"><span>🛡️</span><small>PRIMEIRA COLEÇÃO</small><h3>Segurança digital</h3><p>Golpes, senhas, links, privacidade e decisões seguras em aventuras visuais.</p><b>Já em desenvolvimento</b></article>
          <article className="world-card"><span>🔬</span><small>NOVOS MUNDOS</small><h3>Conhecimento & descoberta</h3><p>Ciência, curiosidade, tecnologia e assuntos que convidam a investigar.</p><b>Universo expansível</b></article>
          <article className="world-card"><span>🌎</span><small>NOVOS MUNDOS</small><h3>Vida & sociedade</h3><p>Cidadania, meio ambiente, finanças, cultura e outros temas da vida real.</p><b>Universo expansível</b></article>
        </div>
      </section>

      <section className="marketing-section marketing-adventures" id="aventuras">
        <div className="marketing-section-heading split">
          <div><span className="marketing-kicker">COLEÇÃO 01 · SEGURANÇA DIGITAL</span><h2>As primeiras aventuras já começaram.</h2></div>
          <p>Essa coleção inaugura o formato do CONTROOLS. Depois, a mesma biblioteca poderá receber novos temas, histórias e desafios.</p>
        </div>
        <div className="marketing-case-grid">
          {cases.map(item => (
            <article key={item.number} className="marketing-case-card">
              <img src={item.image} alt="" />
              <div className="marketing-case-shade" />
              <div className="marketing-case-copy"><small>CASO {item.number}</small><h3>{item.title}</h3><p>{item.copy}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="marketing-access" id="acesso">
        <div className="marketing-access-intro">
          <span className="marketing-kicker">COMO VAMOS JOGAR</span>
          <h2>Baixe o app. Entre na aventura.</h2>
          <p>O aplicativo será a porta principal do CONTROOLS. Com o tempo, as sessões poderão ser liberadas por convite usando um código curto ou QR Code.</p>
        </div>
        <div className="marketing-access-grid">
          <article className="marketing-access-card download-card">
            <div className="access-icon">↓</div><small>ANDROID</small><h3>Baixar APK</h3><p>A versão Android está sendo preparada. Este será o botão oficial de download quando o primeiro APK estiver publicado.</p><button type="button" disabled>APK em breve</button>
          </article>
          <article className="marketing-access-card code-card">
            <div className="access-icon">#</div><small>ACESSO POR CONVITE</small><h3>Código ou QR Code</h3><p>No futuro, escolas, famílias, eventos e parceiros poderão liberar uma sessão com um convite válido.</p><div className="marketing-code-demo"><span>K7F4</span><i>—</i><span>P9</span></div><button type="button" disabled>Entrada por convite em breve</button>
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
