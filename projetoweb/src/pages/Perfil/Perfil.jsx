import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Perfil.css";
import AuroraBg from "../Shared/AuroraBg";

function Perfil() {

  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(() => {
    try { return JSON.parse(localStorage.getItem("usuarioLogado")) || null; } catch { return null; }
  });
  const [doacoes, setDoacoes] = useState([]);
  const [foto, setFoto] = useState(null);

  useEffect(() => {
    if (!usuario?.id) {
      navigate("/login", { replace: true });
      return;
    }
    setFoto(localStorage.getItem(`foto_${usuario.id}`) || null);

    axios.get(`http://localhost:8080/doacoes/usuario/${usuario.id}`, {
        headers: { usuarioId: usuario.id },
      })
      .then(res => setDoacoes(res.data))
      .catch(() => toast.error("❌ Erro ao carregar histórico de doações."));
  }, [usuario?.id, navigate]);

  if (!usuario) return null;

  const ongs = [...new Set(doacoes.map(d => d.ong?.nome ?? d.ong).filter(Boolean))];

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setFoto(base64);
      localStorage.setItem(`foto_${usuario.id}`, base64);
      toast.success("✅ Foto atualizada!");
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("usuarioLogado");
    } catch {}
    toast.success("✅ Você saiu com sucesso!");
    navigate("/login", { replace: true });
  };


  return (
    <div className="perfil-page">
      <AuroraBg />

      <div className="perfil-content">

        <div className="perfil-card perfil-header-card">
          <div className="perfil-avatar-wrapper" onClick={() => document.getElementById("input-foto").click()}>
            {foto
              ? <img src={foto} alt="avatar" className="perfil-avatar perfil-avatar-img" />
              : <div className="perfil-avatar">{usuario.nome?.[0]?.toUpperCase() ?? "?"}</div>
            }
            <div className="perfil-avatar-overlay">📷</div>
            <input id="input-foto" type="file" accept="image/*" style={{ display: "none" }} onChange={handleFotoChange} />
          </div>
          <div>
            <h1 className="perfil-nome">{usuario.nome}</h1>
            <p className="perfil-email">{usuario.email}</p>
          </div>

          <button type="button" className="perfil-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>


        <div className="perfil-stats">
          <div className="perfil-stat-card">
            <span className="perfil-stat-valor">{doacoes.length}</span>
            <span className="perfil-stat-label">Doações realizadas</span>
          </div>
          <div className="perfil-stat-card">
            <span className="perfil-stat-valor">{ongs.length}</span>
            <span className="perfil-stat-label">ONGs apoiadas</span>
          </div>
          <div className="perfil-stat-card">
            <span className="perfil-stat-valor">
              {doacoes.length > 0
                ? new Date(doacoes[doacoes.length - 1].data).toLocaleDateString("pt-BR")
                : "—"}
            </span>
            <span className="perfil-stat-label">Última doação</span>
          </div>
        </div>

        <div className="perfil-card">
          <h2 className="perfil-section-title">📋 Histórico de Doações</h2>
          {doacoes.length === 0 ? (
            <p className="perfil-vazio">Nenhuma doação registrada ainda.</p>
          ) : (
            <ul className="perfil-lista">
              {doacoes.map(d => (
                <li key={d.id} className="perfil-doacao-item">
                  <div className="perfil-doacao-ong">🏢 {d.ong?.nome ?? d.ong}</div>
                  <div className="perfil-doacao-info">
                    <span>🕒 {d.horario}h</span>
                    <span>📅 {new Date(d.data).toLocaleDateString("pt-BR")}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {ongs.length > 0 && (
          <div className="perfil-card">
            <h2 className="perfil-section-title">💜 ONGs que você apoiou</h2>
            <div className="perfil-ongs">
              {ongs.map(ong => (
                <span key={ong} className="perfil-ong-tag">{ong}</span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Perfil;
