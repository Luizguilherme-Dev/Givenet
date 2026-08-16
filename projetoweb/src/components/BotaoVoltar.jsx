import { useNavigate, useLocation } from "react-router-dom";
import "./BotaoVoltar.css";

const OCULTAR_EM = ["/", "/home", "/home_api"];

function BotaoVoltar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (OCULTAR_EM.includes(pathname.toLowerCase())) return null;

  return (
    <button className="btn-voltar" onClick={() => navigate(-1)} aria-label="Voltar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      <span>Voltar</span>
    </button>
  );
}

export default BotaoVoltar;
