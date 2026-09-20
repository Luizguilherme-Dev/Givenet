package com.itb.inf3bn.givenet.config;

import com.itb.inf3bn.givenet.model.entity.Usuario;
import com.itb.inf3bn.givenet.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.context.ConfigurableApplicationContext;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AdminSetupRunnerTest {

    private final UsuarioRepository repository = mock(UsuarioRepository.class);
    private final ConfigurableApplicationContext applicationContext = mock(ConfigurableApplicationContext.class);
    private final AdminSetupRunner runner = new AdminSetupRunner(repository, applicationContext);

    @Test
    void createsAdminWithBcryptPasswordAndAdminRole() throws Exception {
        when(repository.findByEmail("admin@givenet.com")).thenReturn(Optional.empty());
        when(repository.save(any(Usuario.class))).thenAnswer(invocation -> invocation.getArgument(0));

        runner.run(new DefaultApplicationArguments(
                "--create-admin",
                "--admin-name=Administrador",
                "--admin-email=admin@givenet.com",
                "--admin-password=senha-segura"));

        var captor = org.mockito.ArgumentCaptor.forClass(Usuario.class);
        verify(repository).save(captor.capture());
        Usuario admin = captor.getValue();
        assertThat(admin.getRole()).isEqualTo("ADMIN");
        assertThat(admin.getSenha()).isNotEqualTo("senha-segura");
        assertThat(new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder()
                .matches("senha-segura", admin.getSenha())).isTrue();
    }

    @Test
    void rejectsExistingEmail() {
        when(repository.findByEmail("admin@givenet.com")).thenReturn(Optional.of(new Usuario()));

        assertThatThrownBy(() -> runner.run(new DefaultApplicationArguments(
                "--create-admin",
                "--admin-name=Administrador",
                "--admin-email=admin@givenet.com",
                "--admin-password=senha-segura")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("email ja existe");
        verify(repository, never()).save(any(Usuario.class));
    }
}