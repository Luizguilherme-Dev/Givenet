package com.itb.inf3bn.givenet.controller;

import com.itb.inf3bn.givenet.config.JwtService;
import com.itb.inf3bn.givenet.dto.LoginResponse;
import com.itb.inf3bn.givenet.dto.UsuarioDTO;
import com.itb.inf3bn.givenet.model.entity.Usuario;
import com.itb.inf3bn.givenet.repository.AuditLogRepository;
import com.itb.inf3bn.givenet.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class UsuarioControllerAuthTest {

    private final UsuarioRepository usuarioRepository = mock(UsuarioRepository.class);
    private final AuditLogRepository auditLogRepository = mock(AuditLogRepository.class);
    private final JwtService jwtService = new JwtService(testSecret(), 60_000);
    private final UsuarioController controller = new UsuarioController();

    @BeforeEach
    void configurarController() {
        ReflectionTestUtils.setField(controller, "repository", usuarioRepository);
        ReflectionTestUtils.setField(controller, "auditLogRepository", auditLogRepository);
        ReflectionTestUtils.setField(controller, "jwtService", jwtService);
    }

    @Test
    void cadastroNormalizaEmailArmazenaSenhaCriptografadaEIgnoraRoleEnviada() {
        when(usuarioRepository.existsByEmailIgnoreCase("pessoa@example.com")).thenReturn(false);
        when(usuarioRepository.save(any(Usuario.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        UsuarioDTO dto = new UsuarioDTO();
        dto.setNome("  Pessoa  ");
        dto.setEmail(" Pessoa@Example.com ");
        dto.setSenha("senha123");
        dto.setTelefone(" 11999999999 ");
        dto.setRole("ADMIN");

        Usuario criado = controller.criar(dto);

        assertThat(criado.getNome()).isEqualTo("Pessoa");
        assertThat(criado.getEmail()).isEqualTo("pessoa@example.com");
        assertThat(criado.getTelefone()).isEqualTo("11999999999");
        assertThat(criado.getRole()).isEqualTo("USER");
        assertThat(criado.getSenha()).isNotEqualTo("senha123");
        assertThat(new BCryptPasswordEncoder().matches("senha123", criado.getSenha())).isTrue();
        verify(usuarioRepository).existsByEmailIgnoreCase("pessoa@example.com");
    }

    @Test
    void cadastroRejeitaEmailDuplicadoSemSalvar() {
        when(usuarioRepository.existsByEmailIgnoreCase("pessoa@example.com")).thenReturn(true);

        assertThatThrownBy(() -> controller.criar(usuarioDTO(
                "Pessoa", "PESSOA@example.com", "senha123")))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("já está cadastrado");
    }

    @Test
    void cadastroRejeitaDadosObrigatoriosInvalidos() {
        assertThatThrownBy(() -> controller.criar(usuarioDTO(
                "Pessoa", "email-invalido", "123")))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("no mínimo 6 caracteres");
    }

    @Test
    void loginAceitaEmailComEspacosEMaiusculasERetornaToken() {
        Usuario usuario = new Usuario();
        usuario.setId(42L);
        usuario.setNome("Pessoa");
        usuario.setEmail("pessoa@example.com");
        usuario.setSenha(new BCryptPasswordEncoder().encode("senha123"));
        usuario.setRole("USER");
        when(usuarioRepository.findByEmailIgnoreCase("pessoa@example.com"))
                .thenReturn(Optional.of(usuario));

        var resposta = controller.login(Map.of(
                "email", " PESSOA@Example.com ",
                "senha", "senha123"));

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resposta.getBody()).isInstanceOf(LoginResponse.class);
        LoginResponse corpo = (LoginResponse) resposta.getBody();
        assertThat(corpo.id()).isEqualTo(42L);
        assertThat(corpo.token()).isNotBlank();
        verify(auditLogRepository).save(any());
        verify(usuarioRepository).findByEmailIgnoreCase("pessoa@example.com");
    }

    private UsuarioDTO usuarioDTO(String nome, String email, String senha) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setNome(nome);
        dto.setEmail(email);
        dto.setSenha(senha);
        return dto;
    }

    private static String testSecret() {
        byte[] key = new byte[32];
        new SecureRandom().nextBytes(key);
        return Base64.getEncoder().encodeToString(key);
    }
}
