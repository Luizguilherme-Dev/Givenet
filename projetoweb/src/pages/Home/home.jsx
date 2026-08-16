
import { useNavigate } from "react-router-dom";
import "./Home.css";
import Aurora from './Aurora';

import imgAACD   from '../img/aacd.png';
import imgSenna  from '../img/ayrtonsenna.jpg';
import imgWWF    from '../img/wwf.jpg';


const impacto = [
  { valor: "12.400+", label: "Doações realizadas", icon: "" },
  { valor: "3",       label: "ONGs parceiras",     icon: "" },
  { valor: "8.200+",  label: "Famílias ajudadas",  icon: "" },
  { valor: "100%",    label: "Gratuito",            icon: "" },

];

const destaqueOngs = [
  { nome: "AACD",                    desc: "Reabilitação física gratuita para crianças e adultos.",             img: imgAACD,  cor: "#2563eb" },
  { nome: "Instituto Ayrton Senna",  desc: "Educação de qualidade para jovens em situação de vulnerabilidade.", img: imgSenna, cor: "#dc2626" },
  { nome: "WWF Brasil",              desc: "Conservação da natureza e combate às mudanças climáticas.",         img: imgWWF,   cor: "#4d7c0f" },
];


const comoFunciona = [
  { num: "01", titulo: "Crie sua conta",      desc: "Cadastre-se gratuitamente em menos de 1 minuto.",          icon: "" },
  { num: "02", titulo: "Escolha uma ONG",     desc: "Navegue pelas ONGs parceiras e escolha sua causa.",        icon: "" },
  { num: "03", titulo: "Registre a doação",   desc: "Preencha o formulário com os itens que deseja doar.",      icon: "" },
  { num: "04", titulo: "Agende a coleta",     desc: "Defina o horário e aguardamos na sua porta.",              icon: "" },
];


function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">

      <div className="home-bg">
        <Aurora
          colorStops={['#7C3AED', '#7e36c0', '#5227FF']}
          blend={0.5}
          amplitude={1.0}
          speed={1}
        />
      </div>


      {/* ===== HERO ===== */}
      <section className="home-hero">
        <div className="home-hero-badge">Plataforma 100% gratuita</div>

        <h1 className="home-hero-title">
          Doe com propósito.<br />
          <span>Transforme vidas.</span>
        </h1>
        <p className="home-hero-sub">
          O Give Net conecta doadores a ONGs verificadas de forma simples,
          segura e transparente. Sua doação chega a quem realmente precisa.
        </p>
        <div className="home-hero-actions">
          <button className="btn-primary" onClick={() => navigate("/Doacao")}>
            Fazer uma Doação
          </button>

          <button className="btn-outline" onClick={() => navigate("/ong")}>
            Conhecer as ONGs →
          </button>
        </div>
      </section>

      {/* ===== CONTADOR DE IMPACTO ===== */}
      <section className="home-impacto">
        {impacto.map((item) => (
          <div key={item.label} className="home-impacto-card">
            <span className="home-impacto-icon" aria-hidden="true">{item.icon}</span>

            <span className="home-impacto-valor">{item.valor}</span>
            <span className="home-impacto-label">{item.label}</span>
          </div>
        ))}
      </section>

      {/* ===== COMO FUNCIONA ===== */}
      <section className="home-section">
        <div className="home-section-header">
          <h2>Como funciona</h2>
          <p>Doe em 4 passos simples e sem burocracia</p>
        </div>
        <div className="home-steps">
          {comoFunciona.map((step) => (
          <div key={step.num} className="home-step">
              <div className="home-step-num">{step.num}</div>
              <div className="home-step-icon" aria-hidden="true">{step.icon}</div>
              <h3>{step.titulo}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ONGs EM DESTAQUE ===== */}
      <section className="home-section">
        <div className="home-section-header">
          <h2>ONGs em destaque</h2>
          <p>Organizações verificadas esperando pela sua ajuda</p>
        </div>
        <div className="home-ongs-grid">
          {destaqueOngs.map((ong) => (
            <div
              key={ong.nome}
              className="home-ong-card"
              style={{ "--cor": ong.cor }}
              onClick={() => navigate("/ong")}
            >
              <div className="home-ong-icon">
                <img src={ong.img} alt={ong.nome} />
              </div>
              <h3>{ong.nome}</h3>

              <p>{ong.desc}</p>
              <span className="home-ong-btn">Saiba mais →</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA CENTRAL ===== */}
      <section className="home-cta">
        <div className="home-cta-inner">
          <h2>Pronto para fazer a diferença?</h2>
          <p>Junte-se a milhares de pessoas que já transformaram vidas com pequenos gestos.</p>
          <div className="home-hero-actions">
            <button className="btn-primary" onClick={() => navigate("/Doacao")}>
              Começar agora
            </button>
            <button className="btn-outline" onClick={() => navigate("/cadastro")}>
              Criar conta grátis
            </button>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="home-footer">
        <div className="home-footer-links">
          <span onClick={() => navigate("/Sobre")}>Sobre</span>
          <span onClick={() => navigate("/ong")}>ONGs</span>
          <span onClick={() => navigate("/Faq")}>FAQ</span>
          <span onClick={() => navigate("/Chat")}>Contato</span>
        </div>
        <p>© 2026 Give Net. Todos os direitos reservados. Feito com amor</p>
      </footer>

    </div>
  );
}

export default Home;
