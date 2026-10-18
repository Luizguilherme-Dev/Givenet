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
import java.nio.charset.StandardCharsets;
import java.util.Locale;
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
        String nome = dto.getNome() == null ? null : dto.getNome().trim();
        String email = normalizarEmail(dto.getEmail());
        String senha = dto.getSenha();
        String telefone = dto.getTelefone() == null ? null : dto.getTelefone().trim();

        if (nome == null || nome.isBlank() || email == null || email.isBlank()
                || senha == null || senha.length() < 6) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Preencha nome, e-mail e senha com no mínimo 6 caracteres.");
        }
        if (nome.length() > 100 || email.length() > 150
                || (telefone != null && telefone.length() > 20)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Um ou mais campos excedem o tamanho permitido.");
        }
        if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe um e-mail válido.");
        }
        if (senha.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A senha excede o tamanho máximo permitido.");
        }
        if (repository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este e-mail já está cadastrado.");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(nome);
        usuario.setEmail(email);
        usuario.setSenha(encoder.encode(senha));
        usuario.setTelefone(telefone == null || telefone.isBlank() ? null : telefone);
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
        String email = credenciais == null ? null : normalizarEmail(credenciais.get("email"));
        String senha = credenciais == null ? null : credenciais.get("senha");
        if (email == null || email.isBlank() || senha == null || senha.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe e-mail e senha.");
        }
        Optional<Usuario> usuario = repository.findByEmailIgnoreCase(email);
        if (usuario.isPresent() && encoder.matches(senha, usuario.get().getSenha())) {
            usuario.get().setRole(usuario.get().getRole().toUpperCase(Locale.ROOT));
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

    private String normalizarEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
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
