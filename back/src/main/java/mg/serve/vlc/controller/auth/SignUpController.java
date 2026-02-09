package mg.serve.vlc.controller.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import mg.serve.vlc.controller.response.*;
import mg.serve.vlc.exception.BusinessLogicException;
import mg.serve.vlc.model.user.User;
import mg.serve.vlc.security.JwtService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping("/auth/sign-up")
public class SignUpController {
    @Autowired
    private JwtService jwtService;

    @PostMapping
    @SecurityRequirement(name = "bearerAuth")
    // @Operation(summary = "Sign up a new user", description = "Uh, sign up a new user ?")
    ResponseEntity<ApiResponse> signUp(@RequestParam String email, @RequestParam String password,
                                        @RequestParam(required = false) String username, @RequestParam(defaultValue = "USER") String role,
                                        @RequestHeader("Authorization") String authHeader) {
        try {
            jwtService.throwIfUserNotAdmin(authHeader);

            User user = new User(email, password, username);
            user.signUp(role);

            Object data = "New account of " + email + " signed up successfully";
            ApiResponse response = new ApiResponse("success", data, null);
            return ResponseEntity.ok().body(response);
        } catch (BusinessLogicException blex) {
            ApiResponse response = new ApiResponse("error", null, blex.getMessage());
            return ResponseEntity.internalServerError().body(response);
        } catch (Exception ex) {
            ApiResponse response = new ApiResponse("error", null, ex.getMessage());
            return ResponseEntity.badRequest().body(response); // Should be internal server error too but it would be the same as ble so I made it 400
        }
    }
}
