package com.itb.inf3bn.givenet.controller;

import com.itb.inf3bn.givenet.config.AdminCheck;
import com.itb.inf3bn.givenet.dto.OngDTO;
import com.itb.inf3bn.givenet.model.entity.Ong;
import com.itb.inf3bn.givenet.repository.OngRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ongs")
public class OngController {

    @Autowired private OngRepository repository;
    @Autowired private AdminCheck adminCheck;

    @GetMapping
    public List<Ong> listar() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Ong buscar(@PathVariable Long id) {
        return repository.findById(id).orElseThrow();
    }

    @PostMapping
    public Ong criar(@RequestHeader("adminEmail") String email,
                     @RequestHeader("adminSenha") String senha,
                     @RequestBody OngDTO dto) {
        adminCheck.verificar(email, senha);
        return repository.save(toEntity(new Ong(), dto));
    }

    @PutMapping("/{id}")
    public Ong atualizar(@PathVariable Long id,
                         @RequestHeader("adminEmail") String email,
                         @RequestHeader("adminSenha") String senha,
                         @RequestBody OngDTO dto) {
        adminCheck.verificar(email, senha);
        Ong ong = repository.findById(id).orElseThrow();
        return repository.save(toEntity(ong, dto));
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id,
                        @RequestHeader("adminEmail") String email,
                        @RequestHeader("adminSenha") String senha) {
        adminCheck.verificar(email, senha);
        repository.deleteById(id);
    }

    private Ong toEntity(Ong ong, OngDTO dto) {
        ong.setNome(dto.getNome());
        ong.setEmail(dto.getEmail());
        ong.setTelefone(dto.getTelefone());
        ong.setEndereco(dto.getEndereco());
        ong.setTiposAceitos(dto.getTiposAceitos());
        ong.setHorarios(dto.getHorarios());
        ong.setAceitaColeta(dto.getAceitaColeta() != null ? dto.getAceitaColeta() : false);
        ong.setRestricoes(dto.getRestricoes());
        return ong;
    }
}
