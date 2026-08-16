package com.itb.inf3bn.givenet.dto;

import lombok.Data;

@Data
public class OngDTO {
    private String nome;
    private String email;
    private String telefone;
    private String endereco;
    private String tiposAceitos; // ex: "roupa,alimento,eletronico"
    private String horarios;     // ex: "08:00-12:00,14:00-18:00"
    private Boolean aceitaColeta;
    private String restricoes;
}
