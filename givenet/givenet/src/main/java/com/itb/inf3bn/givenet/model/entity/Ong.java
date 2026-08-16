package com.itb.inf3bn.givenet.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ong")
@Setter
@Getter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ong {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(length = 100, nullable = false)
    private String nome;

    @Column(length = 150, nullable = true)
    private String email;

    @Column(length = 20, nullable = true)
    private String telefone;

    @Column(length = 255, nullable = true)
    private String endereco;

    // ex: "roupa,alimento,eletronico"
    @Column(length = 255, nullable = true)
    private String tiposAceitos;

    // ex: "08:00-12:00,14:00-18:00"
    @Column(length = 255, nullable = true)
    private String horarios;

    @Column(nullable = false)
    @Builder.Default
    private Boolean aceitaColeta = false;

    @Column(length = 500, nullable = true)
    private String restricoes;
}
