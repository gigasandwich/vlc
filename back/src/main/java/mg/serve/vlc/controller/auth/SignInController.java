package mg.serve.vlc.controller.auth;

import lombok.RequiredArgsConstructor;
import mg.serve.vlc.controller.response.ApiResponse;
import mg.serve.vlc.exception.BusinessLogicException;
import mg.serve.vlc.model.user.User;
import mg.serve.vlc.repository.UserRepository;
import mg.serve.vlc.security.*;
import mg.serve.vlc.util.RepositoryProvider;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/auth/sign-in")
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
    @PostMapping
    public ResponseEntity<ApiResponse> signIn(@RequestParam String email, @RequestParam String password) {
        try {
            if (email == null || password == null) {
                return ResponseEntity.badRequest().body(
                    new ApiResponse("error", null, "Email and password must be provided")
                );
            }

            UserRepository userRepository = RepositoryProvider.userRepository;

            User foundUser = null;
            for (User user : userRepository.findAll()) {
                /**
                 * I know that adding one single if (email.equals(user.getEmail())) is enough
                 * But I think this is more readable this way
                 */
                if (email.equals(user.getEmail())) {
                    if (user.getUserStateId() == 3) {
                        throw new BusinessLogicException("User account is blocked due to multiple wrong login attempts");
                    }
                }

                if (email.equals(user.getEmail()) && !password.equals(user.getPassword())) {
                    user.logWrongAttempt(); // Throws BusinessLogicException
                }

                if (email.equals(user.getEmail()) && password.equals(user.getPassword())) {
                    foundUser = user;
                    break;
                }
            }
            if (foundUser == null) {
                return ResponseEntity.status(401).body(
                    new ApiResponse("error", null, "Invalid email or password")
                );
            }

            String token = jwtService.generateToken(email);
            Instant exp = jwtService.getExpiryFromNow();

            Map<String, String> data = new HashMap<>();
            data.put("token", token);
            data.put("expiresAt", exp.toString());
            return ResponseEntity.ok(new ApiResponse("success", data, null));
        } catch (BusinessLogicException e) {
            return ResponseEntity.badRequest().body(new ApiResponse("error", null, e.getMessage()));
        }
    }
}