import { useState } from "react";
import "./Faq.css";
import AuroraBg from "../Shared/AuroraBg";


const Faq = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFaq = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      pergunta: "Como faço para doar alimentos?",
      resposta: "Acesse a página de Doação, preencha o formulário com seus dados, escolha a ONG destino e o horário de coleta. Nossa equipe entrará em contato para confirmar."
    },
    {
      pergunta: "Quais tipos de alimentos posso doar?",
      resposta: "Aceitamos alimentos não perecíveis como arroz, feijão, macarrão, óleo, açúcar, café, leite em pó, enlatados e produtos de higiene pessoal."
    },
    {
      pergunta: "Preciso me cadastrar para doar?",
      resposta: "Sim, é necessário fazer um cadastro simples com nome e e-mail para registrar sua doação e facilitar o agendamento da coleta."
    },
    {
      pergunta: "A coleta é gratuita?",
      resposta: "Sim! O serviço de coleta é totalmente gratuito. Nossa missão é facilitar o processo de doação para todos."
    },
    {
      pergunta: "Qual o horário de funcionamento para coletas?",
      resposta: "Realizamos coletas de segunda a sábado, das 8h às 18h. Você pode escolher o melhor horário no formulário de doação."
    },
    {
      pergunta: "Posso escolher qual ONG receberá minha doação?",
      resposta: "Sim! No formulário de doação você pode selecionar a ONG de sua preferência entre as parceiras cadastradas em nossa plataforma."
    },
    {
      pergunta: "Como sei se minha doação foi recebida?",
      resposta: "Você receberá uma confirmação por e-mail assim que a coleta for realizada e quando a doação chegar à ONG destino."
    },
    {
      pergunta: "Posso fazer doações recorrentes?",
      resposta: "Sim! Você pode agendar doações mensais através do nosso sistema. Basta indicar no formulário que deseja uma doação recorrente."
    },
    {
      pergunta: "Qual a quantidade mínima para doação?",
      resposta: "Não há quantidade mínima! Toda doação é bem-vinda, seja ela pequena ou grande. O importante é ajudar."
    },
    {
      pergunta: "Vocês aceitam doações de roupas?",
      resposta: "Atualmente focamos em alimentos e produtos de higiene, mas algumas ONGs parceiras aceitam roupas. Consulte no chat."
    },
    {
      pergunta: "Como funciona o chat de pré-consulta?",
      resposta: "O chat permite tirar dúvidas rápidas antes de fazer sua doação. Nossa equipe responde em horário comercial."
    },
    {
      pergunta: "Posso cancelar uma doação agendada?",
      resposta: "Sim, você pode cancelar através da página de Doações, clicando no botão 'Deletar' ao lado da doação agendada."
    },
    {
      pergunta: "A plataforma é segura?",
      resposta: "Sim! Utilizamos protocolos de segurança para proteger seus dados pessoais e garantir transparência nas doações."
    },
    {
      pergunta: "Como as ONGs são selecionadas?",
      resposta: "Todas as ONGs parceiras são verificadas e devem comprovar registro legal e atuação comprovada na área social."
    },
    {
      pergunta: "Posso visitar a ONG que receberá minha doação?",
      resposta: "Sim! Entre em contato diretamente com a ONG através dos dados disponíveis na página de ONGs para agendar uma visita."
    },
    {
      pergunta: "Empresas podem fazer doações?",
      resposta: "Sim! Empresas são muito bem-vindas. Para grandes volumes, entre em contato através do chat para condições especiais."
    },
    {
      pergunta: "Vocês emitem recibo de doação?",
      resposta: "Sim, mediante solicitação, podemos emitir um comprovante de doação para fins de declaração ou prestação de contas."
    },
    {
      pergunta: "Como posso me tornar voluntário?",
      resposta: "Entre em contato através do chat ou e-mail informando seu interesse. Temos diversas oportunidades de voluntariado."
    },
    {
      pergunta: "A plataforma cobra alguma taxa?",
      resposta: "Não! A Give Net é uma plataforma 100% gratuita. Não cobramos nenhuma taxa de doadores ou ONGs."
    },
    {
      pergunta: "Como posso cadastrar minha ONG na plataforma?",
      resposta: "Entre em contato através do nosso e-mail com os documentos da ONG. Faremos uma análise e retornaremos em até 5 dias úteis."
    }
  ];

  return (
    <div className="faq-page">
      <AuroraBg />
      <div className="faq-container">

        <h2 className="faq-title">Perguntas Frequentes</h2>
        <p className="faq-subtitle">Tire suas dúvidas sobre doações e nossa plataforma</p>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className={`faq-item ${activeIndex === index ? "active" : ""}`}>
              <button className="faq-question" onClick={() => toggleFaq(index)}>
                <span>{faq.pergunta}</span>
                <span className="faq-icon">{activeIndex === index ? "−" : "+"}</span>
              </button>
              {activeIndex === index && (
                <div className="faq-answer">
                  <p>{faq.resposta}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Faq;
