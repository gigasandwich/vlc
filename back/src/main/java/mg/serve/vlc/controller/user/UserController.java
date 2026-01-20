package mg.serve.vlc.controller.user;

import mg.serve.vlc.controller.response.ApiResponse;
import mg.serve.vlc.exception.BusinessLogicException;
import mg.serve.vlc.model.user.User;
import mg.serve.vlc.repository.user.UserRepository;
import mg.serve.vlc.util.RepositoryProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import mg.serve.vlc.security.JwtService;

@RestController
@RequestMapping("/users")
public class UserController {
    private final JwtService jwtService;

    public UserController(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse> updateUser(@RequestParam String email, @RequestParam(required = false) String password, @RequestParam(required = false) String username, @RequestHeader("Authorization") String authHeader) {
        try {
            String tokenEmail = jwtService.getTokenEmailFromHeader(authHeader);
            if (!email.equals(tokenEmail)) {
                return ResponseEntity.status(403).body(new ApiResponse("error", null, "You can only update your own account"));
            }

            UserRepository userRepository = RepositoryProvider.getUserRepository();
            User user = userRepository.findByEmail(email).get();
            if (user == null) {
                return ResponseEntity.badRequest().body(new ApiResponse("error", null, "User not found"));
            }
            user.update(email, password, username);
            return ResponseEntity.ok(new ApiResponse("success", "User updated", null));
        } catch (BusinessLogicException e) {
            return ResponseEntity.badRequest().body(new ApiResponse("error", null, e.getMessage()));
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<ApiResponse> deleteUser(@RequestParam String email, @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(new ApiResponse("error", null, "Missing or invalid Authorization header"));
            }
            String tokenEmail = jwtService.getTokenEmailFromHeader(authHeader);
            if (!email.equals(tokenEmail)) {
                return ResponseEntity.status(403).body(new ApiResponse("error", null, "You can only delete your own account"));
            }

            UserRepository userRepository = RepositoryProvider.userRepository;
            User user = userRepository.findByEmail(email).get();
            if (user == null) {
                return ResponseEntity.badRequest().body(new ApiResponse("error", null, "User not found"));
            }
            user.delete();
            return ResponseEntity.ok(new ApiResponse("success", "User deleted (state updated)", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse("error", null, e.getMessage()));
        }
    }
}
