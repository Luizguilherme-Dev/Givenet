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
      toast.warning("⚠️ Por favor, preencha todos os campos.");
      return;
    }

    if (senha !== confirmarSenha) {
      toast.error("❌ As senhas não coincidem!");
      return;
    }

    if (senha.length < 6) {
      toast.warning("⚠️ A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    try {
      await axios.post("http://localhost:8080/usuarios", {
        nome,
        email,
        senha,
        telefone,
      });

      toast.success("✅ Cadastro realizado com sucesso!", {
        position: "top-center",
        autoClose: 1500,
      });

      setTimeout(() => {
        navigate("/login");
      }, 1600);
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      toast.error("❌ Erro ao cadastrar. Tente novamente.", {
        position: "top-center",
      });
    }
  };

  return (
    <div className="cadastro-page">
      <AuroraBg />

      <div className="cadastro-form-container">
        <form className="cadastro-form" onSubmit={handleSubmit}>
          <h2>Criar Conta</h2>
          <p>Preencha os dados para se cadastrar</p>

          <input
            type="text"
            placeholder="Nome Completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            required
          />

          <input
            type="tel"
            placeholder="Telefone (11) 98765-4321"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Senha (mínimo 6 caracteres)"
            value={senha}
            onChange={(e) => setSenha(e.target.value.trim())}
            required
          />

          <input
            type="password"
            placeholder="Confirmar Senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value.trim())}
            required
          />

          <button type="submit" className="btn-cadastro">
            Cadastrar
          </button>

          <div className="cadastro-footer">
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
