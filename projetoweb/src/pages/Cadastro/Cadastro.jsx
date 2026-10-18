import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Cadastro.css";
import AuroraBg from "../Shared/AuroraBg";

function Cadastro() {

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nome || !email || !senha || !telefone) {
      toast.warning("Por favor, preencha todos os campos.");
      return;
    }

    if (senha !== confirmarSenha) {
      toast.error("As senhas não coincidem!");
      return;
    }

    if (senha.length < 6) {
      toast.warning("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    try {
      await axios.post("http://localhost:8080/usuarios", {
        nome,
        email,
        senha,
        telefone,
      }, { withCredentials: true });

      toast.success("Cadastro realizado com sucesso!", {
        position: "top-center",
        autoClose: 1500,
      });

      setTimeout(() => {
        navigate("/login");
      }, 1600);
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      toast.error("Erro ao cadastrar. Tente novamente.", {
        position: "top-center",
      });
    }
  };

  return (
    <div className="cadastro-page">
      <AuroraBg />

      <div className="cadastro-form-container">
        <header className="cadastro-page-header">
          <span className="cadastro-header-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="10" cy="7" r="4" />
              <path d="M20 8v6M23 11h-6" />
            </svg>
          </span>
          <div className="cadastro-header-copy">
            <h1>Criar conta</h1>
            <p>Cadastre-se para acompanhar e organizar suas doações.</p>
          </div>
          <span className="cadastro-access-badge">Cadastro de usuário</span>
        </header>

        <form className="cadastro-form" onSubmit={handleSubmit}>
          <div className="cadastro-section-heading">
            <h2>Dados pessoais</h2>
            <p>Preencha os campos abaixo para criar sua conta GiveNet.</p>
          </div>

          <div className="cadastro-fields">
            <div className="cadastro-field">
              <label htmlFor="cadastro-nome">Nome</label>
              <input
                id="cadastro-nome"
                type="text"
                placeholder="Nome Completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="cadastro-field">
              <label htmlFor="cadastro-email">E-mail</label>
              <input
                id="cadastro-email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                required
              />
            </div>

            <div className="cadastro-field">
              <label htmlFor="cadastro-telefone">Telefone</label>
              <input
                id="cadastro-telefone"
                type="tel"
                inputMode="numeric"
                maxLength={11}
                value={telefone}
                onChange={(e) => setTelefone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                required
              />
            </div>

            <div className="cadastro-field">
              <label htmlFor="cadastro-senha">Senha</label>
              <input
                id="cadastro-senha"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={senha}
                onChange={(e) => setSenha(e.target.value.trim())}
                required
              />
            </div>

            <div className="cadastro-field">
              <label htmlFor="cadastro-confirmar-senha">Confirmar senha</label>
              <input
                id="cadastro-confirmar-senha"
                type="password"
                placeholder="Confirmar Senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value.trim())}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-cadastro">
            Cadastrar
          </button>

          <div className="cadastro-footer">
            <p>
              Representa uma organização? <Link to="/sou-uma-ong">Sou uma ONG</Link>
            </p>
            <p>
              Já possui conta? <Link to="/login">Faça login</Link>
            </p>
          </div>
        </form>
      </div>

    </div>
  );
}

export default Cadastro;
