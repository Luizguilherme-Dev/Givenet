import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Login.css";
import AuroraBg from "../Shared/AuroraBg";


function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !senha) {
      toast.warning("⚠️ Por favor, preencha todos os campos.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/usuarios/login", { email, senha });
      const usuarioEncontrado = response.data;

      localStorage.setItem("usuarioLogado", JSON.stringify(usuarioEncontrado));

      toast.success(`✅ Bem-vindo, ${usuarioEncontrado.nome}!`, {
        position: "top-center",
        autoClose: 1500,
      });

      setTimeout(() => {
        navigate("/home");
      }, 1600);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("❌ Email ou senha incorretos!", { position: "top-center" });
      } else {
        console.error("Erro ao verificar login:", error);
        toast.error("❌ Erro ao conectar ao servidor.", { position: "top-center" });
      }
    }
  };

  return (
    <div className="login-page">
      <AuroraBg />

      <div className="login-form-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Bem-vindo!</h2>
          <p>Entre na sua conta para continuar</p>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            required
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value.trim())}
            required
          />

          <button type="submit" className="btn-login">
            Entrar
          </button>

          <div className="login-footer">
            <p>
              Não possui conta? <Link to="/cadastro">Cadastre-se aqui</Link>
            </p>
          </div>
        </form>
      </div>

    </div>
  );
}

export default Login;
