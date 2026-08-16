package com.itb.inf3bn.givenet.dto;

import lombok.Data;

@Data
public class DoacaoDTO {
    private String nome;
    private String email;
    private Long ongId;
    private String horario;
    private String data;
    private Long usuarioId;
    private String itensTipo;
    private String itemDoado;
}
