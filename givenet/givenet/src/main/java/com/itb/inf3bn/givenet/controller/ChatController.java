package com.itb.inf3bn.givenet.controller;

import com.itb.inf3bn.givenet.dto.ChatDTO;
import com.itb.inf3bn.givenet.model.entity.Chat;
import com.itb.inf3bn.givenet.repository.ChatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chat")
public class ChatController {

    @Autowired
    private ChatRepository repository;

    @GetMapping
    public List<Chat> listar() {
        return repository.findAll(Sort.by(Sort.Direction.ASC, "data"));
    }

    @GetMapping("/{id}")
    public Chat buscar(@PathVariable Long id) {
        return repository.findById(id).orElseThrow();
    }

    @PostMapping
    public Chat criar(@RequestBody ChatDTO dto, Authentication authentication) {
        Chat chat = new Chat();
        chat.setUsuario(String.valueOf(authentication.getPrincipal()));
        chat.setMensagem(dto.getMensagem());
        chat.setData(dto.getData());
        return repository.save(chat);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Chat atualizar(@PathVariable Long id, @RequestBody ChatDTO dto) {
        Chat chat = repository.findById(id).orElseThrow();
        chat.setUsuario(dto.getUsuario());
        chat.setMensagem(dto.getMensagem());
        chat.setData(dto.getData());
        return repository.save(chat);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deletar(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
