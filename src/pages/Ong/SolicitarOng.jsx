import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import AuroraBg from "../Shared/AuroraBg";
import "./SolicitarOng.css";

export default function SolicitarOng() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: "", cnpj: "", email: "", telefone: "", endereco: "",
    responsavelNome: "", senha: "", tiposAceitos: "", horarios: "",
  });

  const alterar = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const enviar = async (event) => {
    event.preventDefault();
    try {
      await axios.post("http://localhost:8080/ongs/solicitacoes", form, { withCredentials: true });
      toast.success("Solicitação enviada para análise.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      toast.error(error.response?.data?.message || "Não foi possível enviar a solicitação.");
    }
  };

  return (
    <div className="solicitacao-page">
      <AuroraBg />
      <form className="solicitacao-form" onSubmit={enviar}>
        <h1>Sou uma ONG</h1>
        <p>Envie seus dados. O cadastro ficará pendente até a análise de um administrador.</p>
        {[
          ["nome", "Nome da organização", true], ["cnpj", "CNPJ", false],
          ["email", "E-mail institucional", true], ["telefone", "Telefone", false],
          ["endereco", "Endereço", false], ["responsavelNome", "Nome do responsável", true],
          ["tiposAceitos", "Tipos de doação aceitos", false], ["horarios", "Horários de atendimento", false],
        ].map(([name, placeholder, required]) => (
          <input key={name} name={name} value={form[name]} onChange={alterar} placeholder={placeholder} required={required} />
        ))}
        <input name="senha" value={form.senha} onChange={alterar} type="password" placeholder="Senha da conta da ONG" minLength={6} required />
        <button type="submit">Enviar solicitação</button>
        <Link to="/login">Já possui acesso? Entrar</Link>
      </form>
    </div>
  );
}
