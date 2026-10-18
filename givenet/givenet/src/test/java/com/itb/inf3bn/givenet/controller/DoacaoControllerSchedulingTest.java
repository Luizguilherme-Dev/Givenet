package com.itb.inf3bn.givenet.controller;

import com.itb.inf3bn.givenet.config.AuthenticatedUser;
import com.itb.inf3bn.givenet.dto.DoacaoDTO;
import com.itb.inf3bn.givenet.model.entity.Ong;
import com.itb.inf3bn.givenet.repository.AuditLogRepository;
import com.itb.inf3bn.givenet.repository.DoacaoRepository;
import com.itb.inf3bn.givenet.repository.DoacaoStatusHistoryRepository;
import com.itb.inf3bn.givenet.repository.OngRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.clearInvocations;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class DoacaoControllerSchedulingTest {

    private static final ZoneId ZONA_ONGS = ZoneId.of("America/Sao_Paulo");
    private static final String DATA_FUTURA = Instant.now().plusSeconds(172_800).toString();

    private final DoacaoRepository repository = mock(DoacaoRepository.class);
    private final OngRepository ongRepository = mock(OngRepository.class);
    private final AuditLogRepository auditLogRepository = mock(AuditLogRepository.class);
    private final DoacaoStatusHistoryRepository statusHistoryRepository =
            mock(DoacaoStatusHistoryRepository.class);
    private final DoacaoController controller = new DoacaoController();
    private final AuthenticatedUser solicitante = new AuthenticatedUser(40L, "doador@example.com", "USER");

    @BeforeEach
    void configurarController() {
        ReflectionTestUtils.setField(controller, "repository", repository);
        ReflectionTestUtils.setField(controller, "ongRepository", ongRepository);
        ReflectionTestUtils.setField(controller, "auditLogRepository", auditLogRepository);
        ReflectionTestUtils.setField(controller, "statusHistoryRepository", statusHistoryRepository);
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void aceitaLimitesEHorariosIntermediariosDeCadaOng() {
        Object[][] casos = {
                {"WWF Brasil", "08:00"}, {"WWF Brasil", "12:00"}, {"WWF Brasil", "17:30"},
                {"Instituto Ayrton Senna", "09:00"}, {"Instituto Ayrton Senna", "12:00"},
                {"Instituto Ayrton Senna", "16:30"},
                {"AACD", "08:00"}, {"AACD", "12:00"}, {"AACD", "15:30"}
        };

        for (Object[] caso : casos) {
            clearInvocations(repository);
            criar((String) caso[0], (String) caso[1], DATA_FUTURA);
            verify(repository).save(any());
        }
    }

    @Test
    void rejeitaHorariosAntesEDepoisDaJanelaSemPersistir() {
        Object[][] casos = {
                {"WWF Brasil", "07:00"}, {"WWF Brasil", "18:00"},
                {"AACD", "07:59"}, {"AACD", "15:31"},
                {"Instituto Ayrton Senna", "08:59"}, {"Instituto Ayrton Senna", "16:31"}
        };

        for (Object[] caso : casos) {
            rejeitarSemPersistir((String) caso[0], (String) caso[1], DATA_FUTURA);
        }
    }

    @Test
    void rejeitaDataPassadaSemPersistir() {
        String dataPassada = Instant.now().minusSeconds(172_800).toString();
        rejeitarSemPersistir("WWF Brasil", "12:00", dataPassada);
    }

    @Test
    void rejeitaHorarioJaPassadoNaDataAtualSemPersistir() {
        LocalTime agora = LocalTime.now(ZONA_ONGS);
        LocalTime horarioPassado;
        if (!agora.isAfter(LocalTime.of(8, 0))) {
            horarioPassado = LocalTime.of(7, 59);
        } else if (agora.isAfter(LocalTime.of(17, 30))) {
            horarioPassado = LocalTime.of(8, 0);
        } else {
            horarioPassado = agora.minusMinutes(1).withSecond(0).withNano(0);
            if (horarioPassado.isBefore(LocalTime.of(8, 0))) {
                horarioPassado = LocalTime.of(8, 0);
            }
        }
        String dataHoje = LocalDate.now(ZONA_ONGS).atTime(12, 0).atZone(ZONA_ONGS).toInstant().toString();

        rejeitarSemPersistir("WWF Brasil", horarioPassado.toString(), dataHoje);
    }

    @Test
    void rejeitaDataOuHorarioMalformadoSemPersistir() {
        rejeitarSemPersistir("WWF Brasil", "8:00", DATA_FUTURA);
        rejeitarSemPersistir("WWF Brasil", "08:00", "data-invalida");
    }

    private void rejeitarSemPersistir(String nomeOng, String horario, String data) {
        clearInvocations(repository);
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> criar(nomeOng, horario, data));

        assertEquals(400, exception.getStatusCode().value());
        verify(repository, never()).save(any());
    }

    private void criar(String nomeOng, String horario, String data) {
        Ong ong = new Ong();
        ong.setId(1L);
        ong.setNome(nomeOng);
        when(ongRepository.findById(1L)).thenReturn(Optional.of(ong));

        DoacaoDTO dto = new DoacaoDTO();
        dto.setOngId(1L);
        dto.setUsuarioId(solicitante.id());
        dto.setData(data);
        dto.setHorario(horario);

        controller.criar(solicitante, dto);
    }
}
