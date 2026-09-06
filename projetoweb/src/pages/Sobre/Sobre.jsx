
import "./Sobre.css";
import AccordionGallery from "./AccordionGallery";
import AuroraBg from "../Shared/AuroraBg";

const cards = [
  {
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
    label: "Nossa Missão",
    description: "Conectar pessoas dispostas a doar com ONGs que transformam a sociedade com mais acesso, transparência e eficiência.",
    alt: "Pessoa apoiando uma causa social"
  },
  {
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80",
    label: "Como Funciona",
    description: "Cadastre-se, escolha uma ONG, registre a doação e agende a coleta do item com praticidade e segurança.",
    alt: "Pessoa escolhendo uma ONG"
  },
  {
    image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=80",
    label: "Nosso Impacto",
    description: "Doações facilitadas, ONGs conectadas, transparência no acompanhamento e contribuição real para uma comunidade melhor.",
    alt: "Voluntários reunidos em ação social"
  },
  {
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    label: "Por que Give Net?",
    description: "Plataforma gratuita, ONGs verificadas, histórico completo de doações, suporte e uma experiência intuitiva para todos.",
    alt: "Equipe trabalhando em colaboração"
  },
  {
    image: "https://images.unsplash.com/photo-1517486808906-6ca8b1d0e5d4?auto=format&fit=crop&w=1200&q=80",
    label: "Faça Parte",
    description: "Junte-se a milhares de pessoas que já estão transformando vidas e fazendo a diferença todos os dias.",
    alt: "Pessoa participando de ação solidária"
  }
];

function Sobre() {
  return (
    <div className="sobre-container">
      <AuroraBg />

      <section className="sobre-hero">
        <div className="sobre-hero-badge">Sobre o Give Net</div>
        <h1 className="sobre-hero-title">
          Conectando solidariedade.<br />
          <span>Através da tecnologia.</span>
        </h1>
        <div className="sobre-hero-gallery" aria-label="Imagens do Give Net">
          <AccordionGallery
            items={cards}
            defaultIndex={2}
            accentColor="#d8b4fe"
            overlayColor="#120714"
            textColor="#ffffff"
            height={460}
            gap={12}
            radius={22}
            expandRatio={0.56}
            duration={0.7}
            ease="power3.out"
            parallax={0.65}
            tilt={10}
            trigger="hover"
            showLabels
            grayscale
          />
        </div>
        <p className="sobre-hero-sub">
          O Give Net nasceu para aproximar pessoas dispostas a ajudar de ONGs que transformam
          realidades. Criamos uma experiência simples, segura e transparente para que cada doação
          chegue mais longe.
        </p>
      </section>

      <section className="sobre-content" aria-label="Sobre o Give Net">
        <div className="sobre-content-heading">
          <p className="sobre-kicker">O que nos move</p>
          <h2>Uma rede criada para aproximar boas intenções de quem precisa delas.</h2>
        </div>
        <div className="sobre-content-list">
          {cards.map((card, index) => (
            <article className="sobre-content-item" key={card.label}>
              <span className="sobre-content-number">0{index + 1}</span>
              <h3>{card.label}</h3>
              <p>{card.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sobre-cta">
        <div>
          <p className="sobre-kicker">O próximo passo é seu</p>
          <h2>Faça parte dessa transformação</h2>
          <p>Junte-se a milhares de pessoas que já estão fazendo a diferença.</p>
        </div>
        <button className="cta-button" onClick={() => window.location.href = "/Doacao"}>
          Fazer uma doação <span aria-hidden="true">-&gt;</span>
        </button>
      </section>
    </div>
  );
}

export default Sobre;
