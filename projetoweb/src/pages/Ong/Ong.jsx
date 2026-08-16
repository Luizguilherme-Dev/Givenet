import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import './Ong.css';
import AuroraBg from "../Shared/AuroraBg";




import fotoWWF from '../img/wwf.jpg';
import fotoGreenpeace from '../img/greenpeace.jpg';
import fotoCaritas from '../img/CaritasBrasileira.jpg';
import fotoSenna from '../img/ayrtonsenna.jpg';
import fotoAACD from '../img/aacd.png';

const ongDetalhes = {
  "WWF Brasil": {
    icon: "🐼",
    cor: "#15803d",
    corClara: "#dcfce7",
    fundacao: "1961",
    pais: "Internacional",
    sede: "Brasília, DF",
    site: "https://www.wwf.org.br",
    funcionarios: "+6.000 colaboradores",
    paises_atuacao: "+100 países",
    foto: fotoWWF,
    fotoCapa: fotoWWF,
    sobre: "O WWF (World Wildlife Fund) é uma das maiores organizações de conservação da natureza do mundo. No Brasil, atua na proteção de biomas como Amazônia, Cerrado, Pantanal e Mata Atlântica, combatendo o desmatamento, a caça ilegal e as mudanças climáticas, promovendo o desenvolvimento sustentável.",
    historia: "Fundado em 29 de abril de 1961 em Morges, Suíça, por um grupo de cientistas e líderes conservacionistas, incluindo Sir Julian Huxley e Peter Scott — que criou o famoso logotipo do panda. O WWF Brasil foi estabelecido em 1996 e desde então desenvolve projetos de conservação em parceria com governos, empresas e comunidades locais. É reconhecido mundialmente por campanhas como a Hora do Planeta e por seu trabalho em políticas ambientais internacionais.",
    numeros: [
      { valor: "+100", label: "países de atuação" },
      { valor: "5 mi", label: "apoiadores no mundo" },
      { valor: "1961", label: "ano de fundação" },
      { valor: "1996", label: "chegada ao Brasil" },
    ],
    atuacao: ["Conservação da Amazônia", "Cerrado e Pantanal", "Mudanças climáticas", "Oceanos", "Espécies ameaçadas", "Desenvolvimento sustentável"],
  },
  "Greenpeace Brasil": {
    icon: "🌿",
    cor: "#16a34a",
    corClara: "#f0fdf4",
    fundacao: "1971",
    pais: "Internacional",
    sede: "São Paulo, SP",
    site: "https://www.greenpeace.org/brasil",
    funcionarios: "+3.000 colaboradores",
    paises_atuacao: "+55 países",
    foto: fotoGreenpeace,
    fotoCapa: fotoGreenpeace,
    sobre: "O Greenpeace é uma organização ambiental independente que atua globalmente para defender o meio ambiente e promover a paz. No Brasil, foca na proteção da Amazônia, no combate ao desmatamento, na transição energética para fontes renováveis e na denúncia de crimes ambientais corporativos e governamentais.",
    historia: "Fundado em 1971 em Vancouver, Canadá, por ativistas que protestavam contra testes nucleares americanos no Alasca. O nome 'Greenpeace' surgiu da combinação de 'green' (verde) e 'peace' (paz). Chegou ao Brasil na década de 1990 e desde então realiza campanhas de alto impacto, como a proteção da Amazônia e o combate à pesca predatória. É conhecido por suas ações diretas não violentas e por pressionar governos e empresas a adotarem práticas mais sustentáveis.",
    numeros: [
      { valor: "+55", label: "países de atuação" },
      { valor: "+3 mi", label: "apoiadores no Brasil" },
      { valor: "1971", label: "ano de fundação" },
      { valor: "100%", label: "independente" },
    ],
    atuacao: ["Proteção da Amazônia", "Energia renovável", "Oceanos", "Agrotóxicos", "Clima", "Desmatamento zero"],
  },
  "Cáritas Brasileira": {
    icon: "🤝",
    cor: "#dc2626",
    corClara: "#fee2e2",
    fundacao: "1956",
    pais: "Brasil",
    sede: "Brasília, DF",
    site: "https://caritas.org.br",
    funcionarios: "+180 entidades membros",
    paises_atuacao: "Brasil",
    foto: fotoCaritas,
    fotoCapa: fotoCaritas,
    sobre: "A Cáritas Brasileira é um organismo da Conferência Nacional dos Bispos do Brasil (CNBB) que atua na defesa e promoção dos direitos humanos, com foco em populações em situação de vulnerabilidade. Desenvolve projetos de segurança alimentar, geração de renda, atenção a migrantes e refugiados, e resposta a desastres socioambientais.",
    historia: "Fundada em 12 de novembro de 1956, a Cáritas Brasileira integra a rede Cáritas Internationalis, presente em mais de 160 países. Ao longo de sua história, atuou em momentos críticos como a seca do Nordeste, as enchentes no Sul do Brasil e a crise dos refugiados venezuelanos. É reconhecida por seu trabalho de base junto a comunidades periféricas, povos indígenas, quilombolas e populações de rua.",
    numeros: [
      { valor: "160+", label: "países na rede Cáritas" },
      { valor: "1956", label: "ano de fundação" },
      { valor: "180+", label: "entidades membros" },
      { valor: "27", label: "regionais no Brasil" },
    ],
    atuacao: ["Segurança alimentar", "Migrantes e refugiados", "Geração de renda", "Desastres socioambientais", "Direitos humanos", "Povos tradicionais"],
  },
  "AACD": {
    icon: "🦽",
    cor: "#0369a1",
    corClara: "#e0f2fe",
    fundacao: "1950",
    pais: "Brasil",
    sede: "São Paulo, SP",
    site: "https://www.aacd.org.br",
    funcionarios: "+2.000 colaboradores",
    paises_atuacao: "Brasil",
    foto: fotoAACD,
    fotoCapa: fotoAACD,
    sobre: "A AACD (Associação de Assistência à Criança Deficiente) é uma instituição filantrópica brasileira especializada na reabilitação de pessoas com deficiência física. Atende crianças, adolescentes e adultos com paralisia cerebral, lesão medular, amputações e malformações congênitas, oferecendo tratamento multidisciplinar gratuito pelo SUS.",
    historia: "Fundada em 1950 pelo médico Renato da Costa Bomfim e por pais de crianças com poliomielite, a AACD nasceu da necessidade de oferecer reabilitação especializada no Brasil. Ao longo de mais de 70 anos, expandiu sua atuação por meio de unidades próprias e do Programa de Saúde Itinerante (PSI), que leva atendimento a regiões remotas do país. É referência nacional e internacional em reabilitação física e inclusão social.",
    numeros: [
      { valor: "+70", label: "anos de história" },
      { valor: "+30 mil", label: "pacientes/ano" },
      { valor: "1950", label: "ano de fundação" },
      { valor: "100%", label: "atendimento gratuito (SUS)" },
    ],
    atuacao: ["Paralisia cerebral", "Lesão medular", "Amputações", "Malformações congênitas", "Reabilitação física", "Inclusão social"],
  },
  "Instituto Ayrton Senna": {
    icon: "🏎️",
    cor: "#7c3aed",
    corClara: "#ede9fe",
    fundacao: "1994",
    pais: "Brasil",
    sede: "São Paulo, SP",
    site: "https://www.institutoayrtonsenna.org.br",
    funcionarios: "+300 colaboradores",
    paises_atuacao: "Brasil",
    foto: fotoSenna,
    fotoCapa: fotoSenna,
    sobre: "O Instituto Ayrton Senna é uma organização sem fins lucrativos dedicada a transformar a educação pública brasileira. Desenvolve soluções educacionais em parceria com governos estaduais e municipais, focando na melhoria da aprendizagem, na formação de professores e na garantia do direito de crianças e jovens a uma educação de qualidade.",
    historia: "Fundado em 1994 por Viviane Senna, irmã do tricampeão mundial de Fórmula 1 Ayrton Senna, em homenagem ao piloto falecido naquele ano. Desde sua criação, o instituto já beneficiou mais de 25 milhões de estudantes em todo o Brasil. Atua em parceria com secretarias de educação de estados e municípios, desenvolvendo programas de alfabetização, ensino médio e educação integral.",
    numeros: [
      { valor: "+25 mi", label: "estudantes beneficiados" },
      { valor: "1994", label: "ano de fundação" },
      { valor: "+2.000", label: "municípios parceiros" },
      { valor: "100%", label: "foco em educação pública" },
    ],
    atuacao: ["Educação básica", "Alfabetização", "Ensino médio", "Formação de professores", "Políticas públicas", "Educação integral"],
  },
};

function Ong() {
  const [ongs, setOngs] = useState([]);
  const [selecionada, setSelecionada] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:8080/ongs")
      .then((res) => setOngs(res.data))
      .catch((err) => { console.error("Erro ao buscar ONGs", err); toast.error("❌ Erro ao carregar ONGs."); });
  }, []);

  if (selecionada) {
    const d = ongDetalhes[selecionada.nome] || {};
    return (
    <div className="ong-detalhe-page" style={{ "--cor": d.cor, "--cor-clara": d.corClara }}>
      <AuroraBg />


        <div className="ong-detalhe-hero">
          {d.fotoCapa && (
            <img
              src={d.fotoCapa}
              alt={selecionada.nome}
              className="ong-detalhe-foto-capa"
              onError={(e) => e.target.style.display = 'none'}
            />
          )}
          <div className="ong-detalhe-hero-overlay">
            <div className="ong-detalhe-hero-texto">
              <h1>{selecionada.nome}</h1>
              <div className="ong-detalhe-meta">
                {d.fundacao   && <span>📅 Fundada em {d.fundacao}</span>}
                {d.pais       && <span>🌍 {d.pais}</span>}
                {d.sede       && <span>📍 {d.sede}</span>}
                {d.funcionarios && <span>👥 {d.funcionarios}</span>}
                {selecionada.email    && <span>✉️ {selecionada.email}</span>}
                {selecionada.telefone && <span>📞 {selecionada.telefone}</span>}
              </div>
            </div>
          </div>
        </div>

        {d.numeros && (
          <div className="ong-numeros">
            {d.numeros.map((n) => (
              <div key={n.label} className="ong-numero-card">
                <span className="ong-numero-valor">{n.valor}</span>
                <span className="ong-numero-label">{n.label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="ong-detalhe-body">
          <div className="ong-detalhe-secao">
            <h2>Sobre</h2>
            <p>{d.sobre || "Informações não disponíveis."}</p>
          </div>
          <div className="ong-detalhe-secao">
            <h2>História</h2>
            <p>{d.historia || "Informações não disponíveis."}</p>
          </div>
          {d.atuacao && (
            <div className="ong-detalhe-secao">
              <h2>Áreas de Atuação</h2>
              <div className="ong-tags">
                {d.atuacao.map((tag) => (
                  <span key={tag} className="ong-tag">{tag}</span>
                ))}
              </div>
            </div>
          )}
          {d.site && (
            <div className="ong-detalhe-secao">
              <h2>Site Oficial</h2>
              <a href={d.site} target="_blank" rel="noopener noreferrer" className="ong-site-link">
                {d.site} ↗
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="ong-lista-page">
      <AuroraBg />
      <div className="ong-lista-header">



        <h1>ONGs Parceiras</h1>
        <p>Organizações que fazem a diferença — clique para conhecer cada uma</p>
      </div>

      <div className="ong-lista">
        {ongs.map((ong) => {
          const d = ongDetalhes[ong.nome] || {};
          return (
            <div
              key={ong.id}
              className="ong-card-horizontal"
              style={{ "--cor": d.cor || "#6d28d9", "--cor-clara": d.corClara || "#ede9fe" }}
              onClick={() => setSelecionada(ong)}
            >
              <div className="ong-card-esquerda">
                {d.foto ? (
                  <img
                    src={d.foto}
                    alt={ong.nome}
                    className="ong-card-foto"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="ong-card-icon" style={{ display: d.foto ? 'none' : 'flex' }}>
                  {d.icon || "🏢"}
                </div>
              </div>
              <div className="ong-card-direita">
                <div>
                  <h2>{ong.nome}</h2>
                  <div className="ong-card-badges">
                    {d.fundacao && <span className="ong-badge">📅 Desde {d.fundacao}</span>}
                    {d.pais     && <span className="ong-badge">🌍 {d.pais}</span>}
                    {d.sede     && <span className="ong-badge">📍 {d.sede}</span>}
                    {d.funcionarios && <span className="ong-badge">👥 {d.funcionarios}</span>}
                  </div>
                  <p className="ong-card-sobre">{d.sobre || "Clique para saber mais."}</p>
                </div>
                <div className="ong-card-rodape">
                  {d.atuacao?.slice(0, 3).map((tag) => (
                    <span key={tag} className="ong-card-tag">{tag}</span>
                  ))}
                  <span className="ong-card-saibamais">Saiba mais →</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Ong;
