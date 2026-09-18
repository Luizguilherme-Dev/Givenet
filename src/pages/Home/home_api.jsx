import React, { useState, useEffect } from "react";
import api from "axios";
import "./home_api.css";

const HomeApi = () => {
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    api.get("http://172.19.0.49/pizzariaoficial/api/v1/produto")
      .then(({ data }) => setProdutos(Array.isArray(data) ? data : data.produtos ?? data.data ?? []));
  }, []);

  return (
    <div className="container-api">
      <h1 className="titulo-api">Cardápio de Pizzas</h1>

      <div className="produtos-grid">
        {produtos.map((p) => (
          <div key={p.id} className="produto-card">
            <div className="produto-header">
              <h2 className="produto-nome">{p.nome}</h2>
              <span className={`produto-status ${p.codStatus ? "ativo" : "inativo"}`}>
                {p.codStatus ? "Disponível" : "Indisponível"}
              </span>
            </div>

            {p.categoria && (
              <span className="categoria-badge">{p.categoria.nome}</span>
            )}

            <p className="produto-descricao">{p.descricao}</p>

            <div className="produto-footer">
              <span className="produto-preco">
                {p.precoVenda
                  ? `R$ ${p.precoVenda.toFixed(2).replace(".", ",")}`
                  : "Preço não disponível"}
              </span>

              <button className="btn-adicionar" disabled={!p.codStatus}>
                {p.codStatus ? "Adicionar ao Carrinho" : "Indisponível"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeApi;