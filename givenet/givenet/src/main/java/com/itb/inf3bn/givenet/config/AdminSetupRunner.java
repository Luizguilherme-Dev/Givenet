package com.itb.inf3bn.givenet.config;

import com.itb.inf3bn.givenet.model.entity.Usuario;
import com.itb.inf3bn.givenet.repository.UsuarioRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.Console;
import java.io.FilterInputStream;
import java.util.Scanner;

@Component
public class AdminSetupRunner implements ApplicationRunner {

    private static final String CREATE_ADMIN_OPTION = "create-admin";
    private final UsuarioRepository usuarioRepository;
    private final ConfigurableApplicationContext applicationContext;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AdminSetupRunner(UsuarioRepository usuarioRepository, ConfigurableApplicationContext applicationContext) {
        this.usuarioRepository = usuarioRepository;
        this.applicationContext = applicationContext;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!args.containsOption(CREATE_ADMIN_OPTION)) {
            return;
        }

        Console console = System.console();
        String nome;
        String email;
        String senha;
        if (console != null) {
            nome = valueOrPrompt(args, "admin-name", "Nome do administrador", false, console, null);
            email = valueOrPrompt(args, "admin-email", "Email do administrador", false, console, null);
            senha = valueOrPrompt(args, "admin-password", "Senha do administrador", true, console, null);
        } else {
            try (Scanner scanner = new Scanner(new FilterInputStream(System.in) {
                @Override
                public void close() {
                }
            })) {
                nome = valueOrPrompt(args, "admin-name", "Nome do administrador", false, null, scanner);
                email = valueOrPrompt(args, "admin-email", "Email do administrador", false, null, scanner);
                senha = valueOrPrompt(args, "admin-password", "Senha do administrador", true, null, scanner);
            }
        }

        if (usuarioRepository.findByEmail(email).isPresent()) {
            throw new IllegalStateException("Nao foi possivel criar o administrador: o email ja existe.");
        }

        Usuario admin = new Usuario();
        admin.setNome(nome);
        admin.setEmail(email);
        admin.setSenha(passwordEncoder.encode(senha));
        admin.setRole("ADMIN");
        usuarioRepository.save(admin);

        System.out.println("Administrador criado com sucesso para o email " + email + ".");
        applicationContext.close();
    }

    private String valueOrPrompt(
            ApplicationArguments args,
            String option,
            String label,
            boolean secret,
            Console console,
            Scanner scanner) {
        String value = args.getOptionValues(option) == null
                ? null
                : args.getOptionValues(option).get(0);
        if (value != null && !value.isBlank()) {
            return value.trim();
        }

        if (console != null) {
            String prompt = secret ? label + " (a senha nao sera exibida): " : label + ": ";
            String prompted = secret ? new String(console.readPassword(prompt)) : console.readLine(prompt);
            return prompted.trim();
        }

        if (secret) {
            System.out.println(label + " (a senha nao sera exibida):");
        }
        System.out.print(label + ": ");
        return scanner.nextLine().trim();
    }
}