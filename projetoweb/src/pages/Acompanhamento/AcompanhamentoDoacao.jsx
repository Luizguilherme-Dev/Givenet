import { useState } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { QRCodeSVG } from "qrcode.react";
import "./AcompanhamentoDoacao.css";

export function CardAcompanhamento({ doacao, onConfirmar, podeConfirmar, confirmando, onConfirmarPin }) {
  const [mostrarQR, setMostrarQR] = useState(false);
  const status = doacao.status?.toUpperCase() ?? "AGENDADO";
  const isEntregue = status === "DOACAO_ENTREGUE";
  const isCancelado = status === "CANCELADO";

  const badgeClass = isEntregue ? "entregue" : isCancelado ? "cancelado" : "agendado";
  const badgeLabel = isEntregue ? "✅ Entregue" : isCancelado ? "Cancelada" : "Registrada";

  const nomeOng = typeof doacao.ong === "object" ? doacao.ong?.nome : doacao.ong;

  const dataFormatada = doacao.data
    ? new Date(doacao.data).toLocaleDateString("pt-BR")
    : "—";

  const dataEntregaFormatada = doacao.dataEntrega
    ? new Date(doacao.dataEntrega).toLocaleString("pt-BR")
    : null;

  const qrValue = `http://localhost:8080/doacoes/${doacao.id}/confirmar-entrega`;

  return (
    <div className="acomp-card">
      {/* ── Cabeçalho ── */}
      <div className="acomp-header">
        <div>
          <p className="acomp-titulo">{doacao.nome}</p>
          <p className="acomp-ong">{nomeOng || "—"}</p>
        </div>
        <span className={`acomp-badge ${badgeClass}`}>{badgeLabel}</span>
      </div>

      {/* ── Barra de Progresso ── */}
      <div className="acomp-progresso">
        <div className="acomp-track">
          <div className={`acomp-dot ${isCancelado ? "cancelado-dot" : isEntregue ? "concluido" : "ativo"}`} />
          <div className={`acomp-linha ${isCancelado ? "cancelada-linha" : isEntregue ? "preenchida" : ""}`} />
          <div className={`acomp-dot ${isCancelado ? "cancelado-dot" : isEntregue ? "concluido" : ""}`} />
        </div>
        <div className="acomp-labels">
          <span className={`acomp-label ${isCancelado ? "cancelado-lbl" : isEntregue ? "concluido" : "ativo"}`}>
            Registrada
          </span>
          <span className={`acomp-label ${isCancelado ? "cancelado-lbl" : isEntregue ? "concluido" : ""}`}>
            Entregue
          </span>
        </div>
      </div>

      {/* ── Detalhes ── */}
      <div className="acomp-detalhes">
        <div className="acomp-detalhe-item">
          <span className="acomp-detalhe-label">E-mail</span>
          <span className="acomp-detalhe-valor">{doacao.email}</span>
        </div>
        <div className="acomp-detalhe-item">
          <span className="acomp-detalhe-label">Item doado</span>
          <span className="acomp-detalhe-valor">{doacao.itemDoado || doacao.itensTipo || "—"}</span>
        </div>
        <div className="acomp-detalhe-item">
          <span className="acomp-detalhe-label">Data</span>
          <span className="acomp-detalhe-valor">{dataFormatada}</span>
        </div>
        <div className="acomp-detalhe-item">
          <span className="acomp-detalhe-label">Horário</span>
          <span className="acomp-detalhe-valor">{doacao.horario || "—"}h</span>
        </div>
      </div>

      {/* ── Bloco de entrega confirmada ── */}
      {isEntregue && dataEntregaFormatada && (
        <div className="acomp-entrega-confirmada">
          <span className="acomp-entrega-icon">✅</span>
          <div className="acomp-entrega-info">
            <span className="acomp-entrega-label">Doação entregue confirmada em</span>
            <span className="acomp-entrega-data">{dataEntregaFormatada}</span>
          </div>
        </div>
      )}

      {/* ── Botão QR Code (somente quando não entregue/cancelado) ── */}
      {!isEntregue && !isCancelado && (
        <button className="acomp-btn-qr" onClick={() => setMostrarQR(true)}>
          Mostrar QR Code para entrega
        </button>
      )}

      {/* ── Modal QR Code (portal para fora do card) ── */}
      {mostrarQR && createPortal(
        <div className="qr-overlay" onClick={() => setMostrarQR(false)}>
          <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
            <p className="qr-instrucao">Apresente este QR Code na ONG no momento da entrega</p>
            <div className="qr-box">
              <QRCodeSVG value={qrValue} size={200} bgColor="#ffffff" fgColor="#1a0533" level="H" />
            </div>
            <p className="qr-id">ID #{doacao.id} · {nomeOng}</p>
            <button className="qr-fechar" onClick={() => setMostrarQR(false)}>Fechar</button>
          </div>
        </div>,
        document.body
      )}

      {/* ── PIN de confirmação (só quando não entregue/cancelado) ── */}
      {!isEntregue && !isCancelado && doacao.pinConfirmacao && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(168,85,247,0.1)",
          border: "1px solid rgba(168,85,247,0.3)",
          borderRadius: 12, padding: "10px 16px"
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: "0.72rem", color: "rgba(196,181,253,0.7)", textTransform: "uppercase", letterSpacing: "0.5px" }}>PIN de entrega</span>
            <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "#c4b5fd", letterSpacing: 8 }}>{doacao.pinConfirmacao}</span>
          </div>
          {podeConfirmar && onConfirmarPin && (
            <button
              onClick={() => onConfirmarPin(doacao.id)}
              disabled={confirmando}
              style={{
                padding: "8px 14px", fontSize: "0.82rem", fontWeight: 700,
                background: "rgba(168,85,247,0.2)", border: "1px solid rgba(168,85,247,0.5)",
                color: "#e9d5ff", borderRadius: 8, cursor: "pointer"
              }}
            >
              {confirmando ? "..." : "Confirmar via PIN"}
            </button>
          )}
        </div>
      )}

      {/* ── Botão confirmar (somente admin/ong, quando não entregue/cancelado) ── */}
      {podeConfirmar && !isEntregue && !isCancelado && (
        <button
          className="acomp-btn-confirmar"
          onClick={() => onConfirmar && onConfirmar(doacao.id)}
          disabled={confirmando}
        >
          {confirmando ? (
            <span className="acomp-btn-inner">
              <span className="acomp-spinner" />
              Confirmando...
            </span>
          ) : (
            <span className="acomp-btn-inner">✅ Confirmar Entrega</span>
          )}
        </button>
      )}
    </div>
  );
}

CardAcompanhamento.propTypes = {
  doacao: PropTypes.object.isRequired,
  onConfirmar: PropTypes.func,
  onConfirmarPin: PropTypes.func,
  podeConfirmar: PropTypes.bool,
  confirmando: PropTypes.bool,
};

CardAcompanhamento.defaultProps = {
  podeConfirmar: false,
  confirmando: false,
};

export function SkeletonAcompanhamento() {
  return (
    <div className="acomp-skeleton">
      {[1, 2, 3].map((i) => (
        <div className="acomp-skeleton-card" key={i}>
          <div className="acomp-skeleton-line w80" />
          <div className="acomp-skeleton-line w60" />
          <div className="acomp-skeleton-line w40" />
        </div>
      ))}
    </div>
  );
}

export function VazioAcompanhamento({ mensagem, sub }) {
  return (
    <div className="acomp-vazio">
      <div className="acomp-vazio-icon">📦</div>
      <p className="acomp-vazio-texto">{mensagem || "Nenhuma doação encontrada"}</p>
      {sub && <p className="acomp-vazio-sub">{sub}</p>}
    </div>
  );
}

VazioAcompanhamento.propTypes = {
  mensagem: PropTypes.string,
  sub: PropTypes.string,
};

export default CardAcompanhamento;
