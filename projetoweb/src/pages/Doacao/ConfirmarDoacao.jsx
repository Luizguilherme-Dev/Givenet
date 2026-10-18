import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
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
  const isAdmin = usuarioLogado?.role === "ROLE_ADMIN" || usuarioLogado?.role === "ADMIN";
  const isOng = usuarioLogado?.role === "ROLE_ONG" || usuarioLogado?.role === "ONG";
  const podeConfirmarEntrega = isAdmin || isOng;
  const [searchParams] = useSearchParams();
  const qrDoacaoId = searchParams.get("qr");
  const agendamentoId = searchParams.get("doacao");

  const [doacaoId, setDoacaoId] = useState(agendamentoId || "");
  const [doacao, setDoacao] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [filtros, setFiltros] = useState({ nome: "", item: "", data: "", horario: "", id: "" });
  const [resultadosBusca, setResultadosBusca] = useState([]);
  const [buscandoResultados, setBuscandoResultados] = useState(false);
  const [buscaRealizada, setBuscaRealizada] = useState(false);
  const [metodo, setMetodo] = useState(qrDoacaoId ? "qr" : "pin");
  const [pin, setPin] = useState("");
  const [progresso, setProgresso] = useState("idle");
  const [mostrarQR, setMostrarQR] = useState(false);

  const buscarDoacao = useCallback(async (id) => {
    if (!id) return toast.error("Informe o ID da doação.");
    setBuscando(true);
    setDoacao(null);
    setPin("");
    try {
      const res = await axios.get(`http://localhost:8080/doacoes/${id}`);
      if (res.data.status !== "AGENDADO") {
        toast.warning("Esta doação não está disponível para confirmação.");
        return;
      }
      setDoacao(res.data);
    } catch {
      toast.error("Doação não encontrada ou senha incorreta.");
    } finally {
      setBuscando(false);
    }
  }, []);

  const buscarDoacoes = async () => {
    if (!Object.values(filtros).some((valor) => valor.trim())) {
      return toast.warning("Informe pelo menos um filtro para buscar doações.");
    }

    setBuscandoResultados(true);
    setBuscaRealizada(false);
    setDoacao(null);
    setDoacaoId("");
    setPin("");
    try {
      const params = Object.fromEntries(
        Object.entries(filtros)
          .filter(([, valor]) => valor.trim())
          .map(([campo, valor]) => [campo, valor.trim()])
      );
      const res = await axios.get("http://localhost:8080/doacoes/buscar", { params });
      setResultadosBusca(res.data);
      setBuscaRealizada(true);
    } catch (err) {
      setResultadosBusca([]);
      toast.error(err.response?.data?.message || "Não foi possível buscar as doações.");
    } finally {
      setBuscandoResultados(false);
    }
  };

  const selecionarDoacao = (selecionada) => {
    setDoacao(selecionada);
    setDoacaoId(String(selecionada.id));
    setPin("");
    setMetodo("pin");
    setProgresso("idle");
  };

  const formatarData = (data) => {
    if (!data) return "—";
    const [ano, mes, dia] = data.slice(0, 10).split("-");
    return ano && mes && dia ? `${dia}/${mes}/${ano}` : data;
  };

  const formatarStatus = (status) => {
    switch (status) {
      case "AGENDADO":
        return "Agendada";
      case "DOACAO_ENTREGUE":
        return "Entregue";
      case "CANCELADO":
        return "Cancelada";
      default:
        return status || "—";
    }
  };

  useEffect(() => {
    const id = qrDoacaoId || agendamentoId;
    if (!id) return;
    setDoacaoId(id);
    setMetodo(qrDoacaoId ? "qr" : "pin");
    buscarDoacao(id);
  }, [qrDoacaoId, agendamentoId, buscarDoacao]);

  const pinValido = doacao && pin.length === 4 && pin === doacao.pinConfirmacao;
  const pinCompleto = pin.length === 4;
  const pinErrado = pinCompleto && doacao && pin !== doacao.pinConfirmacao;

  if (!podeConfirmarEntrega) {
    return (
      <div className="conf-page">
        <AuroraBg />
        <div className="conf-container">
          <p className="conf-negado">Acesso restrito a ONGs e administradores.</p>
        </div>
      </div>
    );
  }

  const handleConfirmar = async () => {
    if (!doacao) return;
    if (metodo === "pin" && !pinValido) return toast.error("PIN incorreto.");

    setProgresso("loading");
    try {
      const params = {};

      if (metodo === "pin") {
        params.pin = pin;
      }

      await axios.patch(
        `http://localhost:8080/doacoes/${doacaoId}/confirmar-entrega`,
        {},
        { params }
      );
      setProgresso("concluido");
    } catch (err) {
      setProgresso("idle");
      console.error("Erro confirmar:", err.response);
      const msg = err.response?.data?.message || err.response?.data || "Erro ao confirmar.";
      toast.error(msg);
    }
  };

  const resetar = () => {
    setProgresso("idle");
    setDoacaoId("");
    setDoacao(null);
    setPin("");
  };

  const qrValue = doacaoId
    ? `${window.location.origin}/confirmar-doacao?qr=${encodeURIComponent(doacaoId)}`
    : "https://givenet.app";

  return (
    <div className="conf-page">
      <AuroraBg />
      <div className="conf-container">
        <header className="conf-header">
          <span className="conf-header-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 8.5 12 4l8 4.5v9L12 22l-8-4.5v-9Z" />
              <path d="m4.5 8.7 7.5 4.2 7.5-4.2M12 13v8.5M8 6.2l8 4.6" />
              <path d="m9.5 16 1.7 1.7 3.5-3.5" />
            </svg>
          </span>
          <div className="conf-header-copy">
            <h1 className="conf-titulo">Confirmar entrega</h1>
            <p className="conf-sub">Consulte uma doação e registre sua entrega.</p>
          </div>
          <span className="conf-acesso">Área restrita a ONGs e administradores</span>
        </header>

        {progresso !== "concluido" && (
          <>
            <div className="conf-group conf-filtros">
              <div className="conf-section-heading">
                <h2 className="conf-section-title">Buscar doações</h2>
                <p className="conf-section-sub">Use um ou mais filtros para encontrar doações agendadas.</p>
              </div>
              <div className="conf-filtros-grid">
                <div className="conf-filter-field">
                  <label className="conf-label" htmlFor="conf-filtro-nome">Nome do doador</label>
                  <input
                    className="conf-input"
                    id="conf-filtro-nome"
                    type="text"
                    placeholder="Ex.: Maria Silva"
                    value={filtros.nome}
                    onChange={(e) => setFiltros({ ...filtros, nome: e.target.value })}
                  />
                </div>
                <div className="conf-filter-field">
                  <label className="conf-label" htmlFor="conf-filtro-item">Item doado</label>
                  <input
                    className="conf-input"
                    id="conf-filtro-item"
                    type="text"
                    placeholder="Ex.: alimentos"
                    value={filtros.item}
                    onChange={(e) => setFiltros({ ...filtros, item: e.target.value })}
                  />
                </div>
                <div className="conf-filtros-row">
                  <div className="conf-filter-field">
                    <label className="conf-label" htmlFor="conf-filtro-data">Data</label>
                    <input
                      className="conf-input"
                      id="conf-filtro-data"
                      type="date"
                      aria-label="Data"
                      value={filtros.data}
                      onChange={(e) => setFiltros({ ...filtros, data: e.target.value })}
                    />
                  </div>
                  <div className="conf-filter-field">
                    <label className="conf-label" htmlFor="conf-filtro-horario">Horário</label>
                    <input
                      className="conf-input"
                      id="conf-filtro-horario"
                      type="time"
                      aria-label="Horário"
                      value={filtros.horario}
                      onChange={(e) => setFiltros({ ...filtros, horario: e.target.value })}
                    />
                  </div>
                </div>
                <div className="conf-filter-field">
                  <label className="conf-label" htmlFor="conf-filtro-id">ID da doação</label>
                  <input
                    className="conf-input"
                    id="conf-filtro-id"
                    type="number"
                    min="1"
                    placeholder="Ex.: 12"
                    value={filtros.id}
                    onChange={(e) => setFiltros({ ...filtros, id: e.target.value })}
                  />
                </div>
              </div>
              <button
                className="conf-btn-buscar conf-btn-buscar-lista"
                onClick={buscarDoacoes}
                disabled={buscandoResultados}
              >
                {buscandoResultados ? <span className="conf-spinner" /> : "Buscar doações"}
              </button>

              {buscaRealizada && (
                <div className="conf-resultados">
                  <h3 className="conf-resultados-titulo">
                    {resultadosBusca.length
                      ? `Resultados encontrados (${resultadosBusca.length})`
                      : "Nenhuma doação encontrada"}
                  </h3>
                  {resultadosBusca.map((resultado) => (
                    <article className="conf-resultado-card" key={resultado.id}>
                      <div className="conf-resultado-topo">
                        <strong>Doação #{resultado.id}</strong>
                        <span>{formatarStatus(resultado.status)}</span>
                      </div>
                      <p><b>Doador:</b> {resultado.nome || "—"}</p>
                      <p><b>Item:</b> {resultado.itemDoado || resultado.itensTipo || "—"}</p>
                      <p>
                        <b>Data:</b> {formatarData(resultado.data)}
                        {" · "}
                        <b>Horário:</b> {resultado.horario || "—"}
                      </p>
                      <button
                        className="conf-resultado-selecionar"
                        onClick={() => selecionarDoacao(resultado)}
                      >
                        Selecionar doação
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className="conf-group conf-busca-section">
              <div className="conf-section-heading">
                <h2 className="conf-section-title">Localizar uma doação pelo ID</h2>
                <p className="conf-section-sub">Informe o identificador para localizar uma doação específica.</p>
              </div>
              <label className="conf-label" htmlFor="conf-doacao-id">ID da doação</label>
              <div className="conf-busca-row">
                <input
                  className="conf-input"
                  id="conf-doacao-id"
                  type="number"
                  placeholder="Ex: 12"
                  value={doacaoId}
                  onChange={(e) => { setDoacaoId(e.target.value); setDoacao(null); setPin(""); }}
                  onKeyDown={(e) => e.key === "Enter" && buscarDoacao()}
                />
                <button className="conf-btn-buscar" onClick={() => buscarDoacao(doacaoId)} disabled={buscando || !doacaoId}>
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
                    PIN
                  </button>
                  <button className={`conf-metodo-btn ${metodo === "qr" ? "ativo" : ""}`} onClick={() => setMetodo("qr")}>
                    QR Code
                  </button>
                </div>

                {metodo === "pin" && (
                  <div className="conf-group">
                    <label className="conf-label">
                      Digite o PIN para confirmar
                      {pinErrado && <span className="conf-pin-erro"> — PIN incorreto</span>}
                      {pinValido && <span className="conf-pin-ok"> — Correto</span>}
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
                  disabled={progresso === "loading" || (metodo === "pin" && !pinValido)}
                >
                  {progresso === "loading" ? (
                    <span className="conf-btn-inner"><span className="conf-spinner" /> Confirmando...</span>
                  ) : (
                    "Confirmar Entrega"
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
