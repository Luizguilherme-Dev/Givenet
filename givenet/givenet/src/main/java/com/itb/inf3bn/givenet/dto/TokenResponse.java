package com.itb.inf3bn.givenet.dto;

public record TokenResponse(String access_token, String refresh_token, UsuarioResponse usuario) {
    public record UsuarioResponse(Long id, String nome, String email, String role) {
    }
}
