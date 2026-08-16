package com.itb.inf3bn.givenet.config;

import com.itb.inf3bn.givenet.model.entity.Usuario;
import com.itb.inf3bn.givenet.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Component
public class AdminCheck {

    @Autowired
    private UsuarioRepository repository;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public void verificar(String email, String senha) {
        Optional<Usuario> usuario = repository.findByEmail(email);
        if (usuario.isEmpty()
                || !encoder.matches(senha, usuario.get().getSenha())
                || !"ADMIN".equals(usuario.get().getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado: apenas administradores podem realizar esta ação");
        }
    }
}
