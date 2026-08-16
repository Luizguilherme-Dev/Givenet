package com.itb.inf3bn.givenet.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chat")
@Setter
@Getter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(length = 100, nullable = true)
    private String usuario;

    @Column(length = 500, nullable = false)
    private String mensagem;

    @Column(length = 50, nullable = true)
    private String data;
}
