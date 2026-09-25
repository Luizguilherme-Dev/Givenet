package com.itb.inf3bn.givenet.controller;

import com.itb.inf3bn.givenet.dto.DoacaoDTO;
import com.itb.inf3bn.givenet.model.entity.AuditLog;
import com.itb.inf3bn.givenet.model.entity.Doacao;
import com.itb.inf3bn.givenet.model.entity.DoacaoStatusHistory;
import com.itb.inf3bn.givenet.model.entity.Ong;
import com.itb.inf3bn.givenet.repository.AuditLogRepository;
import com.itb.inf3bn.givenet.repository.DoacaoRepository;
import com.itb.inf3bn.givenet.repository.DoacaoStatusHistoryRepository;
import com.itb.inf3bn.givenet.repository.OngRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@RestController
@RequestMapping("/doacoes")
public class DoacaoController {

    @Autowired private DoacaoRepository repository;
    @Autowired private OngRepository ongRepository;
    @Autowired private AuditLogRepository auditLogRepository;
    @Autowired private DoacaoStatusHistoryRepository statusHistoryRepository;
    private final Random random = new Random();

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Doacao> listar() {
        return repository.findAll();
    }

    @GetMapping("/ong/{ongId}")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Doacao> listarPorOng(@PathVariable Long ongId) {
        return repository.findByOngId(ongId);
    }

    @GetMapping("/auditoria")
    @PreAuthorize("hasRole('ADMIN')")
    public List<AuditLog> auditoria() {
        return auditLogRepository.findAll();
    }

    @GetMapping("/{id}")
    public Doacao buscar(@PathVariable Long id,
                         @AuthenticationPrincipal Long usuarioAutenticado) {
        Doacao doacao = repository.findById(id).orElseThrow();
        if (!doacao.getUsuarioId().equals(usuarioAutenticado)
                && SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .noneMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado");
        }
        return doacao;
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Doacao> listarPorUsuario(@PathVariable Long usuarioId,
                                         @AuthenticationPrincipal Long usuarioAutenticado) {
        if (!usuarioId.equals(usuarioAutenticado)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado");
        }
        return repository.findByUsuarioId(usuarioId);
    }

    @GetMapping("/historico/{id}")
    public List<DoacaoStatusHistory> historico(@PathVariable Long id,
                                               @AuthenticationPrincipal Long usuarioAutenticado) {
        Doacao doacao = repository.findById(id).orElseThrow();
        if (!doacao.getUsuarioId().equals(usuarioAutenticado)
                && SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .noneMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado");
        }
        return statusHistoryRepository.findByDoacaoIdOrderByDataHoraDesc(id);
    }

    @PostMapping
    public Doacao criar(@AuthenticationPrincipal Long usuarioId,
                        @RequestBody DoacaoDTO dto) {

        Ong ong = ongRepository.findById(dto.getOngId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "ONG não encontrada"));

        if (dto.getItensTipo() != null && ong.getTiposAceitos() != null) {
            List<String> aceitos = Arrays.asList(ong.getTiposAceitos().toLowerCase().split(","));
            List<String> enviados = Arrays.asList(dto.getItensTipo().toLowerCase().split(","));
            for (String item : enviados) {
                if (!aceitos.contains(item.trim())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "A ONG não aceita o tipo de item: " + item.trim());
                }
            }
        }

        Doacao doacao = new Doacao();
        doacao.setNome(dto.getNome());
        doacao.setEmail(dto.getEmail());
        doacao.setOng(ong);
        doacao.setHorario(dto.getHorario());
        doacao.setData(dto.getData());
        doacao.setUsuarioId(usuarioId);
        doacao.setItensTipo(dto.getItensTipo());
        doacao.setItemDoado(dto.getItemDoado());
        doacao.setStatus("AGENDADO");
        doacao.setPinConfirmacao(String.format("%04d", random.nextInt(10000)));
        Doacao salva = repository.save(doacao);

        auditLogRepository.save(AuditLog.builder()
                .usuarioId(usuarioId)
                .acao("CRIAR_DOACAO")
                .detalhe("Doação id=" + salva.getId() + " para ONG " + ong.getNome())
                .build());

        return salva;
    }

    @PutMapping("/{id}")
    public Doacao atualizar(@PathVariable Long id,
                            @AuthenticationPrincipal Long usuarioId,
                            @RequestBody DoacaoDTO dto) {
        Doacao doacao = repository.findById(id).orElseThrow();

        if (!doacao.getUsuarioId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não pode editar a doação de outro usuário");
        }
        if ("DOACAO_ENTREGUE".equals(doacao.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é possível editar uma doação já entregue");
        }

        doacao.setNome(dto.getNome());
        doacao.setEmail(dto.getEmail());
        doacao.setHorario(dto.getHorario());
        doacao.setData(dto.getData());

        auditLogRepository.save(AuditLog.builder()
                .usuarioId(usuarioId)
                .acao("EDITAR_DOACAO")
                .detalhe("Doação id=" + id + " editada")
                .build());

        return repository.save(doacao);
    }

    @PatchMapping("/{id}/confirmar-entrega")
    public Doacao confirmarEntrega(
            @PathVariable Long id,
            @AuthenticationPrincipal Long solicitanteId,
            @RequestParam(value = "pin", required = false) String pin) {

        Doacao doacao = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doação não encontrada"));

        if ("DOACAO_ENTREGUE".equals(doacao.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Doação já marcada como entregue");
        }

        Long confirmadorId;
        boolean autorizado = pin != null && pin.equals(doacao.getPinConfirmacao());
        boolean admin = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));

        if (admin) {
            confirmadorId = solicitanteId;
            autorizado = true;
        } else if (autorizado) {
            confirmadorId = solicitanteId;
        } else {
            confirmadorId = solicitanteId;
        }

        if (!autorizado && solicitanteId != null && doacao.getUsuarioId().equals(solicitanteId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Usuário comum não pode confirmar a própria doação");
        }

        if (!autorizado) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Acesso negado: apenas administradores ou representantes da ONG podem confirmar a entrega");
        }

        String statusAnterior = doacao.getStatus();
        doacao.setStatus("DOACAO_ENTREGUE");
        doacao.setDataEntrega(LocalDateTime.now());
        doacao.setConfirmadoPorUsuarioId(confirmadorId);
        Doacao salva = repository.save(doacao);

        statusHistoryRepository.save(DoacaoStatusHistory.builder()
                .doacaoId(id)
                .statusAnterior(statusAnterior)
                .statusNovo("DOACAO_ENTREGUE")
                .alteradoPorUsuarioId(confirmadorId)
                .build());

        auditLogRepository.save(AuditLog.builder()
                .usuarioId(confirmadorId)
                .acao("CONFIRMAR_ENTREGA")
                .detalhe("Doação id=" + id + " confirmada como DOACAO_ENTREGUE por usuarioId=" + confirmadorId)
                .build());

        return salva;
    }

    @PatchMapping("/{id}/cancelar")
    public Doacao cancelar(@PathVariable Long id,
                           @AuthenticationPrincipal Long usuarioId) {
        Doacao doacao = repository.findById(id).orElseThrow();

        if (!doacao.getUsuarioId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado");
        }
        if ("DOACAO_ENTREGUE".equals(doacao.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é possível cancelar uma doação já entregue");
        }

        String statusAnterior = doacao.getStatus();
        doacao.setStatus("CANCELADO");
        Doacao salva = repository.save(doacao);

        statusHistoryRepository.save(DoacaoStatusHistory.builder()
                .doacaoId(id)
                .statusAnterior(statusAnterior)
                .statusNovo("CANCELADO")
                .alteradoPorUsuarioId(usuarioId)
                .build());

        auditLogRepository.save(AuditLog.builder()
                .usuarioId(usuarioId)
                .acao("CANCELAR_DOACAO")
                .detalhe("Doação id=" + id + " cancelada pelo usuário")
                .build());

        return salva;
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id,
                        @AuthenticationPrincipal Long usuarioId) {
        Doacao doacao = repository.findById(id).orElseThrow();
        if (!doacao.getUsuarioId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não pode deletar a doação de outro usuário");
        }
        if ("DOACAO_ENTREGUE".equals(doacao.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é possível deletar uma doação já entregue");
        }
        auditLogRepository.save(AuditLog.builder()
                .usuarioId(usuarioId)
                .acao("DELETAR_DOACAO")
                .detalhe("Doação id=" + id + " deletada")
                .build());
        repository.deleteById(id);
    }
}
