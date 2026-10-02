package com.itb.inf3bn.givenet.config;

import com.itb.inf3bn.givenet.repository.UsuarioRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtService jwtService,
            UsuarioRepository usuarioRepository) throws Exception {
        JwtAuthenticationFilter jwtFilter = new JwtAuthenticationFilter(jwtService, usuarioRepository);

        return http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, exception) ->
                                response.sendError(HttpStatus.UNAUTHORIZED.value()))
                        .accessDeniedHandler((request, response, exception) ->
                                response.sendError(HttpStatus.FORBIDDEN.value())))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/usuarios/login", "/usuarios").permitAll()
                        .requestMatchers(HttpMethod.POST, "/ongs/solicitacoes").permitAll()
                        .requestMatchers(HttpMethod.GET, "/ongs/solicitacoes").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/ongs/admin/{id}/{acao}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/ongs", "/ongs/{id}", "/chat", "/chat/{id}").permitAll()
                        .requestMatchers(HttpMethod.POST, "/chat").permitAll()
                        .requestMatchers(HttpMethod.PATCH, "/doacoes/{id}/confirmar-entrega")
                        .hasAnyRole("ONG", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/usuarios").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/usuarios/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/usuarios/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/usuarios/{id}").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/usuarios/{id}/perfil").authenticated()
                        .requestMatchers(HttpMethod.POST, "/ongs").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/ongs/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/ongs/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/chat/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/chat/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/doacoes", "/doacoes/ong/{ongId}", "/doacoes/auditoria")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/doacoes/{id}", "/doacoes/usuario/{usuarioId}",
                                "/doacoes/historico/{id}")
                        .authenticated()
                        .requestMatchers(HttpMethod.POST, "/doacoes")
                        .authenticated()
                        .requestMatchers(HttpMethod.PUT, "/doacoes/{id}").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/doacoes/{id}").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/doacoes/{id}/cancelar").authenticated()
                        .anyRequest().permitAll())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
