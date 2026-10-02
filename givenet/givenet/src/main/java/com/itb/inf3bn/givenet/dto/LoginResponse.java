package com.itb.inf3bn.givenet.dto;

public record LoginResponse(
        Long id,
        String nome,
        String email,
        String telefone,
        String role,
        String token) {
}
