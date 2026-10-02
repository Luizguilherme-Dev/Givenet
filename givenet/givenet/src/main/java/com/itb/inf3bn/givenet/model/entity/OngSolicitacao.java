package com.itb.inf3bn.givenet.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "ong_solicitacao")
@Getter
@Setter
@NoArgsConstructor
public class OngSolicitacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100, nullable = false)
    private String nome;

    @Column(length = 20)
    private String cnpj;

    @Column(length = 150, nullable = false)
    private String email;

    @Column(length = 20)
    private String telefone;

    @Column(length = 255)
    private String endereco;

    @Column(name = "responsavel_nome", length = 100, nullable = false)
    private String responsavelNome;

    @JsonIgnore
    @Column(name = "senha_hash", length = 255, nullable = false)
    private String senhaHash;

    @Column(name = "tipos_aceitos", length = 255)
    private String tiposAceitos;

    @Column(length = 255)
    private String horarios;

    @Column(length = 20, nullable = false)
    private String status;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm;
}
