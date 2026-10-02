import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import AuroraBg from "../Shared/AuroraBg";
import "./SolicitarOng.css";

const campos = [
  { name: "nome", label: "Nome da organização", required: true },
  { name: "cnpj", label: "CNPJ" },
  { name: "email", label: "E-mail institucional", type: "email", required: true },
  { name: "telefone", label: "Telefone", type: "tel" },
  { name: "endereco", label: "Endereço" },
  { name: "responsavelNome", label: "Nome do responsável", required: true },
  { name: "tiposAceitos", label: "Tipos de doação aceitos" },
  { name: "horarios", label: "Horários de atendimento" },
];

const formularioInicial = {
  nome: "",
  cnpj: "",
  email: "",
  telefone: "",
  endereco: "",
  responsavelNome: "",
  senha: "",
  tiposAceitos: "",
  horarios: "",
};

export default function SolicitarOng() {
  const [form, setForm] = useState(formularioInicial);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const alterar = (event) => {
    const { name, value } = event.target;
    setForm((formAtual) => ({ ...formAtual, [name]: name === "senha" ? value.trim() : value }));
  };

  const enviar = async (event) => {
    event.preventDefault();
    setEnviando(true);

    try {
      await axios.post("http://localhost:8080/ongs/solicitacoes", form, { withCredentials: true });
      setForm(formularioInicial);
      setEnviado(true);
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.detail || "Não foi possível enviar a solicitação.");
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <div className="solicitacao-page">
        <AuroraBg />
        <section className="solicitacao-form solicitacao-confirmacao" role="status">
          <span className="solicitacao-confirmacao-icone" aria-hidden="true">✓</span>
          <h1>Solicitação enviada!</h1>
          <p>
            Recebemos os dados da sua organização. A solicitação será analisada em até
            <strong> 3 dias úteis</strong>. Você poderá acessar a plataforma após a aprovação.
          </p>
          <Link to="/login">Voltar para o login</Link>
        </section>
      </div>
    );
  }

  return (
    <div className="solicitacao-page">
      <AuroraBg />
      <div className="solicitacao-container">
        <form className="solicitacao-form" onSubmit={enviar}>
          <h1>Cadastro de ONG</h1>
          <p>Envie os dados da sua organização para iniciar a análise.</p>

          <div className="solicitacao-fields">
            {campos.map(({ name, label, type = "text", required = false }) => (
              <div className="solicitacao-field" key={name}>
                <label htmlFor={`solicitacao-${name}`}>{label}</label>
                <input
                  id={`solicitacao-${name}`}
                  name={name}
                  type={type}
                  value={form[name]}
                  onChange={alterar}
                  required={required}
                />
              </div>
            ))}
            <div className="solicitacao-field">
              <label htmlFor="solicitacao-senha">Senha da conta</label>
              <input
                id="solicitacao-senha"
                name="senha"
                type="password"
                value={form.senha}
                onChange={alterar}
                minLength={6}
                maxLength={72}
                required
              />
            </div>
          </div>

          <button className="btn-solicitacao" type="submit" disabled={enviando}>
            {enviando ? "Enviando..." : "Enviar solicitação"}
          </button>
          <Link className="solicitacao-login-link" to="/login">Já possui acesso? Entrar</Link>
        </form>
      </div>
    </div>
  );
}
