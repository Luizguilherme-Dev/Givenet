package com.itb.inf3bn.givenet.dto;

import lombok.Data;

@Data
public class UsuarioDTO {
    private String nome;
    private String email;
    private String senha;
    private String telefone;
    private String role;
}
