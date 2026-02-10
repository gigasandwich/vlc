package mg.serve.vlc.controller.user;

import mg.serve.vlc.controller.response.ApiResponse;
import mg.serve.vlc.exception.BusinessLogicException;
import mg.serve.vlc.model.user.User;
import mg.serve.vlc.repository.user.UserRepository;
import mg.serve.vlc.util.RepositoryProvider;
import mg.serve.vlc.service.FirestoreUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import mg.serve.vlc.security.JwtService;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
public class UserController {
    private final JwtService jwtService;
    private final FirestoreUserService firestoreUserService;

    public UserController(JwtService jwtService, FirestoreUserService firestoreUserService) {
        this.jwtService = jwtService;
        this.firestoreUserService = firestoreUserService;
    }

    @GetMapping("/blocked")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse> getBlockedUsers(@RequestHeader("Authorization") String authHeader) {
        try {
            jwtService.throwIfUserNotAdmin(authHeader);

            // Fetch blocked users from Firestore (attempt >= 3)
            List<Map<String, Object>> blockedUsers = firestoreUserService.getBlockedUsers();

            return ResponseEntity.ok(new ApiResponse("success", blockedUsers, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse("error", null, e.getMessage()));
        }
    }

    @PutMapping("/update")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse> updateUser(@RequestParam String email, @RequestParam(required = false) String password, @RequestParam(required = false) String username, @RequestHeader("Authorization") String authHeader) {
        try {
            jwtService.throwIfUserNotAdmin(authHeader);

            // String tokenEmail = jwtService.getTokenEmailFromHeader(authHeader);
            // if (!email.equals(tokenEmail)) {
            //     return ResponseEntity.status(403).body(new ApiResponse("error", null, "You can only update your own account"));
            // }

            UserRepository userRepository = RepositoryProvider.getRepository(UserRepository.class);
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
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse> deleteUser(@RequestParam String email, @RequestHeader("Authorization") String authHeader) {
        try {
            jwtService.throwIfUserNotAdmin(authHeader);

            UserRepository userRepository = RepositoryProvider.getRepository(UserRepository.class);
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

    @PutMapping("/deblock/{fbId}")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse> deblockUser(@PathVariable String fbId, @RequestHeader("Authorization") String authHeader) {
        try {
            jwtService.throwIfUserNotAdmin(authHeader);
            
            // attempt = 0
            firestoreUserService.deblockUser(fbId);
            
            return ResponseEntity.ok(new ApiResponse("success", null, "User deblocked successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse("error", null, e.getMessage()));
        }
    }

    @GetMapping
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse> getAllUsers(@RequestHeader("Authorization") String authHeader) { // @RequestHeader("Authorization") String authHeader
        try {
            // User user = jwtService.getUserFromAuthHeader(authHeader);
            // if (!user.isAdmin()) {
            //     throw new BusinessLogicException("Only admins can view all users");
            // }
            jwtService.throwIfUserNotAdmin(authHeader);

            UserRepository userRepository = RepositoryProvider.getRepository(UserRepository.class);
            List<User> users = userRepository.findAll();

            List<Map<String, Object>> data = users.stream().map(u -> {
                return u.toMap();
            }).collect(Collectors.toList());

            return ResponseEntity.ok(new ApiResponse("success", data, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse("error", null, e.getMessage()));
        }
    }
}