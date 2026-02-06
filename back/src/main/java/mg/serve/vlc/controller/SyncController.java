package mg.serve.vlc.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import mg.serve.vlc.controller.response.ApiResponse;
import mg.serve.vlc.model.Example;
import mg.serve.vlc.model.user.User;
import mg.serve.vlc.model.user.UserHistoric;
import mg.serve.vlc.repository.user.FirebaseUserRepository;
import mg.serve.vlc.repository.userHistoric.FirebaseUserHistoricRepository;
import mg.serve.vlc.util.RepositoryProvider;

import java.util.*;

@RestController
@RequestMapping("/sync")
class SyncController {
    @PostMapping("/users")
    public ResponseEntity<ApiResponse> syncUsers() {
        try {
            FirebaseUserRepository firebaseUserRepository = new FirebaseUserRepository();
            FirebaseUserHistoricRepository firebaseUserHistoricRepository = new FirebaseUserHistoricRepository();

            List<Exception> exceptions = new ArrayList<>(); // Just to see fi there are any abnomal exceptions besides the normal ones (already existing emails)

            List<User> localUsers = RepositoryProvider.jpaUserRepository.findAll();
            for (User user : localUsers) {
                try {
                    // User: fireAuth, fireStore
                    user = firebaseUserRepository.save(user); // to get the fbId

                    // UserHistoric: firestore
                    List<UserHistoric> historics = RepositoryProvider.jpaUserHistoricRepository.findByUserId(user.getId());
                    for (UserHistoric historic : historics) {
                        firebaseUserHistoricRepository.save(historic, user.getFbId());
                    }
                } catch (Exception ex) {
                    exceptions.add(ex);
                }
            }
            return ResponseEntity.ok(new ApiResponse("success", localUsers, exceptionsToString(exceptions)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse("error", null, "Sync failed: " + e.getMessage()));
        }
    }

    private static String exceptionsToString(List<Exception> ex) {
        StringBuilder sb = new StringBuilder();
        for (Exception e : ex) {
            sb.append(e.getMessage()).append("\n");
        }
        return sb.toString();
    }
}