package com.itb.inf3bn.givenet.controller;

import com.itb.inf3bn.givenet.config.AdminCheck;
import com.itb.inf3bn.givenet.dto.ChatDTO;
import com.itb.inf3bn.givenet.model.entity.Chat;
import com.itb.inf3bn.givenet.repository.ChatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chat")
public class ChatController {

    @Autowired
    private ChatRepository repository;

    @Autowired
    private AdminCheck adminCheck;

    @GetMapping
    public List<Chat> listar() {
        return repository.findAll(Sort.by(Sort.Direction.ASC, "data"));
    }

    @GetMapping("/{id}")
    public Chat buscar(@PathVariable Long id) {
        return repository.findById(id).orElseThrow();
    }

    @PostMapping
    public Chat criar(@RequestBody ChatDTO dto) {
        Chat chat = new Chat();
        chat.setUsuario(dto.getUsuario());
        chat.setMensagem(dto.getMensagem());
        chat.setData(dto.getData());
        return repository.save(chat);
    }

    @PutMapping("/{id}")
    public Chat atualizar(@PathVariable Long id,
                          @RequestHeader("adminEmail") String email,
                          @RequestHeader("adminSenha") String senha,
                          @RequestBody ChatDTO dto) {
        adminCheck.verificar(email, senha);
        Chat chat = repository.findById(id).orElseThrow();
        chat.setUsuario(dto.getUsuario());
        chat.setMensagem(dto.getMensagem());
        chat.setData(dto.getData());
        return repository.save(chat);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id,
                        @RequestHeader("adminEmail") String email,
                        @RequestHeader("adminSenha") String senha) {
        adminCheck.verificar(email, senha);
        repository.deleteById(id);
    }
}
