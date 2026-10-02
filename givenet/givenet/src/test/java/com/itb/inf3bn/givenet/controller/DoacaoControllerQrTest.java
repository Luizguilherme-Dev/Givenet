package com.itb.inf3bn.givenet.controller;

import com.itb.inf3bn.givenet.config.AuthenticatedUser;
import com.itb.inf3bn.givenet.model.entity.Doacao;
import com.itb.inf3bn.givenet.model.entity.DoacaoStatusHistory;
import com.itb.inf3bn.givenet.model.entity.Ong;
import com.itb.inf3bn.givenet.repository.AuditLogRepository;
import com.itb.inf3bn.givenet.repository.DoacaoRepository;
import com.itb.inf3bn.givenet.repository.DoacaoStatusHistoryRepository;
import com.itb.inf3bn.givenet.repository.OngRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

class DoacaoControllerQrTest {

    private final DoacaoRepository repository = mock(DoacaoRepository.class);
    private final OngRepository ongRepository = mock(OngRepository.class);
    private final AuditLogRepository auditLogRepository = mock(AuditLogRepository.class);
    private final DoacaoStatusHistoryRepository statusHistoryRepository =
            mock(DoacaoStatusHistoryRepository.class);
    private final DoacaoController controller = new DoacaoController();

    @BeforeEach
    void configurarController() {
        ReflectionTestUtils.setField(controller, "repository", repository);
        ReflectionTestUtils.setField(controller, "ongRepository", ongRepository);
        ReflectionTestUtils.setField(controller, "auditLogRepository", auditLogRepository);
        ReflectionTestUtils.setField(controller, "statusHistoryRepository", statusHistoryRepository);
    }

    @Test
    void ongPodeConfirmarQrDaPropriaDoacao() {
        Doacao doacao = doacao("AGENDADO");
        when(repository.findByIdForUpdate(10L)).thenReturn(Optional.of(doacao));

        controller.confirmarEntrega(10L, null, new AuthenticatedUser(20L, "ong@example.com", "ONG"));

        assertEquals("DOACAO_ENTREGUE", doacao.getStatus());
        assertEquals(20L, doacao.getConfirmadoPorUsuarioId());
        verify(statusHistoryRepository).save(argThat(history -> history.getAlteradoPorUsuarioId().equals(20L)));
    }

    @Test
    void adminPodeConfirmarQrSemPin() {
        Doacao doacao = doacao("AGENDADO");
        when(repository.findByIdForUpdate(10L)).thenReturn(Optional.of(doacao));

        controller.confirmarEntrega(10L, null, new AuthenticatedUser(30L, "admin@example.com", "ADMIN"));

        assertEquals("DOACAO_ENTREGUE", doacao.getStatus());
        assertEquals(30L, doacao.getConfirmadoPorUsuarioId());
    }

    @Test
    void usuarioComumNaoConfirmaMesmoComPinCorreto() {
        Doacao doacao = doacao("AGENDADO");
        when(repository.findByIdForUpdate(10L)).thenReturn(Optional.of(doacao));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> controller.confirmarEntrega(
                        10L, "1234", new AuthenticatedUser(40L, "doador@example.com", "USER")));

        assertEquals(403, exception.getStatusCode().value());
        assertEquals("AGENDADO", doacao.getStatus());
        verify(repository, never()).save(any(Doacao.class));
    }

    @Test
    void requisicaoSemUsuarioAutenticadoNaoConfirma() {
        Doacao doacao = doacao("AGENDADO");
        when(repository.findByIdForUpdate(10L)).thenReturn(Optional.of(doacao));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> controller.confirmarEntrega(10L, null, null));

        assertEquals(403, exception.getStatusCode().value());
        verify(repository, never()).save(any(Doacao.class));
    }

    @Test
    void ongNaoConfirmaDoacaoDeOutraOng() {
        Doacao doacao = doacao("AGENDADO");
        when(repository.findByIdForUpdate(10L)).thenReturn(Optional.of(doacao));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> controller.confirmarEntrega(
                        10L, null, new AuthenticatedUser(50L, "outra@example.com", "ONG")));

        assertEquals(403, exception.getStatusCode().value());
        verify(repository, never()).save(any(Doacao.class));
    }

    @Test
    void idDeQrInvalidoNaoEncontraDoacao() {
        when(repository.findByIdForUpdate(999L)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> controller.confirmarEntrega(
                        999L, null, new AuthenticatedUser(30L, "admin@example.com", "ADMIN")));

        assertEquals(404, exception.getStatusCode().value());
    }

    @Test
    void qrJaConfirmadoNaoPodeSerReutilizado() {
        Doacao doacao = doacao("DOACAO_ENTREGUE");
        when(repository.findByIdForUpdate(10L)).thenReturn(Optional.of(doacao));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> controller.confirmarEntrega(
                        10L, null, new AuthenticatedUser(30L, "admin@example.com", "ADMIN")));

        assertEquals(400, exception.getStatusCode().value());
        verify(repository, never()).save(any(Doacao.class));
    }

    @Test
    void doacaoCanceladaNaoPodeSerConfirmadaPorQr() {
        Doacao doacao = doacao("CANCELADO");
        when(repository.findByIdForUpdate(10L)).thenReturn(Optional.of(doacao));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> controller.confirmarEntrega(
                        10L, null, new AuthenticatedUser(30L, "admin@example.com", "ADMIN")));

        assertEquals(400, exception.getStatusCode().value());
        verify(repository, never()).save(any(Doacao.class));
    }

    @Test
    void pinValidoContinuaConfirmandoParaOngAutorizada() {
        Doacao doacao = doacao("AGENDADO");
        when(repository.findByIdForUpdate(10L)).thenReturn(Optional.of(doacao));

        controller.confirmarEntrega(10L, "1234", new AuthenticatedUser(20L, "ong@example.com", "ONG"));

        assertEquals("DOACAO_ENTREGUE", doacao.getStatus());
        verify(repository).save(doacao);
    }

    @Test
    void pinInvalidoNaoConfirmaDoacao() {
        Doacao doacao = doacao("AGENDADO");
        when(repository.findByIdForUpdate(10L)).thenReturn(Optional.of(doacao));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> controller.confirmarEntrega(
                        10L, "9999", new AuthenticatedUser(20L, "ong@example.com", "ONG")));

        assertEquals(400, exception.getStatusCode().value());
        assertEquals("AGENDADO", doacao.getStatus());
        verify(repository, never()).save(any(Doacao.class));
    }

    private Doacao doacao(String status) {
        Ong ong = new Ong();
        ong.setEmail("ong@example.com");

        Doacao doacao = new Doacao();
        doacao.setId(10L);
        doacao.setUsuarioId(40L);
        doacao.setOng(ong);
        doacao.setStatus(status);
        doacao.setPinConfirmacao("1234");
        return doacao;
    }
}
