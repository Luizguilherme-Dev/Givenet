import { useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { QRCodeSVG } from "qrcode.react";
import "./ConfirmarDoacao.css";
import AuroraBg from "../Shared/AuroraBg";

function ProgressoConfirmacao({ status }) {
  const concluido = status === "concluido";
  return (
    <div className="conf-progresso-wrap">
      <div className="conf-progresso-bar">
        <div className={`conf-progresso-fill ${concluido ? "concluido" : "loading"}`} />
      </div>
      {concluido && (
        <div className="conf-check-wrap">
          <svg className="conf-check-svg" viewBox="0 0 52 52">
            <circle className="conf-check-circle" cx="26" cy="26" r="25" fill="none" />
            <path className="conf-check-tick" fill="none" d="M14 27 l8 8 l16-16" />
          </svg>
          <p className="conf-check-label">Entrega confirmada com sucesso!</p>
        </div>
      )}
    </div>
  );
}

function PinDigits({ pinReal, pinDigitado }) {
  return (
    <div className="conf-pin-digits">
      {[0, 1, 2, 3].map((i) => {
        const digitado = pinDigitado[i] || "";
        const correto = digitado && digitado === pinReal[i];
        const errado = digitado && digitado !== pinReal[i];
        return (
          <div key={i} className={`conf-pin-digit ${correto ? "correto" : ""} ${errado ? "errado" : ""} ${!digitado ? "vazio" : ""}`}>
            {digitado || "·"}
          </div>
        );
      })}
    </div>
  );
}

export default function ConfirmarDoacao() {
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado") || "null");
  const isAdmin = usuarioLogado?.role === "ADMIN";

  const [doacaoId, setDoacaoId] = useState("");
  const [senhaAdmin, setSenhaAdmin] = useState("");
  const [doacao, setDoacao] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [metodo, setMetodo] = useState("pin");
  const [pin, setPin] = useState("");
  const [progresso, setProgresso] = useState("idle");
  const [mostrarQR, setMostrarQR] = useState(false);

  if (!isAdmin) {
    return (
      <div className="conf-page">
        <AuroraBg />
        <div className="conf-container">
          <p className="conf-negado">⛔ Acesso restrito a administradores.</p>
        </div>
      </div>
    );
  }

  const buscarDoacao = async () => {
    if (!doacaoId) return toast.error("❌ Informe o ID da doação.");
    setBuscando(true);
    setDoacao(null);
    setPin("");
    try {
      const res = await axios.get(`http://localhost:8080/doacoes/${doacaoId}`, {
        headers: {
          usuarioId: usuarioLogado.id,
          adminEmail: usuarioLogado.email,
          adminSenha: senhaAdmin,
        },
      });
      if (res.data.status === "DOACAO_ENTREGUE") {
        toast.warning("⚠️ Esta doação já foi confirmada.");
        return;
      }
      setDoacao(res.data);
    } catch {
      toast.error("❌ Doação não encontrada ou senha incorreta.");
    } finally {
      setBuscando(false);
    }
  };

  const pinValido = doacao && pin.length === 4 && pin === doacao.pinConfirmacao;
  const pinCompleto = pin.length === 4;
  const pinErrado = pinCompleto && doacao && pin !== doacao.pinConfirmacao;

  const handleConfirmar = async () => {
    if (!doacao) return;
    if (metodo === "pin" && !pinValido) return toast.error("❌ PIN incorreto.");

    setProgresso("loading");
    try {
      const headers = { usuarioId: usuarioLogado.id };
      const params = {};

      if (metodo === "pin") {
        params.pin = pin;
      } else {
        headers.adminEmail = usuarioLogado.email;
        headers.adminSenha = senhaAdmin;
      }

      await axios.patch(
        `http://localhost:8080/doacoes/${doacaoId}/confirmar-entrega`,
        {},
        { headers, params }
      );
      setProgresso("concluido");
    } catch (err) {
      setProgresso("idle");
      console.error("Erro confirmar:", err.response);
      const msg = err.response?.data?.message || err.response?.data || "Erro ao confirmar.";
      toast.error(`❌ ${msg}`);
    }
  };

  const resetar = () => {
    setProgresso("idle");
    setDoacaoId("");
    setDoacao(null);
    setPin("");
    setSenhaAdmin("");
  };

  const qrValue = doacaoId
    ? `http://localhost:8080/doacoes/${doacaoId}/confirmar-entrega`
    : "https://givenet.app";

  return (
    <div className="conf-page">
      <AuroraBg />
      <div className="conf-container">
        <h2 className="conf-titulo">Confirmar Entrega</h2>
        <p className="conf-sub">Painel exclusivo para administradores</p>

        {progresso !== "concluido" && (
          <>
            <div className="conf-group">
              <label className="conf-label">ID da Doação</label>
              <div className="conf-busca-row">
                <input
                  className="conf-input"
                  type="number"
                  placeholder="Ex: 12"
                  value={doacaoId}
                  onChange={(e) => { setDoacaoId(e.target.value); setDoacao(null); setPin(""); }}
                  onKeyDown={(e) => e.key === "Enter" && buscarDoacao()}
                />
                <button className="conf-btn-buscar" onClick={buscarDoacao} disabled={buscando || !doacaoId}>
                  {buscando ? <span className="conf-spinner" /> : "Buscar"}
                </button>
              </div>
            </div>

            {doacao && (
              <>
                <div className="conf-doacao-card">
                  <div className="conf-doacao-row">
                    <span className="conf-doacao-label">Doador</span>
                    <span className="conf-doacao-valor">{doacao.nome}</span>
                  </div>
                  <div className="conf-doacao-row">
                    <span className="conf-doacao-label">ONG</span>
                    <span className="conf-doacao-valor">{doacao.ong?.nome || "—"}</span>
                  </div>
                  <div className="conf-doacao-row">
                    <span className="conf-doacao-label">Item</span>
                    <span className="conf-doacao-valor">{doacao.itemDoado || doacao.itensTipo || "—"}</span>
                  </div>
                  <div className="conf-doacao-row">
                    <span className="conf-doacao-label">Horário</span>
                    <span className="conf-doacao-valor">{doacao.horario}h</span>
                  </div>
                  <div className="conf-doacao-row">
                    <span className="conf-doacao-label">PIN da doação</span>
                    <span className="conf-doacao-pin">{doacao.pinConfirmacao}</span>
                  </div>
                </div>

                <div className="conf-metodos">
                  <button className={`conf-metodo-btn ${metodo === "pin" ? "ativo" : ""}`} onClick={() => { setMetodo("pin"); setPin(""); }}>
                    🔢 PIN
                  </button>
                  <button className={`conf-metodo-btn ${metodo === "qr" ? "ativo" : ""}`} onClick={() => setMetodo("qr")}>
                    📷 QR Code
                  </button>
                </div>

                {metodo === "pin" && (
                  <div className="conf-group">
                    <label className="conf-label">
                      Digite o PIN para confirmar
                      {pinErrado && <span className="conf-pin-erro"> — PIN incorreto</span>}
                      {pinValido && <span className="conf-pin-ok"> — ✓ Correto</span>}
                    </label>
                    <PinDigits pinReal={doacao.pinConfirmacao} pinDigitado={pin} />
                    <input
                      className={`conf-input conf-pin ${pinErrado ? "input-erro" : ""} ${pinValido ? "input-ok" : ""}`}
                      type="text"
                      placeholder="0000"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                      autoFocus
                    />
                  </div>
                )}

                {metodo === "qr" && (
                  <div className="conf-group">
                    <p className="conf-label">QR Code para apresentar na ONG</p>
                    <button className="conf-btn-qr" onClick={() => setMostrarQR(true)}>
                      Mostrar QR Code
                    </button>
                  </div>
                )}

                <button
                  className="conf-btn-confirmar"
                  onClick={handleConfirmar}
                  disabled={progresso === "loading" || (metodo === "pin" && !pinValido) || metodo === "qr"}
                >
                  {progresso === "loading" ? (
                    <span className="conf-btn-inner"><span className="conf-spinner" /> Confirmando...</span>
                  ) : metodo === "qr" ? (
                    "Apresente o QR Code na ONG"
                  ) : (
                    "✅ Confirmar Entrega"
                  )}
                </button>
              </>
            )}
          </>
        )}

        <ProgressoConfirmacao status={progresso} />

        {progresso === "concluido" && (
          <button className="conf-btn-novo" onClick={resetar}>
            Confirmar outra doação
          </button>
        )}
      </div>

      {mostrarQR && createPortal(
        <div className="qr-overlay" onClick={() => setMostrarQR(false)}>
          <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
            <p className="qr-instrucao">Apresente este QR Code na ONG no momento da entrega</p>
            <div className="qr-box">
              <QRCodeSVG value={qrValue} size={200} bgColor="#ffffff" fgColor="#1a0533" level="H" />
            </div>
            <p className="qr-id">ID #{doacaoId} · {doacao?.ong?.nome}</p>
            <button className="qr-fechar" onClick={() => setMostrarQR(false)}>Fechar</button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
