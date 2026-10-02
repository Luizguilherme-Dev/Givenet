package com.itb.inf3bn.givenet.config;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;

import java.security.SecureRandom;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtServiceTest {

    @Test
    void issuesAndValidatesTokenForUser() {
        JwtService jwtService = new JwtService(testSecret(), 60_000);
        String token = jwtService.generateToken(123L);

        assertEquals(123L, jwtService.getUserId(token));
    }

    @Test
    void rejectsExpiredToken() throws InterruptedException {
        JwtService jwtService = new JwtService(testSecret(), 1);
        String token = jwtService.generateToken(123L);
        Thread.sleep(10);

        assertThrows(ExpiredJwtException.class, () -> jwtService.getUserId(token));
    }

    @Test
    void rejectsTokenWithChangedPayload() {
        JwtService jwtService = new JwtService(testSecret(), 60_000);
        String[] tokenParts = jwtService.generateToken(123L).split("\\.");
        String changedPayload = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString("{\"sub\":\"456\"}".getBytes());
        String tamperedToken = tokenParts[0] + "." + changedPayload + "." + tokenParts[2];

        assertThrows(JwtException.class, () -> jwtService.getUserId(tamperedToken));
    }

    private String testSecret() {
        byte[] key = new byte[32];
        new SecureRandom().nextBytes(key);
        return Base64.getEncoder().encodeToString(key);
    }
}
