import { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  let usuarioLogado = null;
  try { usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado")); } catch {}

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="header">
      <div
        className={`menu-toggle ${isOpen ? "open" : ""}`}
        onClick={toggleMenu}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className="logo"></div>

      <nav className={`nav ${isOpen ? "open" : ""}`}>
        <Link to="/home" onClick={toggleMenu}>Home</Link>
        <Link to="/Doacao" onClick={toggleMenu}>Doações</Link>
        <Link to="/ong" onClick={toggleMenu}>ONGs</Link>
        <Link to="/Sobre" onClick={toggleMenu}>Sobre</Link>
      </nav>

      <Link to={usuarioLogado ? "/perfil" : "/login"} className="perfil-icon" title={usuarioLogado ? "Meu Perfil" : "Fazer Login"}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
        </svg>
      </Link>
    </header>
  );
};

export default Navbar;
