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

const Doacao = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [ong, setOng] = useState("");
  const [horario, setHorario] = useState("");
  const [itemDoado, setItemDoado] = useState("");
  const [doacoes, setDoacoes] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [excluindoId, setExcluindoId] = useState(null);
  const [aba, setAba] = useState("registrar");
  const navigate = useNavigate();

  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado") || "null");
  const isAdmin = usuarioLogado?.role === "ROLE_ADMIN" || usuarioLogado?.role === "ADMIN";
  const isOng = usuarioLogado?.role === "ROLE_ONG" || usuarioLogado?.role === "ONG";
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
        toast.success("Doação atualizada com sucesso!");
        setEditandoId(null);
      } else {
        await axios.post("http://localhost:8080/doacoes", payload, {
          withCredentials: true,
          headers: { usuarioId: usuarioLogado?.id },
        });
        toast.success("Doação registrada com sucesso!");
      }
      setOng("");
      setHorario("");
      setItemDoado("");
      await fetchDoacoes();
      setAba("agendamentos");
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "Erro ao salvar doação.";
      toast.error(msg);
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
    if (!window.confirm(
      isAdmin
        ? "Deseja excluir este registro de doação? Essa ação não pode ser desfeita."
        : "Deseja deletar esta doação?"
    )) return;
    setExcluindoId(id);
    try {
      await axios.delete(`http://localhost:8080/doacoes/${id}`, {
        headers: { usuarioId: usuarioLogado?.id },
      });
      toast.success("Registro de doação excluído com sucesso!");
      await fetchDoacoes();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "Não foi possível excluir esta doação.";
      toast.error(msg);
    } finally {
      setExcluindoId(null);
    }
  };

  /* ── Ícones puramente decorativos (não interferem em nenhuma lógica) ── */
  const svgProps = {
    className: "field-icon",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    focusable: "false",
  };

  const iconUser = (
    <svg {...svgProps}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );

  const iconMail = (
    <svg {...svgProps}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );

  const iconBuilding = (
    <svg {...svgProps}>
      <path d="M4 22V4a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v18" />
      <path d="M15 10h3a2 2 0 0 1 2 2v10" />
      <path d="M2 22h20" />
      <path d="M8.5 7h2.5M8.5 11h2.5M8.5 15h2.5" />
    </svg>
  );

  const iconBox = (
    <svg {...svgProps}>
      <path d="m21 8-9-5-9 5v8l9 5 9-5V8Z" />
      <path d="m3 8 9 5 9-5" />
      <path d="M12 13v8" />
    </svg>
  );

  return (
    <div className="page-wrapper">
      <AuroraBg />

      <div className="page-content">
        <div className="cadastro-container">
          <span className="donation-eyebrow">Give Net · Plataforma de Doações</span>
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
                background: "rgba(168,85,247,0.18)",
                borderColor: "rgba(168,85,247,0.4)",
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
              <div className="donation-form-head">
                <h3 className="donation-form-title">
                  {editandoId ? "Editar doação" : "Agendar doação"}
                </h3>
                <p className="donation-form-sub">
                  Escolha a organização, o item, a data e o horário para realizar sua doação.
                </p>
              </div>
              <div className="form-group">
                <label className="form-label">Nome</label>
                <div className="field-wrap">
                  {iconUser}
                  <input type="text" className="form-input" value={nome}
                    onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">E-mail</label>
                <div className="field-wrap">
                  {iconMail}
                  <input type="email" className="form-input" value={email}
                    onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">ONG Destino</label>
                <div className="field-wrap">
                  {iconBuilding}
                  <select className="form-input" value={ong} onChange={(e) => { setOng(e.target.value); setHorario(""); }} required>
                  <option value="">Selecione uma ONG</option>
                  <option value="WWF Brasil">WWF Brasil</option>
                  <option value="Instituto Ayrton Senna">Instituto Ayrton Senna</option>
                  <option value="AACD">AACD</option>
                  </select>
                </div>
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
                <div className="field-wrap">
                  {iconBox}
                  <input type="text" className="form-input" value={itemDoado}
                    onChange={(e) => setItemDoado(e.target.value)}
                    placeholder="Ex: Caixas de remédio, roupas infantis..." />
                </div>
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
              <button type="submit" className="btn-cadastrar btn-donacao">
                <span className="btn-donacao-label">
                  {editandoId ? "Salvar Alterações" : "Registrar Doação"}
                </span>
                <span className="btn-donacao-arrow" aria-hidden="true">→</span>
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
                      onConfirmar={(id) => navigate(`/confirmar-doacao?doacao=${encodeURIComponent(id)}`)}
                      podeExcluirConcluidas={isAdmin}
                      onExcluir={handleDelete}
                      excluindo={excluindoId === doacao.id}
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
                  const isEntregue = doacao.status === "CONCLUIDA" || doacao.status === "DOACAO_ENTREGUE";
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
                        {(!isEntregue || isAdmin) && (
                          <button onClick={() => handleDelete(doacao.id)} className="btn-deletar">
                            {excluindoId === doacao.id ? "Excluindo..." : isEntregue ? "Excluir registro" : "Deletar"}
                          </button>
                        )}
                        {podeConfirmar && !isEntregue && (
                          <button
                            onClick={() => navigate(`/confirmar-doacao?doacao=${encodeURIComponent(doacao.id)}`)}
                            className="btn-cadastrar"
                            style={{
                              padding: "6px 14px", fontSize: 12,
                              background: "rgba(168,85,247,0.18)",
                              borderColor: "rgba(168,85,247,0.4)",
                              color: "#4ade80",
                            }}
                          >
                            Confirmar Entrega
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
