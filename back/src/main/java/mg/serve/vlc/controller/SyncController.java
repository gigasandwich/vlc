package mg.serve.vlc.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import mg.serve.vlc.controller.response.ApiResponse;
import mg.serve.vlc.model.user.User;
import mg.serve.vlc.model.user.UserHistoric;
import mg.serve.vlc.repository.user.FirebaseUserRepository;
import mg.serve.vlc.repository.userHistoric.FirebaseUserHistoricRepository;
import mg.serve.vlc.util.RepositoryProvider;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.ListUsersPage;
import com.google.firebase.cloud.FirestoreClient;
import com.google.cloud.firestore.Firestore;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/sync")
public class SyncController {

    private static final Logger logger = LoggerFactory.getLogger(SyncController.class);

    @PostMapping("/users")
    public ResponseEntity<ApiResponse> syncUsers() {
        try {
            List<User> localUsers = RepositoryProvider.jpaUserRepository.findAll();
            if (localUsers.isEmpty()) {
                return ResponseEntity.ok(new ApiResponse("success", Collections.emptyList(), "No users to sync"));
            }

            List<String> errors = new ArrayList<>();
            List<User> syncedUsers = new ArrayList<>();

            // Process users in parallel for better performance
            List<CompletableFuture<Void>> futures = localUsers.stream()
                .map(user -> CompletableFuture.runAsync(() -> syncUser(user, syncedUsers, errors)))
                .collect(Collectors.toList());

            // Wait for all to complete
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

            // Delete Firebase Auth/Firestore users not in local DB
            Set<String> localEmails = localUsers.stream().map(User::getEmail).collect(Collectors.toSet());
            Map<String, String> firebaseUsers = new HashMap<>();
            ListUsersPage page = FirebaseAuth.getInstance().listUsers(null);
            while (page != null) {
                page.getValues().forEach(userRecord -> firebaseUsers.put(userRecord.getEmail(), userRecord.getUid()));
                page = page.getNextPage();
            }
            Firestore db = FirestoreClient.getFirestore();
            int deletedCount = 0;
            for (String email : firebaseUsers.keySet()) {
                if (!localEmails.contains(email)) {
                    String uid = firebaseUsers.get(email);
                    try {
                        // Delete from Auth
                        FirebaseAuth.getInstance().deleteUser(uid);
                        // Delete from Firestore
                        db.collection("users").document(uid).delete().get();
                        deletedCount++;
                        logger.info("Deleted user from Firebase: {}", email);
                    } catch (Exception e) {
                        errors.add("Failed to delete user from Firebase: " + email + " - " + e.getMessage());
                        logger.warn("Failed to delete user from Firebase: {}", email, e);
                    }
                }
            }

            String message = String.format("Synced %d users successfully. Deleted %d users from Firebase. %d errors occurred.", syncedUsers.size(), deletedCount, errors.size());
            if (!errors.isEmpty()) {
                message += " Errors: " + String.join("; ", errors);
            }

            return ResponseEntity.ok(new ApiResponse("success", syncedUsers, message));
        } catch (Exception e) {
            logger.error("Sync failed", e);
            return ResponseEntity.badRequest().body(new ApiResponse("error", null, "Sync failed totally: " + e.getMessage()));
        }
    }

    private void syncUser(User user, List<User> syncedUsers, List<String> errors) {
        try {
            FirebaseUserRepository firebaseUserRepository = new FirebaseUserRepository();
            FirebaseUserHistoricRepository firebaseUserHistoricRepository = new FirebaseUserHistoricRepository();

            // User: Firebase Auth / Firestore
            User syncedUser = firebaseUserRepository.save(user);
            syncedUsers.add(syncedUser);

            // UserHistoric(s): Firestore
            List<UserHistoric> historics = RepositoryProvider.jpaUserHistoricRepository.findByUserId(user.getId());
            for (UserHistoric historic : historics) {
                firebaseUserHistoricRepository.save(historic, syncedUser.getFbId());
            }

            logger.info("Successfully synced user: {}", user.getId());
        } catch (Exception ex) {
            String errorMsg = String.format("Failed to sync user %s: %s", user.getId(), ex.getMessage());
            errors.add(errorMsg);
            logger.warn(errorMsg, ex);
        }
    }
}