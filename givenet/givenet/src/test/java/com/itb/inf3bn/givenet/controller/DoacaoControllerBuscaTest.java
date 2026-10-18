package com.itb.inf3bn.givenet.controller;

import com.itb.inf3bn.givenet.config.AuthenticatedUser;
import com.itb.inf3bn.givenet.model.entity.Doacao;
import com.itb.inf3bn.givenet.repository.AuditLogRepository;
import com.itb.inf3bn.givenet.repository.DoacaoRepository;
import com.itb.inf3bn.givenet.repository.DoacaoStatusHistoryRepository;
import com.itb.inf3bn.givenet.repository.OngRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class DoacaoControllerBuscaTest {

    private final DoacaoRepository repository = mock(DoacaoRepository.class);
    private final DoacaoController controller = new DoacaoController();

    @BeforeEach
    void configurarController() {
        ReflectionTestUtils.setField(controller, "repository", repository);
        ReflectionTestUtils.setField(controller, "ongRepository", mock(OngRepository.class));
        ReflectionTestUtils.setField(controller, "auditLogRepository", mock(AuditLogRepository.class));
        ReflectionTestUtils.setField(controller, "statusHistoryRepository", mock(DoacaoStatusHistoryRepository.class));
    }

    @Test
    void administradorPodeBuscarComFiltrosCombinados() {
        List<Doacao> doacoes = List.of(new Doacao());
        when(repository.buscarDoacoes("joão", "arroz", "2026-10-08", "14:00", 12L, null))
                .thenReturn(doacoes);

        List<Doacao> resultado = controller.buscarDoacoes(
                " João ", " Arroz ", "2026-10-08", "14:00", 12L,
                new AuthenticatedUser(1L, "admin@example.com", "ADMIN"));

        assertEquals(doacoes, resultado);
        verify(repository).buscarDoacoes("joão", "arroz", "2026-10-08", "14:00", 12L, null);
    }

    @Test
    void ongBuscaSomenteDoacoesAssociadasAoEmailAutenticado() {
        when(repository.buscarDoacoes(null, "cesta", null, null, null, "ong@example.com"))
                .thenReturn(List.of());

        controller.buscarDoacoes(
                null, "Cesta", null, null, null,
                new AuthenticatedUser(2L, "ong@example.com", "ONG"));

        verify(repository).buscarDoacoes(null, "cesta", null, null, null, "ong@example.com");
    }

    @Test
    void usuarioComumNaoPodePesquisarDoacoes() {
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> controller.buscarDoacoes(
                        null, null, null, null, null,
                        new AuthenticatedUser(3L, "user@example.com", "USER")));

        assertEquals(403, exception.getStatusCode().value());
        verifyNoInteractions(repository);
    }
}
