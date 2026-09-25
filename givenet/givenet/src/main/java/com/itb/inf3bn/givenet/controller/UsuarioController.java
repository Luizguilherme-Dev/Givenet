package com.itb.inf3bn.givenet.controller;

import com.itb.inf3bn.givenet.dto.PerfilUsuarioDTO;
import com.itb.inf3bn.givenet.dto.UsuarioDTO;
import com.itb.inf3bn.givenet.model.entity.AuditLog;
import com.itb.inf3bn.givenet.model.entity.Usuario;
import com.itb.inf3bn.givenet.repository.AuditLogRepository;
import com.itb.inf3bn.givenet.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Usuario> listar() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Usuario buscar(@PathVariable Long id,
                          @AuthenticationPrincipal Long usuarioAutenticado) {
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !usuarioAutenticado.equals(id)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado");
        }
        return repository.findById(id).orElseThrow();
    }

    @PostMapping
    public Usuario criar(@RequestBody UsuarioDTO dto) {
        Usuario usuario = new Usuario();
        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());
        usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
        usuario.setTelefone(dto.getTelefone());
        usuario.setRole("USER");
        return repository.save(usuario);
    }

    @PutMapping("/{id}/perfil")
    public Usuario atualizarPerfil(@PathVariable Long id,
                                   @AuthenticationPrincipal Long usuarioAutenticado,
                                   @RequestBody PerfilUsuarioDTO dto) {
        if (!id.equals(usuarioAutenticado)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado");
        }

        Usuario usuario = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        if (dto.getSenhaAtual() == null || !passwordEncoder.matches(dto.getSenhaAtual(), usuario.getSenha())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Senha atual incorreta");
        }

        if (dto.getNome() == null || dto.getNome().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome é obrigatório");
        }

        usuario.setNome(dto.getNome().trim());
        usuario.setTelefone(dto.getTelefone());
        if (dto.getNovaSenha() != null && !dto.getNovaSenha().isBlank()) {
            usuario.setSenha(passwordEncoder.encode(dto.getNovaSenha()));
        }

        auditLogRepository.save(AuditLog.builder()
                .usuarioId(id)
                .acao("ATUALIZAR_PERFIL")
                .detalhe("Usuário atualizou o próprio perfil")
                .build());

        return repository.save(usuario);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Usuario atualizar(@PathVariable Long id,
                             @RequestBody UsuarioDTO dto) {
        Usuario usuario = repository.findById(id).orElseThrow();
        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());
        if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
            usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
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
    @PreAuthorize("hasRole('ADMIN')")
    public void deletar(@PathVariable Long id) {
        auditLogRepository.save(AuditLog.builder()
                .usuarioId(id)
                .acao("DELETAR_USUARIO")
                .detalhe("Admin deletou usuário id=" + id)
                .build());
        repository.deleteById(id);
    }
}
