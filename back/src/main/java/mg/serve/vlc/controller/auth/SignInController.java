package mg.serve.vlc.controller.auth;

import lombok.RequiredArgsConstructor;
import mg.serve.vlc.controller.response.ApiResponse;
import mg.serve.vlc.exception.BusinessLogicException;
import mg.serve.vlc.model.user.User;
import mg.serve.vlc.model.UserLog;
import mg.serve.vlc.repository.user.UserRepository;
import mg.serve.vlc.security.*;
import mg.serve.vlc.util.RepositoryProvider;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class SignInController {
    @Autowired
    private final JwtService jwtService;

    /*
    curl -X POST http://localhost:1234/auth/sign-in \
    -H "Content-Type: application/json" \
    -d '{
        "email": "email@gmail.com",
        "password": "test"
    }'
    */
    @PostMapping("/sign-in")
    public ResponseEntity<ApiResponse> signIn(@RequestParam String email, @RequestParam String password) {
        try {
            if (email == null || password == null) {
                return ResponseEntity.badRequest().body(
                    new ApiResponse("error", null, "Email and password must be provided")
                );
            }

            User user = new User(email, password, null);
            Map<String, String> signInResult = user.signIn(password);
            
            if ("firebase".equals(signInResult.get("provider"))) {
                Map<String, String> data = new HashMap<>();
                data.put("token", signInResult.get("token"));
                data.put("provider", "firebase");
                return ResponseEntity.ok(new ApiResponse("success", data, null));
            } else {
                // Local provider
                String token = jwtService.generateToken(signInResult.get("email"));
                Instant exp = jwtService.getExpiryFromNow();

                // Should be in another function but too lazy to refactor for now
                User userFromToken = jwtService.getUserFromToken(token);
                if (!userFromToken.isAdmin()) {
                    throw new BusinessLogicException("Access denied: Admins only");
                }

                Map<String, String> data = new HashMap<>();
                data.put("token", token);
                data.put("expiresAt", exp.toString());
                data.put("provider", "local");
                return ResponseEntity.ok(new ApiResponse("success", data, null));
            }
        } catch (BusinessLogicException e) {
            return ResponseEntity.badRequest().body(new ApiResponse("error", null, e.getMessage()));
        }
    }

    @PostMapping("/reset-block/{userId}")
    public ResponseEntity<ApiResponse> resetBlock(@PathVariable Integer userId, @RequestHeader("Authorization") String authHeader) {
        try {
            // Control
            User userFrom = jwtService.getUserFromAuthHeader(authHeader);
            if (!userFrom.isAdmin()) {
                throw new BusinessLogicException("Only admins can reset user blocks");
            }

            User userToReset = RepositoryProvider.getRepository(UserRepository.class).findById(userId)
                    .orElseThrow(() -> new EntityNotFoundException("User not found"));

            if (userToReset.getUserStateId() != 3) {
                throw new BusinessLogicException("User is not blocked");
            }

            // Business logic
            userToReset.setUserStateId(1);

            UserLog log = new UserLog();
            log.setAction(RepositoryProvider.actionRepository.findByLabel("LOGIN_ATTEMPT_RESET")
                    .orElseThrow(() -> new EntityNotFoundException("Action 'reset' not found")));
            log.setDate(LocalDateTime.now());
            log.setState(1.0);
            log.setUserFrom(userFrom);
            log.setUserTo(userToReset);

            // Persistence
            RepositoryProvider.getRepository(UserRepository.class).save(userToReset);
            RepositoryProvider.userLogRepository.save(log);
            userToReset.saveHistoric();

            return ResponseEntity.ok(new ApiResponse("success", null, "User block reset successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse("error", null, e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            User user = jwtService.getUserFromAuthHeader(authHeader);
            Map<String, Object> data = new HashMap<>();
            data.put("id", user.getId());
            data.put("email", user.getEmail());
            data.put("name", user.getUsername() != null ? user.getUsername() : user.getEmail());
            data.put("role", user.isAdmin() ? "admin" : "user");
            return ResponseEntity.ok(new ApiResponse("success", data, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse("error", null, e.getMessage()));
        }
    }
}