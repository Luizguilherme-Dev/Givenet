import { useEffect, useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Admin() {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado") || "null");
  const admin = usuario?.role === "ROLE_ADMIN" || usuario?.role === "ADMIN";
  const [ongs, setOngs] = useState([]);

  const carregar = async () => {
    try {
      const response = await axios.get("http://localhost:8080/ongs/solicitacoes", { withCredentials: true });
      setOngs(response.data);
    } catch {
      toast.error("Não foi possível carregar as solicitações.");
    }
  };

  useEffect(() => { if (admin) carregar(); }, [admin]);

  if (!admin) return <Navigate to="/" replace />;

  const alterarStatus = async (id, acao) => {
    try {
      await axios.patch(`http://localhost:8080/ongs/admin/${id}/${acao}`, {}, { withCredentials: true });
      toast.success("Solicitação atualizada.");
      carregar();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operação não autorizada.");
    }
  };

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: 32 }}>
      <h1>Solicitações de ONG</h1>
      <p>Somente administradores podem aprovar, recusar ou bloquear organizações.</p>
      {ongs.map((ong) => (
        <article key={ong.id} style={{ border: "1px solid #ddd", padding: 20, margin: "12px 0" }}>
          <h2>{ong.nome}</h2>
          <p>{ong.email} · {ong.responsavelNome}</p>
          <strong>{ong.status || "PENDENTE"}</strong>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            {ong.status === "PENDENTE" && <>
              <button onClick={() => alterarStatus(ong.id, "aprovar")}>Aprovar</button>
              <button onClick={() => alterarStatus(ong.id, "recusar")}>Recusar</button>
            </>}
            {ong.status === "APROVADA" && <button onClick={() => alterarStatus(ong.id, "bloquear")}>Bloquear</button>}
          </div>
        </article>
      ))}
    </main>
  );
}
