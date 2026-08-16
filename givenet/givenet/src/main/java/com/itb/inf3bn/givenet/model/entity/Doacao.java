package com.itb.inf3bn.givenet.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "doacao")
@Setter
@Getter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(length = 100, nullable = false)
    private String nome;

    @Column(length = 150, nullable = false)
    private String email;

    @Column(length = 10, nullable = false)
    private String horario;

    @Column(length = 50, nullable = true)
    private String data;

    @Column(nullable = false)
    private Long usuarioId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ong_id", nullable = false)
    private Ong ong;

    @Column(length = 255, nullable = true)
    private String itensTipo;

    @Column(length = 255, nullable = true)
    private String itemDoado;

    @Column(length = 30, nullable = false)
    @Builder.Default
    private String status = "AGENDADO"; // AGENDADO | DOACAO_ENTREGUE | CANCELADO

    @Column(nullable = true)
    private java.time.LocalDateTime dataEntrega;

    @Column(nullable = true)
    private Long confirmadoPorUsuarioId;

    @Column(length = 4, nullable = true)
    private String pinConfirmacao;
}
