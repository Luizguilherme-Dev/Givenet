package com.itb.inf3bn.givenet.controller;

import com.itb.inf3bn.givenet.config.AdminCheck;
import com.itb.inf3bn.givenet.dto.DoacaoDTO;
import com.itb.inf3bn.givenet.model.entity.AuditLog;
import com.itb.inf3bn.givenet.model.entity.Doacao;
import com.itb.inf3bn.givenet.model.entity.DoacaoStatusHistory;
import com.itb.inf3bn.givenet.model.entity.Ong;
import com.itb.inf3bn.givenet.model.entity.Usuario;
import com.itb.inf3bn.givenet.repository.AuditLogRepository;
import com.itb.inf3bn.givenet.repository.DoacaoRepository;
import com.itb.inf3bn.givenet.repository.DoacaoStatusHistoryRepository;
import com.itb.inf3bn.givenet.repository.OngRepository;
import com.itb.inf3bn.givenet.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/doacoes")
public class DoacaoController {

    @Autowired private DoacaoRepository repository;
    @Autowired private OngRepository ongRepository;
    @Autowired private AuditLogRepository auditLogRepository;
    @Autowired private DoacaoStatusHistoryRepository statusHistoryRepository;
    @Autowired private AdminCheck adminCheck;
    @Autowired private UsuarioRepository usuarioRepository;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private final Random random = new Random();

    @GetMapping
    public List<Doacao> listar(@RequestHeader("adminEmail") String email,
                               @RequestHeader("adminSenha") String senha) {
        adminCheck.verificar(email, senha);
        return repository.findAll();
    }

    @GetMapping("/ong/{ongId}")
    public List<Doacao> listarPorOng(@PathVariable Long ongId,
                                     @RequestHeader("adminEmail") String email,
                                     @RequestHeader("adminSenha") String senha) {
        adminCheck.verificar(email, senha);
        return repository.findByOngId(ongId);
    }

    @GetMapping("/auditoria")
    public List<AuditLog> auditoria(
            @RequestHeader("adminEmail") String email,
            @RequestHeader("adminSenha") String senha) {
        adminCheck.verificar(email, senha);
        return auditLogRepository.findAll();
    }

    @GetMapping("/{id}")
    public Doacao buscar(@PathVariable Long id,
                         @RequestHeader("usuarioId") Long solicitanteId,
                         @RequestHeader(value = "adminEmail", required = false) String adminEmail,
                         @RequestHeader(value = "adminSenha", required = false) String adminSenha) {
        Doacao doacao = repository.findById(id).orElseThrow();
        if (!doacao.getUsuarioId().equals(solicitanteId)) {
            adminCheck.verificar(adminEmail, adminSenha);
        }
        return doacao;
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Doacao> listarPorUsuario(@PathVariable Long usuarioId,
                                         @RequestHeader("usuarioId") Long solicitanteId) {
        if (!usuarioId.equals(solicitanteId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado");
        }
        return repository.findByUsuarioId(usuarioId);
    }

    @GetMapping("/historico/{id}")
    public List<DoacaoStatusHistory> historico(@PathVariable Long id,
                                               @RequestHeader("usuarioId") Long solicitanteId,
                                               @RequestHeader(value = "adminEmail", required = false) String adminEmail,
                                               @RequestHeader(value = "adminSenha", required = false) String adminSenha) {
        Doacao doacao = repository.findById(id).orElseThrow();
        if (!doacao.getUsuarioId().equals(solicitanteId)) {
            adminCheck.verificar(adminEmail, adminSenha);
        }
        return statusHistoryRepository.findByDoacaoIdOrderByDataHoraDesc(id);
    }

    @PostMapping
    public Doacao criar(@RequestBody DoacaoDTO dto) {
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
                            @RequestHeader("usuarioId") Long usuarioId,
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
            @RequestHeader(value = "adminEmail", required = false) String adminEmail,
            @RequestHeader(value = "adminSenha", required = false) String adminSenha,
            @RequestHeader(value = "usuarioId", required = false) Long solicitanteId,
            @RequestHeader(value = "usuarioSenha", required = false) String usuarioSenha,
            @RequestParam(value = "pin", required = false) String pin) {

        Doacao doacao = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doação não encontrada"));

        if ("DOACAO_ENTREGUE".equals(doacao.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Doação já marcada como entregue");
        }

        Long confirmadorId = null;
        boolean autorizado = false;

        if (adminEmail != null && adminSenha != null) {
            try {
                adminCheck.verificar(adminEmail, adminSenha);
                autorizado = true;
                confirmadorId = -1L;
            } catch (ResponseStatusException e) {
                // não é admin, tenta como representante de ONG
            }
        }

        if (!autorizado && solicitanteId != null && usuarioSenha != null) {
            Optional<Usuario> usuarioOpt = usuarioRepository.findById(solicitanteId);
            if (usuarioOpt.isPresent()) {
                Usuario usuario = usuarioOpt.get();
                boolean senhaOk = encoder.matches(usuarioSenha, usuario.getSenha());
                if (senhaOk) {
                    String emailOng = doacao.getOng().getEmail();
                    if (emailOng != null && emailOng.equalsIgnoreCase(usuario.getEmail())) {
                        autorizado = true;
                        confirmadorId = solicitanteId;
                    }
                    if ("ADMIN".equals(usuario.getRole())) {
                        autorizado = true;
                        confirmadorId = solicitanteId;
                    }
                }
            }
        }

        if (!autorizado && pin != null && pin.equals(doacao.getPinConfirmacao())) {
            autorizado = true;
            confirmadorId = solicitanteId != null ? solicitanteId : -2L;
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
                           @RequestHeader("usuarioId") Long usuarioId) {
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
                        @RequestHeader("usuarioId") Long usuarioId) {
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
