package com.itb.inf3bn.givenet.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_log")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long usuarioId;

    @Column(length = 100, nullable = false)
    private String acao; // ex: CRIAR_DOACAO, CANCELAR_DOACAO, CONFIRMAR_ENTREGA

    @Column(length = 255, nullable = true)
    private String detalhe;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime dataHora = LocalDateTime.now();
}
