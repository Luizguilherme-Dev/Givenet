package com.itb.inf3bn.givenet.auth;

import com.itb.inf3bn.givenet.dto.LoginRequest;
import com.itb.inf3bn.givenet.dto.RefreshTokenRequest;
import com.itb.inf3bn.givenet.dto.TokenResponse;
import com.itb.inf3bn.givenet.model.entity.AuditLog;
import com.itb.inf3bn.givenet.model.entity.Usuario;
import com.itb.inf3bn.givenet.repository.AuditLogRepository;
import com.itb.inf3bn.givenet.repository.UsuarioRepository;
import com.itb.inf3bn.givenet.security.JwtTokenService;
import io.jsonwebtoken.JwtException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {
    private final UsuarioRepository usuarioRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService tokenService;

    public AuthenticationService(UsuarioRepository usuarioRepository,
                                 AuditLogRepository auditLogRepository,
                                 PasswordEncoder passwordEncoder,
                                 JwtTokenService tokenService) {
        this.usuarioRepository = usuarioRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    public TokenResponse authenticate(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.email().trim().toLowerCase())
                .filter(candidate -> passwordEncoder.matches(request.senha(), candidate.getSenha()))
                .orElseThrow(() -> new BadCredentialsException("Credenciais inválidas"));
        return issueTokens(usuario);
    }

    public TokenResponse refresh(RefreshTokenRequest request) {
        try {
            var claims = tokenService.parse(request.refresh_token());
            if (!JwtTokenService.TYPE_REFRESH.equals(tokenService.extractType(claims))) {
                throw new BadCredentialsException("Refresh token inválido");
            }
            Usuario usuario = usuarioRepository.findById(tokenService.extractUserId(claims))
                    .orElseThrow(() -> new BadCredentialsException("Refresh token inválido"));
            return issueTokens(usuario);
        } catch (JwtException | IllegalArgumentException exception) {
            throw new BadCredentialsException("Refresh token inválido ou expirado");
        }
    }

    private TokenResponse issueTokens(Usuario usuario) {
        auditLogRepository.save(AuditLog.builder()
                .usuarioId(usuario.getId())
                .acao("LOGIN")
                .detalhe("Login realizado com sucesso")
                .build());
        return new TokenResponse(
                tokenService.generateAccessToken(usuario),
                tokenService.generateRefreshToken(usuario),
                new TokenResponse.UsuarioResponse(usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getRole())
        );
    }
}
