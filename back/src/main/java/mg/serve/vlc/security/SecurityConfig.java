package mg.serve.vlc.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import mg.serve.vlc.controller.response.ApiResponse;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

   @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth

                
                .requestMatchers(HttpMethod.GET, "/").permitAll()
                .requestMatchers(HttpMethod.POST, "/auth/sign-up").permitAll()
                .requestMatchers(HttpMethod.POST, "/auth/sign-in").permitAll()


                .requestMatchers(
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    "/swagger-ui.html"
                ).permitAll()

                .requestMatchers(
                    "/points", "/points/summary", "/points/list",
                    "/points/factories", "/points/pointStates", "/points/pointTypes",
                    "/points/inProgress","/points/work-delay",
                    "/points/detailled",
                    "/prices/current", "/prices/history"
                ).permitAll()

                .requestMatchers(
                    "/users" // Debug
                ).permitAll()

                .requestMatchers(
                    "/sync/all", // Debug
                    "/sync/users"
                ).permitAll()

                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(
                    (request, response, authException) -> writeUnauthorized(response, authException)
                )
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    
    private void writeUnauthorized(HttpServletResponse response, Exception ex) {
        try {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());

            String message = "Unauthenticated: missing or invalid token";
            if (ex != null) {
                String exMsg = ex.getMessage();
                message = (ex.getClass() != null ? ex.getClass().getSimpleName() : "Exception")
                        + (exMsg != null && !exMsg.isBlank() ? ": " + exMsg : "");
            }

            ApiResponse body = new ApiResponse("error", null, message);
            new ObjectMapper().writeValue(response.getWriter(), body);
        } catch (Exception e) {
            ApiResponse body = new ApiResponse("error", null, e.getMessage());
            try {
                new ObjectMapper().writeValue(response.getWriter(), body);
            } catch (IOException ioe) {
                ioe.printStackTrace();
            }
        }
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}