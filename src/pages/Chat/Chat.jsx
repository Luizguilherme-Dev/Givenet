import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Chat.css';
import Beams from '../Home/Beams';

const RESPOSTAS_MOCK = [
  "Olá! Posso ajudá-lo com informações sobre doações e ONGs parceiras.",
  "Para agendar uma coleta, aceda à secção de doações e escolha uma ONG próxima de si.",
  "As nossas ONGs parceiras aceitam roupas, alimentos não perecíveis e materiais escolares.",
  "Pode acompanhar o estado da sua doação na área do utilizador.",
  "Obrigado pelo seu interesse em ajudar! Cada doação faz a diferença.",
  "Para mais informações sobre uma ONG específica, consulte a página de ONGs.",
  "As doações são recolhidas de segunda a sexta, das 9h às 18h.",
  "Tem alguma outra dúvida sobre a plataforma Give Net?",
];

const ChatPreConsulta = () => {
  const [mensagens, setMensagens] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [carregando, setCarregando] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchMensagens = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:8080/chat");
      setMensagens(res.data);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (error) {
      console.error("Erro ao carregar mensagens", error);
      toast.error("❌ Erro ao carregar mensagens.");
    }
  }, []);

  useEffect(() => { fetchMensagens(); }, [fetchMensagens]);

  const enviarMensagem = async () => {
    if (!inputMsg.trim() || carregando) return;

    const textoUsuario = inputMsg.trim();
    setInputMsg("");
    setCarregando(true);

    try {
      await axios.post("http://localhost:8080/chat", {
        usuario: "paciente",
        mensagem: textoUsuario,
        data: new Date().toISOString(),
      });

      await fetchMensagens();

      await new Promise(res => setTimeout(res, 800));

      const respostaMock = RESPOSTAS_MOCK[Math.floor(Math.random() * RESPOSTAS_MOCK.length)];

      await axios.post("http://localhost:8080/chat", {
        usuario: "sistema",
        mensagem: respostaMock,
        data: new Date().toISOString(),
      });

      await fetchMensagens();
    } catch (error) {
      console.error("Erro ao enviar mensagem", error);
      toast.error("❌ Erro ao enviar mensagem.");
    } finally {
      setCarregando(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  };

  return (
    <div className="chat-page">
      <div className="beams-bg">
        <Beams beamWidth={3} beamHeight={30} beamNumber={20} lightColor="#cf08f7" speed={6.4} noiseIntensity={1.75} scale={0.2} rotation={30} />
      </div>
      <div className="container border rounded p-3 chat-container">
        <h3 className="mb-3 text-center chat-title">
          💜 Assistente Give Net
        </h3>

        <div className="flex-grow-1 overflow-auto mb-3 p-3 rounded chat-messages">
          {mensagens.length === 0 && (
            <p className="text-center" style={{ color: "#d8b4fe" }}>
              Olá! Como posso ajudar você hoje?
            </p>
          )}
          {mensagens.map(({ id, usuario, mensagem, data }) => (
            <div
              key={id}
              className={`d-flex mb-3 ${usuario === "paciente" ? "justify-content-end" : "justify-content-start"}`}
            >
              <div className={`p-3 rounded shadow-sm message-bubble ${usuario === "paciente" ? "user" : "system"}`}>
                <small style={{ fontWeight: "600", opacity: 0.8 }}>
                  {usuario === "paciente" ? "Você" : "🤖 Assistente Give Net"}
                </small>
                <p className="mb-1" style={{ marginTop: 6, lineHeight: "1.4rem" }}>
                  {mensagem}
                </p>
                <small style={{ fontSize: "0.7rem", opacity: 0.6, userSelect: "none" }}>
                  {new Date(data).toLocaleString()}
                </small>
              </div>
            </div>
          ))}
          {carregando && (
            <div className="d-flex justify-content-start mb-3">
              <div className="p-3 rounded message-bubble system">
                <small style={{ fontWeight: "600", opacity: 0.8 }}>🤖 Assistente Give Net</small>
                <p className="mb-0 mt-1" style={{ opacity: 0.7 }}>Digitando...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-group" style={{ gap: "10px" }}>
          <textarea
            className="form-control chat-textarea"
            placeholder="Digite sua mensagem..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={handleKeyPress}
            rows={2}
            disabled={carregando}
          />
          <button
            className="btn chat-button"
            onClick={enviarMensagem}
            disabled={carregando}
          >
            {carregando ? "..." : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Chat removido (não utilizado mais).
export default ChatPreConsulta;

