package com.itb.inf3bn.givenet.controller;

import com.itb.inf3bn.givenet.dto.OngDTO;
import com.itb.inf3bn.givenet.model.entity.Ong;
import com.itb.inf3bn.givenet.repository.OngRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ongs")
public class OngController {

    @Autowired private OngRepository repository;

    @GetMapping
    public List<Ong> listar() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Ong buscar(@PathVariable Long id) {
        return repository.findById(id).orElseThrow();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Ong criar(@RequestBody OngDTO dto) {
        return repository.save(toEntity(new Ong(), dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Ong atualizar(@PathVariable Long id, @RequestBody OngDTO dto) {
        Ong ong = repository.findById(id).orElseThrow();
        return repository.save(toEntity(ong, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deletar(@PathVariable Long id) {
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
