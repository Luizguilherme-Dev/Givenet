package com.itb.inf3bn.givenet.controller;

import com.itb.inf3bn.givenet.config.AuthenticatedUser;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

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

    private boolean podeAcessarDoacao(Doacao doacao, AuthenticatedUser solicitante) {
        if (solicitante == null) return false;
        if (doacao.getUsuarioId() != null && doacao.getUsuarioId().equals(solicitante.id())) {
            return true;
        }
        if ("ADMIN".equals(solicitante.role())) {
            return true;
        }
        if (doacao.getOng() != null && doacao.getOng().getEmail() != null) {
            return doacao.getOng().getEmail().equalsIgnoreCase(solicitante.email());
        }
        return false;
    }

    @GetMapping
    public List<Doacao> listar() {
        return repository.findAll();
    }

    @GetMapping("/ong/{ongId}")
    public List<Doacao> listarPorOng(@PathVariable Long ongId) {
        return repository.findByOngId(ongId);
    }

    @GetMapping("/auditoria")
    public List<AuditLog> auditoria() {
        return auditLogRepository.findAll();
    }

    @GetMapping("/{id}")
    public Doacao buscar(@PathVariable Long id, @AuthenticationPrincipal AuthenticatedUser solicitante) {
        Doacao doacao = repository.findById(id).orElseThrow();
        if (!podeAcessarDoacao(doacao, solicitante)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado");
        }
        return doacao;
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Doacao> listarPorUsuario(@PathVariable Long usuarioId,
                                         @AuthenticationPrincipal AuthenticatedUser solicitante) {
        if (!usuarioId.equals(solicitante.id())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado");
        }
        return repository.findByUsuarioId(usuarioId);
    }

    @GetMapping("/historico/{id}")
    public List<DoacaoStatusHistory> historico(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser solicitante) {
        Doacao doacao = repository.findById(id).orElseThrow();
        if (!podeAcessarDoacao(doacao, solicitante)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado");
        }
        return statusHistoryRepository.findByDoacaoIdOrderByDataHoraDesc(id);
    }

    @PostMapping
    public Doacao criar(@AuthenticationPrincipal AuthenticatedUser solicitante,
                        @RequestBody DoacaoDTO dto) {
        if (dto.getUsuarioId() == null || !solicitante.id().equals(dto.getUsuarioId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuário da doação inválido");
        }

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
        doacao.setUsuarioId(dto.getUsuarioId());
        doacao.setItensTipo(dto.getItensTipo());
        doacao.setItemDoado(dto.getItemDoado());
        doacao.setStatus("AGENDADO");
        doacao.setPinConfirmacao(String.format("%04d", random.nextInt(10000)));
        Doacao salva = repository.save(doacao);

        auditLogRepository.save(AuditLog.builder()
                .usuarioId(dto.getUsuarioId())
                .acao("CRIAR_DOACAO")
                .detalhe("Doação id=" + salva.getId() + " para ONG " + ong.getNome())
                .build());

        return salva;
    }

    @PutMapping("/{id}")
    public Doacao atualizar(@PathVariable Long id,
                            @AuthenticationPrincipal AuthenticatedUser solicitante,
                            @RequestBody DoacaoDTO dto) {
        Doacao doacao = repository.findById(id).orElseThrow();

        if (!doacao.getUsuarioId().equals(solicitante.id())) {
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
                .usuarioId(solicitante.id())
                .acao("EDITAR_DOACAO")
                .detalhe("Doação id=" + id + " editada")
                .build());

        return repository.save(doacao);
    }

    @PatchMapping("/{id}/confirmar-entrega")
    @Transactional
    public Doacao confirmarEntrega(
            @PathVariable Long id,
            @RequestParam(value = "pin", required = false) String pin,
            @AuthenticationPrincipal AuthenticatedUser solicitante) {

        Doacao doacao = repository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doação não encontrada"));

        if (solicitante == null
                || (!"ADMIN".equals(solicitante.role()) && !"ONG".equals(solicitante.role()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Acesso negado: apenas administradores ou representantes da ONG podem confirmar a entrega");
        }

        if ("ONG".equals(solicitante.role())) {
            String emailOng = doacao.getOng().getEmail();
            if (emailOng == null || !emailOng.equalsIgnoreCase(solicitante.email())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Acesso negado: esta doação não pertence à sua ONG");
            }
        }

        if (pin != null && !pin.equals(doacao.getPinConfirmacao())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "PIN incorreto");
        }

        if (!"AGENDADO".equals(doacao.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Esta doação não pode mais ser confirmada");
        }

        String statusAnterior = doacao.getStatus();
        doacao.setStatus("DOACAO_ENTREGUE");
        doacao.setDataEntrega(LocalDateTime.now());
        doacao.setConfirmadoPorUsuarioId(solicitante.id());
        Doacao salva = repository.save(doacao);

        statusHistoryRepository.save(DoacaoStatusHistory.builder()
                .doacaoId(id)
                .statusAnterior(statusAnterior)
                .statusNovo("DOACAO_ENTREGUE")
                .alteradoPorUsuarioId(solicitante.id())
                .build());

        auditLogRepository.save(AuditLog.builder()
                .usuarioId(solicitante.id())
                .acao("CONFIRMAR_ENTREGA")
                .detalhe("Doação id=" + id + " confirmada como DOACAO_ENTREGUE por usuarioId=" + solicitante.id())
                .build());

        return salva;
    }

    @PatchMapping("/{id}/cancelar")
    public Doacao cancelar(@PathVariable Long id, @AuthenticationPrincipal AuthenticatedUser solicitante) {
        Doacao doacao = repository.findById(id).orElseThrow();

        if (!doacao.getUsuarioId().equals(solicitante.id())) {
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
                .alteradoPorUsuarioId(solicitante.id())
                .build());

        auditLogRepository.save(AuditLog.builder()
                .usuarioId(solicitante.id())
                .acao("CANCELAR_DOACAO")
                .detalhe("Doação id=" + id + " cancelada pelo usuário")
                .build());

        return salva;
    }

    @DeleteMapping("/{id}")
    @Transactional
    public void deletar(@PathVariable Long id, @AuthenticationPrincipal AuthenticatedUser solicitante) {
        Doacao doacao = repository.findById(id).orElseThrow();
        boolean isAdmin = solicitante != null && "ADMIN".equals(solicitante.role());
        boolean isEntregue = "DOACAO_ENTREGUE".equalsIgnoreCase(doacao.getStatus())
                || "CONCLUIDA".equalsIgnoreCase(doacao.getStatus());

        if (isEntregue && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Apenas administradores podem excluir doações concluídas");
        }
        if (!isEntregue && (solicitante == null || !doacao.getUsuarioId().equals(solicitante.id()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não pode deletar a doação de outro usuário");
        }
        auditLogRepository.save(AuditLog.builder()
                .usuarioId(solicitante.id())
                .acao("DELETAR_DOACAO")
                .detalhe("Doação id=" + id + " deletada" + (isEntregue ? " por administrador" : ""))
                .build());
        statusHistoryRepository.deleteByDoacaoId(id);
        repository.deleteById(id);
    }
}
