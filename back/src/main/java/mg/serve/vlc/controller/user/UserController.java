package mg.serve.vlc.controller.user;

import mg.serve.vlc.controller.response.ApiResponse;
import mg.serve.vlc.exception.BusinessLogicException;
import mg.serve.vlc.model.user.User;
import mg.serve.vlc.repository.UserRepository;
import mg.serve.vlc.util.RepositoryProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {
    @PutMapping("/update")
    public ResponseEntity<ApiResponse> updateUser(@RequestParam String email, @RequestParam(required = false) String password, @RequestParam(required = false) String username) {
        try {
            UserRepository userRepository = RepositoryProvider.userRepository;
            User user = userRepository.findByEmail(email);
            if (user == null) {
                return ResponseEntity.badRequest().body(new ApiResponse("error", null, "User not found"));
            }
            user.update(email, password, username);
            return ResponseEntity.ok(new ApiResponse("success", "Updated user", null));
        } catch (BusinessLogicException e) {
            return ResponseEntity.badRequest().body(new ApiResponse("error", null, e.getMessage()));
        }
    }
}
