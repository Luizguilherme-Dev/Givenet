package com.itb.inf3bn.givenet.dto;

import lombok.Data;

@Data
public class PerfilUsuarioDTO {
    private String nome;
    private String telefone;
    private String senhaAtual;
    private String novaSenha;
}
