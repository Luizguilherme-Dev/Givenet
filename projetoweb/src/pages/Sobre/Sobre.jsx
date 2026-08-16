
import "./Sobre.css";

import AuroraBg from "../Shared/AuroraBg";

function Sobre() {

  return (
    <div className="sobre-container">
      <AuroraBg />

      <header className="sobre-header">
        <h1>Sobre o Give Net</h1>
        <p>Conectando solidariedade através da tecnologia</p>
      </header>

      <section className="sobre-section">
        <div className="sobre-content">
          <div className="sobre-text">
            <h2>💜 Nossa Missão</h2>
            <p>
              O Give Net é uma plataforma inovadora que conecta pessoas dispostas a doar
              com ONGs que fazem a diferença na sociedade. Nossa missão é facilitar o
              processo de doação, tornando-o mais acessível, transparente e eficiente.
            </p>
          </div>
          <div className="sobre-icon">🎯</div>
        </div>
      </section>

      <section className="sobre-section reverse">
        <div className="sobre-content">
          <div className="sobre-icon">🤝</div>
          <div className="sobre-text">
            <h2>Como Funciona</h2>
            <div className="steps">
              <div className="step">
                <span className="step-number">1</span>
                <h3>Cadastre-se</h3>
                <p>Crie sua conta gratuitamente na plataforma</p>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <h3>Escolha uma ONG</h3>
                <p>Navegue pelas ONGs parceiras e escolha a causa que deseja apoiar</p>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <h3>Registre sua Doação</h3>
                <p>Preencha o formulário com os detalhes da sua doação</p>
              </div>
              <div className="step">
                <span className="step-number">4</span>
                <h3>Agende a Coleta</h3>
                <p>Defina o melhor horário para a coleta dos itens doados</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sobre-section">
        <div className="sobre-content">
          <div className="sobre-text">
            <h2>🌟 Nosso Impacto</h2>
            <div className="impact-grid">
              <div className="impact-card">
                <div className="impact-icon">📦</div>
                <h3>Doações Facilitadas</h3>
                <p>Processo simplificado que economiza tempo e aumenta a eficiência</p>
              </div>
              <div className="impact-card">
                <div className="impact-icon">🏢</div>
                <h3>ONGs Conectadas</h3>
                <p>Rede crescente de organizações parceiras verificadas</p>
              </div>
              <div className="impact-card">
                <div className="impact-icon">💝</div>
                <h3>Transparência Total</h3>
                <p>Acompanhe suas doações e veja o impacto real na comunidade</p>
              </div>
              <div className="impact-card">
                <div className="impact-icon">🌍</div>
                <h3>Impacto Social</h3>
                <p>Contribuindo para um mundo mais justo e solidário</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sobre-section reverse">
        <div className="sobre-content sobre-content--full">
          <div className="sobre-text">
            <h2>Por que Give Net?</h2>
            <ul className="benefits-list">
              <li>Plataforma 100% gratuita para doadores</li>
              <li>ONGs verificadas e confiáveis</li>
              <li>Agendamento flexível de coletas</li>
              <li>Histórico completo de suas doações</li>
              <li>Suporte dedicado via chat</li>
              <li>Interface intuitiva e fácil de usar</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="sobre-cta">
        <h2>Faça Parte Dessa Transformação</h2>
        <p>Junte-se a milhares de pessoas que já estão fazendo a diferença</p>
        <button className="cta-button" onClick={() => window.location.href = '/Doacao'}>
          Fazer uma Doação Agora
        </button>
      </section>
    </div>
  );
}

export default Sobre;
