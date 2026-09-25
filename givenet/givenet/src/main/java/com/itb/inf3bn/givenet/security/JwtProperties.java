package com.itb.inf3bn.givenet.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "givenet.jwt")
public record JwtProperties(
        String secret,
        long expiration,
        long refreshExpiration
) {
    public JwtProperties {
        if (secret == null || secret.isBlank()) {
            throw new IllegalArgumentException("GIVENET_JWT_SECRET deve ser configurado");
        }
        if (expiration <= 0 || refreshExpiration <= 0) {
            throw new IllegalArgumentException("As expirações JWT devem ser maiores que zero");
        }
    }
}
