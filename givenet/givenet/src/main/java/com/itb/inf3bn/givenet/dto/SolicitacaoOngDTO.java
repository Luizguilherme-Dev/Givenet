package com.itb.inf3bn.givenet.dto;

import lombok.Data;

@Data
public class SolicitacaoOngDTO {
    private String nome;
    private String cnpj;
    private String email;
    private String telefone;
    private String endereco;
    private String responsavelNome;
    private String senha;
    private String tiposAceitos;
    private String horarios;
}
