package com.itb.inf3bn.givenet.controller;

import com.itb.inf3bn.givenet.dto.SolicitacaoOngDTO;
import com.itb.inf3bn.givenet.dto.OngDTO;
import com.itb.inf3bn.givenet.model.entity.Ong;
import com.itb.inf3bn.givenet.model.entity.OngSolicitacao;
import com.itb.inf3bn.givenet.model.entity.Usuario;
import com.itb.inf3bn.givenet.repository.OngRepository;
import com.itb.inf3bn.givenet.repository.OngSolicitacaoRepository;
import com.itb.inf3bn.givenet.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/ongs")
public class OngController {

    @Autowired private OngRepository repository;
    @Autowired private OngSolicitacaoRepository solicitacaoRepository;
    @Autowired private UsuarioRepository usuarioRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @GetMapping
    public List<Ong> listar() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Ong buscar(@PathVariable Long id) {
        return repository.findById(id).orElseThrow();
    }

    @PostMapping("/solicitacoes")
    @Transactional
    public OngSolicitacao solicitarCadastro(@RequestBody SolicitacaoOngDTO dto) {
        validarSolicitacao(dto);

        String email = dto.getEmail().trim().toLowerCase(Locale.ROOT);
        String cnpj = dto.getCnpj() == null ? "" : dto.getCnpj().trim();
        if (usuarioRepository.findByEmail(email).isPresent() || repository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este e-mail já está cadastrado.");
        }
        if (solicitacaoRepository.existsByEmailIgnoreCaseAndStatus(email, "PENDENTE")) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe uma solicitação pendente para este e-mail.");
        }
        if (!cnpj.isBlank() && solicitacaoRepository.existsByCnpjAndStatus(cnpj, "PENDENTE")) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe uma solicitação pendente para este CNPJ.");
        }

        OngSolicitacao solicitacao = new OngSolicitacao();
        solicitacao.setNome(dto.getNome().trim());
        solicitacao.setCnpj(cnpj.isBlank() ? null : cnpj);
        solicitacao.setEmail(email);
        solicitacao.setTelefone(trimToNull(dto.getTelefone()));
        solicitacao.setEndereco(trimToNull(dto.getEndereco()));
        solicitacao.setResponsavelNome(dto.getResponsavelNome().trim());
        solicitacao.setSenhaHash(passwordEncoder.encode(dto.getSenha()));
        solicitacao.setTiposAceitos(trimToNull(dto.getTiposAceitos()));
        solicitacao.setHorarios(trimToNull(dto.getHorarios()));
        solicitacao.setStatus("PENDENTE");
        solicitacao.setCriadoEm(LocalDateTime.now());
        return solicitacaoRepository.save(solicitacao);
    }

    @GetMapping("/solicitacoes")
    public List<OngSolicitacao> listarSolicitacoes() {
        return solicitacaoRepository.findAllByOrderByCriadoEmDesc();
    }

    @PatchMapping("/admin/{id}/{acao}")
    @Transactional
    public OngSolicitacao alterarStatusSolicitacao(@PathVariable Long id, @PathVariable String acao) {
        OngSolicitacao solicitacao = solicitacaoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitação não encontrada."));

        switch (acao.toLowerCase(Locale.ROOT)) {
            case "aprovar" -> aprovarSolicitacao(solicitacao);
            case "recusar" -> {
                exigirStatus(solicitacao, "PENDENTE");
                solicitacao.setStatus("REJEITADA");
            }
            case "bloquear" -> {
                exigirStatus(solicitacao, "APROVADA");
                usuarioRepository.findByEmail(solicitacao.getEmail()).ifPresent(usuario -> {
                    usuario.setRole("BLOQUEADO");
                    usuarioRepository.save(usuario);
                });
                solicitacao.setStatus("BLOQUEADA");
            }
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ação de análise inválida.");
        }

        return solicitacaoRepository.save(solicitacao);
    }

    @PostMapping
    public Ong criar(@RequestBody OngDTO dto) {
        return repository.save(toEntity(new Ong(), dto));
    }

    @PutMapping("/{id}")
    public Ong atualizar(@PathVariable Long id, @RequestBody OngDTO dto) {
        Ong ong = repository.findById(id).orElseThrow();
        return repository.save(toEntity(ong, dto));
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        repository.deleteById(id);
    }

    private void aprovarSolicitacao(OngSolicitacao solicitacao) {
        exigirStatus(solicitacao, "PENDENTE");
        if (usuarioRepository.findByEmail(solicitacao.getEmail()).isPresent()
                || repository.existsByEmailIgnoreCase(solicitacao.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "O e-mail já está associado a uma conta.");
        }

        Ong ong = new Ong();
        ong.setNome(solicitacao.getNome());
        ong.setEmail(solicitacao.getEmail());
        ong.setTelefone(solicitacao.getTelefone());
        ong.setEndereco(solicitacao.getEndereco());
        ong.setTiposAceitos(solicitacao.getTiposAceitos());
        ong.setHorarios(solicitacao.getHorarios());
        ong.setAceitaColeta(false);
        repository.save(ong);

        Usuario usuario = new Usuario();
        usuario.setNome(solicitacao.getResponsavelNome());
        usuario.setEmail(solicitacao.getEmail());
        usuario.setSenha(solicitacao.getSenhaHash());
        usuario.setTelefone(solicitacao.getTelefone());
        usuario.setRole("ONG");
        usuarioRepository.save(usuario);

        solicitacao.setStatus("APROVADA");
    }

    private void exigirStatus(OngSolicitacao solicitacao, String statusEsperado) {
        if (!statusEsperado.equals(solicitacao.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A solicitação não está pendente para esta ação.");
        }
    }

    private void validarSolicitacao(SolicitacaoOngDTO dto) {
        if (dto.getNome() == null || dto.getNome().isBlank()
                || dto.getEmail() == null || dto.getEmail().isBlank()
                || dto.getResponsavelNome() == null || dto.getResponsavelNome().isBlank()
                || dto.getSenha() == null || dto.getSenha().length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Preencha os campos obrigatórios e informe uma senha com no mínimo 6 caracteres.");
        }

        validarTamanho(dto.getNome(), 100, "Nome da organização");
        validarTamanho(dto.getCnpj(), 20, "CNPJ");
        validarTamanho(dto.getEmail(), 150, "E-mail");
        validarTamanho(dto.getTelefone(), 20, "Telefone");
        validarTamanho(dto.getEndereco(), 255, "Endereço");
        validarTamanho(dto.getResponsavelNome(), 100, "Nome do responsável");
        validarTamanho(dto.getTiposAceitos(), 255, "Tipos de doação aceitos");
        validarTamanho(dto.getHorarios(), 255, "Horários de atendimento");
        if (dto.getSenha().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A senha excede o tamanho máximo permitido.");
        }
        if (!dto.getEmail().trim().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe um e-mail válido.");
        }
    }

    private void validarTamanho(String valor, int limite, String campo) {
        if (valor != null && valor.length() > limite) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, campo + " excede o tamanho máximo permitido.");
        }
    }

    private String trimToNull(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        return valor.trim();
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
