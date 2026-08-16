import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Doacao.css";
import AuroraBg from "../Shared/AuroraBg";
import {
  CardAcompanhamento,
  SkeletonAcompanhamento,
  VazioAcompanhamento,
} from "../Acompanhamento/AcompanhamentoDoacao";

const ONG_IDS = {
  "WWF Brasil": 1,
  "Instituto Ayrton Senna": 2,
  "AACD": 3,
};

const gerarSlots = (inicio, fim) => {
  const slots = [];
  let [h, m] = inicio.split(":").map(Number);
  const [hf, mf] = fim.split(":").map(Number);
  while (h < hf || (h === hf && m < mf)) {
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    m += 30;
    if (m >= 60) { h++; m = 0; }
  }
  return slots;
};

const horariosPorONG = {
  "WWF Brasil": [...gerarSlots("08:00", "12:00"), ...gerarSlots("14:00", "18:00")],
  "Instituto Ayrton Senna": gerarSlots("09:00", "17:00"),
  "AACD": gerarSlots("08:00", "16:00"),
};

const aceitaPorONG = {
  "WWF Brasil": ["Roupas", "Alimentos", "Eletrônicos"],
  "Instituto Ayrton Senna": ["Roupas", "Material escolar"],
  "AACD": ["Cadeira de rodas", "Muletas", "Equipamentos de reabilitação"],
};

function ModalPin({ onConfirmar, onCancelar, loading }) {
  const [pin, setPin] = useState("");
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3 className="modal-titulo">Confirmar via PIN</h3>
        <p className="modal-desc">Digite o PIN de 4 dígitos da doação para confirmar a entrega.</p>
        <input
          type="text"
          className="modal-input"
          placeholder="0000"
          value={pin}
          maxLength={4}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && pin.length === 4 && onConfirmar(pin)}
          style={{ letterSpacing: 12, textAlign: "center", fontSize: "1.6rem", fontWeight: 800 }}
          autoFocus
        />
        <div className="modal-acoes">
          <button className="modal-btn-cancelar" onClick={onCancelar} disabled={loading}>Cancelar</button>
          <button
            className="modal-btn-confirmar"
            onClick={() => onConfirmar(pin)}
            disabled={loading || pin.length !== 4}
          >
            {loading ? (
              <span className="modal-btn-inner"><span className="modal-spinner" />Confirmando...</span>
            ) : "✅ Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalConfirmarEntrega({ onConfirmar, onCancelar, loading, isOng }) {
  const [senha, setSenha] = useState("");
  const [pin, setPin] = useState("");
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3 className="modal-titulo">Confirmar Entrega</h3>
        <p className="modal-desc">
          {isOng
            ? "Informe sua senha e o PIN de 4 dígitos da doação."
            : "Informe sua senha de administrador para confirmar a entrega."}
        </p>
        <input
          type="password"
          className="modal-input"
          placeholder="Sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          autoFocus
        />
        <input
          type="text"
          className="modal-input"
          placeholder="PIN de 4 dígitos (opcional)"
          value={pin}
          maxLength={4}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && (senha || pin) && onConfirmar(senha, pin)}
          style={{ marginTop: 8, letterSpacing: 8, textAlign: "center", fontSize: "1.2rem" }}
        />
        <div className="modal-acoes">
          <button className="modal-btn-cancelar" onClick={onCancelar} disabled={loading}>
            Cancelar
          </button>
          <button
            className="modal-btn-confirmar"
            onClick={() => onConfirmar(senha, pin)}
            disabled={loading || (!senha && !pin)}
          >
            {loading ? (
              <span className="modal-btn-inner">
                <span className="modal-spinner" />
                Confirmando...
              </span>
            ) : "✅ Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}

const Doacao = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [ong, setOng] = useState("");
  const [horario, setHorario] = useState("");
  const [itemDoado, setItemDoado] = useState("");
  const [doacoes, setDoacoes] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmando, setConfirmando] = useState(null);
  const [modalDoacaoId, setModalDoacaoId] = useState(null);
  const [modalPinId, setModalPinId] = useState(null);
  const [aba, setAba] = useState("registrar");
  const navigate = useNavigate();

  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado") || "null");
  const isAdmin = usuarioLogado?.role === "ADMIN";
  const isOng = usuarioLogado?.role === "ONG";
  const podeConfirmar = isAdmin || isOng;

  const fetchDoacoes = useCallback(async () => {
    if (!usuarioLogado?.id) return;
    setLoading(true);
    try {
      const resMinha = await axios.get(`http://localhost:8080/doacoes/usuario/${usuarioLogado.id}`, {
        headers: { usuarioId: usuarioLogado.id },
      });
      setDoacoes(resMinha.data);
    } catch (err) {
      console.error("Erro ao buscar doações:", err);
    } finally {
      setLoading(false);
    }
  }, [usuarioLogado?.id]);

  useEffect(() => {
    if (usuarioLogado) {
      setNome(usuarioLogado.nome || "");
      setEmail(usuarioLogado.email || "");
      fetchDoacoes();
    }
  }, [fetchDoacoes]);

  const aceitaItens = ong ? aceitaPorONG[ong] || [] : [];
  const horariosDisponiveis = ong ? horariosPorONG[ong] || [] : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      nome,
      email,
      ongId: ONG_IDS[ong],
      horario,
      data: new Date().toISOString(),
      usuarioId: usuarioLogado?.id,
      itemDoado: itemDoado || null,
    };
    try {
      if (editandoId) {
        await axios.put(`http://localhost:8080/doacoes/${editandoId}`, payload, {
          headers: { usuarioId: usuarioLogado?.id },
        });
        toast.success("✅ Doação atualizada com sucesso!");
        setEditandoId(null);
      } else {
        await axios.post("http://localhost:8080/doacoes", payload);
        toast.success("✅ Doação registrada com sucesso!");
      }
      setOng("");
      setHorario("");
      setItemDoado("");
      await fetchDoacoes();
      setAba("agendamentos");
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "Erro ao salvar doação.";
      toast.error(`❌ ${msg}`);
    }
  };

  const handleEdit = (doacao) => {
    setEditandoId(doacao.id);
    setNome(doacao.nome);
    setEmail(doacao.email);
    setOng(typeof doacao.ong === "object" ? doacao.ong?.nome : doacao.ong || "");
    setHorario(doacao.horario);
    setItemDoado(doacao.itemDoado || "");
    setAba("registrar");
  };

  const handleCancelarEdicao = () => {
    setEditandoId(null);
    setNome(usuarioLogado?.nome || "");
    setEmail(usuarioLogado?.email || "");
    setOng("");
    setHorario("");
    setItemDoado("");
    setAba("registrar");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja deletar esta doação?")) return;
    try {
      await axios.delete(`http://localhost:8080/doacoes/${id}`, {
        headers: { usuarioId: usuarioLogado?.id },
      });
      toast.success("🗑️ Doação deletada com sucesso!");
      fetchDoacoes();
    } catch (err) {
      toast.error("❌ Não foi possível deletar esta doação.");
    }
  };

  const handleConfirmarEntrega = async (senha, pin) => {
    if (!senha && !pin) return;
    if (!modalDoacaoId) return;
    setConfirmando(modalDoacaoId);
    const headers = isOng
      ? { usuarioId: usuarioLogado?.id, usuarioSenha: senha }
      : { usuarioId: usuarioLogado?.id, adminEmail: usuarioLogado?.email, adminSenha: senha };
    try {
      await axios.patch(
        `http://localhost:8080/doacoes/${modalDoacaoId}/confirmar-entrega`,
        {},
        { headers, params: pin ? { pin } : {} }
      );
      toast.success("✅ Entrega confirmada com sucesso!");
      setModalDoacaoId(null);
      fetchDoacoes();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "Erro ao confirmar entrega.";
      toast.error(`❌ ${msg}`);
    } finally {
      setConfirmando(null);
    }
  };

  const handleConfirmarViaPin = async (pin) => {
    if (!pin || pin.length !== 4 || !modalPinId) return;
    setConfirmando(modalPinId);
    try {
      await axios.patch(
        `http://localhost:8080/doacoes/${modalPinId}/confirmar-entrega`,
        {},
        { params: { pin } }
      );
      toast.success("✅ Entrega confirmada via PIN!");
      setModalPinId(null);
      fetchDoacoes();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "PIN inválido ou erro ao confirmar.";
      toast.error(`❌ ${msg}`);
    } finally {
      setConfirmando(null);
    }
  };

  return (
    <div className="page-wrapper">
      <AuroraBg />

      {modalDoacaoId && (
        <ModalConfirmarEntrega
          loading={confirmando === modalDoacaoId}
          onConfirmar={handleConfirmarEntrega}
          onCancelar={() => setModalDoacaoId(null)}
          isOng={isOng}
        />
      )}

      {modalPinId && (
        <ModalPin
          loading={confirmando === modalPinId}
          onConfirmar={handleConfirmarViaPin}
          onCancelar={() => setModalPinId(null)}
        />
      )}

      <div className="page-content">
        <div className="cadastro-container">
          <h2 className="cadastro-title">
            {editandoId ? "Editar Doação" : "Doações"}
          </h2>
          <p className="cadastro-subtitle">Give Net - Plataforma de Doações</p>

          {isAdmin && (
            <button
              type="button"
              className="btn-cadastrar"
              style={{
                marginBottom: 8,
                background: "rgba(34,197,94,0.18)",
                borderColor: "rgba(34,197,94,0.4)",
                color: "#4ade80",
                fontSize: "1rem",
              }}
              onClick={() => navigate("/confirmar-doacao")}
            >
              Confirmar Entrega de Doação
            </button>
          )}

          <div className="tabs">
            <button
              type="button"
              className={`tab-btn ${aba === "registrar" ? "active" : ""}`}
              onClick={() => setAba("registrar")}
            >
              Registrar
            </button>
            <button
              type="button"
              className={`tab-btn ${aba === "agendamentos" ? "active" : ""}`}
              onClick={() => { setAba("agendamentos"); fetchDoacoes(); }}
            >
              Meus Agendamentos
            </button>
            <button
              type="button"
              className={`tab-btn ${aba === "lista" ? "active" : ""}`}
              onClick={() => setAba("lista")}
            >
              Lista Simples
            </button>
          </div>

          {aba === "registrar" && (
            <form onSubmit={handleSubmit} className="cadastro-form">
              <div className="form-group">
                <label className="form-label">Nome</label>
                <input type="text" className="form-input" value={nome}
                  onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" required />
              </div>
              <div className="form-group">
                <label className="form-label">E-mail</label>
                <input type="email" className="form-input" value={email}
                  onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required />
              </div>
              <div className="form-group">
                <label className="form-label">ONG Destino</label>
                <select className="form-input" value={ong} onChange={(e) => { setOng(e.target.value); setHorario(""); }} required>
                  <option value="">Selecione uma ONG</option>
                  <option value="WWF Brasil">WWF Brasil</option>
                  <option value="Instituto Ayrton Senna">Instituto Ayrton Senna</option>
                  <option value="AACD">AACD</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">O que essa ONG aceita</label>
                {aceitaItens.length === 0 ? (
                  <div className="ong-aceita">Selecione uma ONG para ver as doações aceitas.</div>
                ) : (
                  <div className="ong-chips">
                    {aceitaItens.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={`ong-chip ${itemDoado === item ? "ong-chip-ativo" : ""}`}
                        onClick={() => setItemDoado(itemDoado === item ? "" : item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Item que será doado</label>
                <input type="text" className="form-input" value={itemDoado}
                  onChange={(e) => setItemDoado(e.target.value)}
                  placeholder="Ex: Caixas de remédio, roupas infantis..." />
              </div>
              <div className="form-group">
                <label className="form-label">Horário de Coleta</label>
                <div className="ong-chips">
                  {horariosDisponiveis.length === 0 ? (
                    <div className="ong-aceita">Selecione uma ONG para ver os horários disponíveis.</div>
                  ) : (
                    horariosDisponiveis.map((h) => (
                      <button
                        key={h}
                        type="button"
                        className={`ong-chip ${horario === h ? "ong-chip-ativo" : ""}`}
                        onClick={() => setHorario(horario === h ? "" : h)}
                      >
                        {h}
                      </button>
                    ))
                  )}
                </div>
                {horario && <span className="horario-preview">Coleta agendada para às {horario}h</span>}
              </div>
              <button type="submit" className="btn-cadastrar">
                {editandoId ? "Salvar Alterações" : "Registrar Doação"}
              </button>
              {editandoId && (
                <button type="button" onClick={handleCancelarEdicao}
                  className="btn-deletar" style={{ marginTop: 8, width: "100%" }}>
                  Cancelar Edição
                </button>
              )}
            </form>
          )}

          {aba === "agendamentos" && (
            <>
              <h3 className="lista-titulo">Meus Agendamentos</h3>
              {loading ? (
                <SkeletonAcompanhamento />
              ) : doacoes.length === 0 ? (
                <VazioAcompanhamento
                  mensagem="Nenhum agendamento encontrado"
                  sub="Registre sua primeira doação na aba Registrar."
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {doacoes.map((doacao) => (
                    <CardAcompanhamento
                      key={doacao.id}
                      doacao={doacao}
                      podeConfirmar={podeConfirmar}
                      onConfirmar={(id) => setModalDoacaoId(id)}
                      onConfirmarPin={(id) => setModalPinId(id)}
                      confirmando={confirmando === doacao.id}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {aba === "lista" && (
            <>
              <h3 className="lista-titulo">Doações Registradas</h3>
              <ul className="pacientes-lista">
                {doacoes.length === 0 && (
                  <li style={{ color: "#6b7280", textAlign: "center", padding: 20, listStyle: "none" }}>
                    Nenhuma doação registrada.
                  </li>
                )}
                {doacoes.map((doacao) => {
                  const nomeOng = typeof doacao.ong === "object" ? doacao.ong?.nome : doacao.ong;
                  const isEntregue = doacao.status === "DOACAO_ENTREGUE";
                  return (
                    <li key={doacao.id} className="paciente-card">
                      <div>
                        <div className="paciente-nome">{doacao.nome}</div>
                        <div className="paciente-info">E-mail: {doacao.email}</div>
                        <div className="paciente-info">ONG: {nomeOng}</div>
                        <div className="paciente-info">Horário: {doacao.horario}</div>
                        {doacao.itemDoado && (
                          <div className="paciente-info">Item: {doacao.itemDoado}</div>
                        )}
                        <div className="paciente-info">
                          Status:{" "}
                          <strong style={{ color: isEntregue ? "#4ade80" : "#c084fc" }}>
                            {isEntregue ? "Entregue" : doacao.status}
                          </strong>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
                        {!isEntregue && (
                          <button onClick={() => handleEdit(doacao)} className="btn-cadastrar"
                            style={{ padding: "6px 14px", fontSize: 13 }}>
                            Editar
                          </button>
                        )}
                        {!isEntregue && (
                          <button onClick={() => handleDelete(doacao.id)} className="btn-deletar">
                            Deletar
                          </button>
                        )}
                        {podeConfirmar && !isEntregue && (
                          <button
                            onClick={() => setModalDoacaoId(doacao.id)}
                            className="btn-cadastrar"
                            style={{
                              padding: "6px 14px", fontSize: 12,
                              background: "rgba(34,197,94,0.18)",
                              borderColor: "rgba(34,197,94,0.4)",
                              color: "#4ade80",
                            }}
                            disabled={confirmando === doacao.id}
                          >
                            {confirmando === doacao.id ? "..." : "✅ Confirmar"}
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Doacao;
