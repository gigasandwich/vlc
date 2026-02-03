package mg.serve.vlc.config;

import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public GroupedOpenApi authApi() {
        return GroupedOpenApi.builder()
                .group("auth")
                .pathsToMatch(
                    "/auth/sign-in",
                    "/auth/sign-up",
                    "/auth/reset-block/{userId}",
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
                    "/points/list", "/points/{id}"
                )
                .build();
    }
    
}
