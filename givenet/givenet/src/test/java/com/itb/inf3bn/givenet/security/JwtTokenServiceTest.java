package com.itb.inf3bn.givenet.security;

import com.itb.inf3bn.givenet.model.entity.Usuario;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtTokenServiceTest {
    private final JwtProperties properties = new JwtProperties(
            "dGVzdC1vbmx5LWp3dC1zZWNyZXQta2V5LWF0LWxlYXN0LTMyLWJ5dGVzISE=", 900000, 604800000);
    private final JwtTokenService service = new JwtTokenService(properties);
    private final Usuario usuario = Usuario.builder().id(10L).email("user@test.com").role("USER").build();

    @Test
    void accessTokenContainsUserAndType() {
        var claims = service.parse(service.generateAccessToken(usuario));
        assertEquals("10", claims.getSubject());
        assertEquals("user@test.com", claims.get("email", String.class));
        assertEquals(JwtTokenService.TYPE_ACCESS, service.extractType(claims));
        assertEquals("ROLE_USER", service.extractRole(claims));
    }

    @Test
    void refreshTokenHasDifferentType() {
        var accessClaims = service.parse(service.generateAccessToken(usuario));
        var refreshClaims = service.parse(service.generateRefreshToken(usuario));
        assertEquals(JwtTokenService.TYPE_ACCESS, service.extractType(accessClaims));
        assertEquals(JwtTokenService.TYPE_REFRESH, service.extractType(refreshClaims));
    }

    @Test
    void tamperedTokenIsRejected() {
        String token = service.generateAccessToken(usuario);
        String tampered = token.substring(0, token.length() - 2)
                + (token.endsWith("AA") ? "BB" : "AA");
        assertThrows(RuntimeException.class, () -> service.parse(tampered));
    }
}
