package com.itb.inf3bn.givenet.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "doacao_status_history")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoacaoStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long doacaoId;

    @Column(length = 30, nullable = false)
    private String statusAnterior;

    @Column(length = 30, nullable = false)
    private String statusNovo;

    @Column(nullable = false)
    private Long alteradoPorUsuarioId;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime dataHora = LocalDateTime.now();
}
