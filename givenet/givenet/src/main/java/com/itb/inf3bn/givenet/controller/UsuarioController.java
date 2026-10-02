package com.itb.inf3bn.givenet.controller;

import com.itb.inf3bn.givenet.config.AuthenticatedUser;
import com.itb.inf3bn.givenet.config.JwtService;
import com.itb.inf3bn.givenet.dto.LoginResponse;
import com.itb.inf3bn.givenet.dto.PerfilUsuarioDTO;
import com.itb.inf3bn.givenet.dto.UsuarioDTO;
import com.itb.inf3bn.givenet.model.entity.AuditLog;
import com.itb.inf3bn.givenet.model.entity.Usuario;
import com.itb.inf3bn.givenet.repository.AuditLogRepository;
import com.itb.inf3bn.givenet.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private JwtService jwtService;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @GetMapping
    public List<Usuario> listar() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Usuario buscar(@PathVariable Long id, @AuthenticationPrincipal AuthenticatedUser solicitante) {
        if (!solicitante.id().equals(id) && !"ADMIN".equals(solicitante.role())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado");
        }
        return repository.findById(id).orElseThrow();
    }

    @PostMapping
    public Usuario criar(@RequestBody UsuarioDTO dto) {
        Usuario usuario = new Usuario();
        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());
        usuario.setSenha(encoder.encode(dto.getSenha()));
        usuario.setTelefone(dto.getTelefone());
        usuario.setRole("USER");
        return repository.save(usuario);
    }

    @PutMapping("/{id}/perfil")
    public Usuario atualizarPerfil(@PathVariable Long id,
                                   @AuthenticationPrincipal AuthenticatedUser solicitante,
                                   @RequestBody PerfilUsuarioDTO dto) {
        if (!id.equals(solicitante.id())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado");
        }

        Usuario usuario = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        if (dto.getSenhaAtual() == null || !encoder.matches(dto.getSenhaAtual(), usuario.getSenha())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Senha atual incorreta");
        }

        if (dto.getNome() == null || dto.getNome().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome é obrigatório");
        }

        usuario.setNome(dto.getNome().trim());
        usuario.setTelefone(dto.getTelefone());
        if (dto.getNovaSenha() != null && !dto.getNovaSenha().isBlank()) {
            usuario.setSenha(encoder.encode(dto.getNovaSenha()));
        }

        auditLogRepository.save(AuditLog.builder()
                .usuarioId(id)
                .acao("ATUALIZAR_PERFIL")
                .detalhe("Usuário atualizou o próprio perfil")
                .build());

        return repository.save(usuario);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credenciais) {
        String email = credenciais.get("email");
        String senha = credenciais.get("senha");
        Optional<Usuario> usuario = repository.findByEmail(email);
        if (usuario.isPresent() && encoder.matches(senha, usuario.get().getSenha())) {
            usuario.get().setRole(usuario.get().getRole().toUpperCase());
            if ("BLOQUEADO".equals(usuario.get().getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Conta bloqueada. Entre em contato com o suporte.");
            }
            auditLogRepository.save(AuditLog.builder()
                    .usuarioId(usuario.get().getId())
                    .acao("LOGIN")
                    .detalhe("Login realizado com sucesso")
                    .build());
            Usuario autenticado = usuario.get();
            return ResponseEntity.ok(new LoginResponse(
                    autenticado.getId(),
                    autenticado.getNome(),
                    autenticado.getEmail(),
                    autenticado.getTelefone(),
                    autenticado.getRole(),
                    jwtService.generateToken(autenticado.getId())));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email ou senha incorretos");
    }

    @PutMapping("/{id}")
    public Usuario atualizar(@PathVariable Long id,
                             @RequestBody UsuarioDTO dto) {
        Usuario usuario = repository.findById(id).orElseThrow();
        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());
        if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
            usuario.setSenha(encoder.encode(dto.getSenha()));
        }
        usuario.setTelefone(dto.getTelefone());
        auditLogRepository.save(AuditLog.builder()
                .usuarioId(id)
                .acao("ATUALIZAR_USUARIO")
                .detalhe("Admin atualizou usuário id=" + id)
                .build());
        return repository.save(usuario);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        auditLogRepository.save(AuditLog.builder()
                .usuarioId(id)
                .acao("DELETAR_USUARIO")
                .detalhe("Admin deletou usuário id=" + id)
                .build());
        repository.deleteById(id);
    }
}
