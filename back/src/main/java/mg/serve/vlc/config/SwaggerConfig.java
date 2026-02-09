package mg.serve.vlc.config;

import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;

@Configuration
public class SwaggerConfig {

    @Bean
    public GroupedOpenApi authApi() {
        return GroupedOpenApi.builder()
                .group("auth")
                .pathsToMatch(
                    "/auth/sign-in",
                    "/auth/sign-up",
                    "/auth/reset-block/{userId}"
                )
                .build();
    }

    @Bean
    public GroupedOpenApi usersApi() {
        return GroupedOpenApi.builder()
                .group("users")
                .pathsToMatch(
                    "/users", // Just for debbuging
                    "/users/update",
                    "/users/delete"
                )
                .build();
    }

    @Bean
    public GroupedOpenApi pointsApi() {
        return GroupedOpenApi.builder()
                .group("points")
                .pathsToMatch(
                    "/points", "/points/summary",
                    "/points/list", "/points/{id}",
                    "/points/in-progress" , "/points/work-delay",
                    "/points/detailled"
                )
                .build();
    }
    
    @Bean
    public GroupedOpenApi syncApi() {
        return GroupedOpenApi.builder()
                .group("sync")
                .pathsToMatch(
                    "/sync/all"
                )
                .build();
    }

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new io.swagger.v3.oas.models.Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT Bearer token")));
    }
}
