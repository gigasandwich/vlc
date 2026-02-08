package mg.serve.vlc.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import mg.serve.vlc.controller.response.ApiResponse;
import mg.serve.vlc.exception.BusinessLogicException;
import mg.serve.vlc.model.user.User;
import mg.serve.vlc.model.user.UserHistoric;
import mg.serve.vlc.repository.user.FirebaseUserRepository;
import mg.serve.vlc.repository.userHistoric.FirebaseUserHistoricRepository;
import mg.serve.vlc.repository.user.UserRepository;
import mg.serve.vlc.repository.userHistoric.UserHistoricRepository;
import mg.serve.vlc.util.RepositoryProvider;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.ListUsersPage;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/sync")
public class SyncController {
    private static final Logger logger = LoggerFactory.getLogger(SyncController.class);
    FirebaseUserRepository firebaseUserRepository = new FirebaseUserRepository();
    FirebaseUserHistoricRepository firebaseUserHistoricRepository = new FirebaseUserHistoricRepository();

    @PostMapping("/all")
    public ResponseEntity<ApiResponse> syncAll() {
        try {
            syncUsers();
            syncUserHistoric();
            // syncPoints();
            // syncPointHistoric();
            return ResponseEntity.ok(new ApiResponse("success", null, "All sync completed"));
        } catch (Exception e) {
            logger.error("Sync all failed", e);
            return ResponseEntity.badRequest().body(new ApiResponse("error", null, "Sync all failed: " + e.getMessage()));
        }
    }

    /*
        syncUsers():
            localUsers = loadAllLocalUsers()
            remoteUsers = loadAllFirestoreUsers()

            localMap  = mapById(localUsers)
            remoteMap = mapById(remoteUsers)

            allUserIds = union(localMap.keys, remoteMap.keys)

            for each userId in allUserIds:

                local  = localMap.get(userId)
                remote = remoteMap.get(userId)

                if local == null and remote != null:
                    // U1: Firestore only
                    createLocalUser(remote)
                    continue

                if local != null and remote == null:
                    // U2: Local only
                    pushUserToFirestore(local)
                    continue

                if local.updatedAt > remote.updatedAt:
                    // U3: Local newer
                    overwriteFirestoreUser(local)
                else if remote.updatedAt > local.updatedAt:
                    // U4: Firestore newer
                    overwriteLocalUser(remote)
                else:
                    // identical timestamps → no-op
                    continue
    */
    @PostMapping("/users")
    public ResponseEntity<ApiResponse> syncUsers() {
        try {
            List<User> localUsers = RepositoryProvider.jpaUserRepository.findAll();
            List<User> remoteUsers = firebaseUserRepository.findAll();

            Map<String, User> localMap = localUsers.stream().collect(Collectors.toMap(User::getEmail, u -> u));
            Map<String, User> remoteMap = remoteUsers.stream().collect(Collectors.toMap(User::getEmail, u -> u));

            Set<String> allUserEmails = new HashSet<>(localMap.keySet());
            allUserEmails.addAll(remoteMap.keySet());

            List<String> errors = new ArrayList<>();
            List<User> syncedUsers = new ArrayList<>();

            for (String email : allUserEmails) {
                User local = localMap.get(email);
                User remote = remoteMap.get(email);

                try {
                    if (local == null && remote != null) {
                        // Firestore only
                        createLocalUser(remote);
                        syncedUsers.add(remote);
                    } else if (local != null && remote == null) {
                        // Local only
                        User updatedLocal = pushUserToFirestore(local);
                        ((UserRepository) RepositoryProvider.jpaUserRepository).save(updatedLocal); // To get fbId
                        syncedUsers.add(updatedLocal);
                    } else if (local.getUpdatedAt() != null && remote.getUpdatedAt() != null) {
                        if (local.getUpdatedAt().isAfter(remote.getUpdatedAt())) {
                            // Local newer
                            overwriteFirestoreUser(local);
                            syncedUsers.add(local);
                        } else if (remote.getUpdatedAt().isAfter(local.getUpdatedAt())) {
                            // Firestore newer
                            overwriteLocalUser(remote);
                            syncedUsers.add(remote);
                        } else {
                            // identical timestamps: no op, chatgpt advised this
                        }
                    } else {
                        // Handle cases where updatedAt is null
                        if (local.getUpdatedAt() == null && remote.getUpdatedAt() != null) {
                            overwriteLocalUser(remote);
                            syncedUsers.add(remote);
                        } else if (local.getUpdatedAt() != null && remote.getUpdatedAt() == null) {
                            overwriteFirestoreUser(local);
                            syncedUsers.add(local);
                        }
                        // if both null, no op
                    }
                } catch (Exception e) {
                    errors.add("Failed to sync user " + email + ": " + e.getMessage());
                    logger.warn("Failed to sync user {}", email, e);
                }
            }

            String message = String.format("Synced %d users. %d errors occurred.", syncedUsers.size(), errors.size());
            if (!errors.isEmpty()) {
                message += " Errors: " + String.join("; ", errors);
            }

            return ResponseEntity.ok(new ApiResponse("success", syncedUsers, message));
        } catch (Exception e) {
            logger.error("Sync users failed", e);
            return ResponseEntity.badRequest().body(new ApiResponse("error", null, "Sync users failed: " + e.getMessage()));
        }
    }

    private User createLocalUser(User remote) throws BusinessLogicException {
        User local = new User();
        local.setEmail(remote.getEmail());
        local.setUsername(remote.getUsername());
        local.setUserStateId(remote.getUserStateId());
        local.setFbId(remote.getFbId());
        local.setPassword("firebase"); // Default password
        local.setRoles(remote.getRoles());
        local.setUpdatedAt(remote.getUpdatedAt());
        ((UserRepository) RepositoryProvider.jpaUserRepository).save(local);
        logger.info("Created local user: {}", remote.getEmail());
        return local;
    }

    private User pushUserToFirestore(User local) {
        User newUser = firebaseUserRepository.save(local);
        logger.info("Pushed user to Firestore: {}", local.getEmail());
        return newUser;
    }

    private User overwriteFirestoreUser(User local) {
        // Assuming save updates if exists
        User updatedUser = firebaseUserRepository.save(local);
        logger.info("Overwrote Firestore user: {}", local.getEmail());
        return updatedUser;
    }

    private User overwriteLocalUser(User remote) throws BusinessLogicException {
        User local = RepositoryProvider.jpaUserRepository.findByEmail(remote.getEmail()).orElseThrow(() -> new BusinessLogicException("Local user not found"));
        local.setUsername(remote.getUsername());
        local.setUserStateId(remote.getUserStateId());
        local.setFbId(remote.getFbId());
        local.setRoles(remote.getRoles());
        local.setUpdatedAt(remote.getUpdatedAt());
        ((UserRepository) RepositoryProvider.jpaUserRepository).save(local);
        logger.info("Overwrote local user: {}", remote.getEmail());
        return local;
    }

    @PostMapping("/userHistoric")
    public ResponseEntity<ApiResponse> syncUserHistoric() {
        try {
            List<User> allUsers = RepositoryProvider.jpaUserRepository.findAll();
            List<String> errors = new ArrayList<>();
            int totalSynced = 0;

            for (User user : allUsers) {
                try {
                    List<UserHistoric> localHistory = RepositoryProvider.jpaUserHistoricRepository.findByUserId(user.getId());
                    List<UserHistoric> remoteHistory = firebaseUserHistoricRepository.findByUserFbId(user.getFbId());

                    Set<Integer> localIds = localHistory.stream().map(UserHistoric::getId).collect(Collectors.toSet());
                    Set<Integer> remoteIds = remoteHistory.stream().map(UserHistoric::getId).collect(Collectors.toSet());

                    Set<Integer> missingLocal = new HashSet<>(remoteIds);
                    missingLocal.removeAll(localIds);

                    Set<Integer> missingRemote = new HashSet<>(localIds);
                    missingRemote.removeAll(remoteIds);

                    Map<Integer, UserHistoric> remoteMap = remoteHistory.stream().collect(Collectors.toMap(UserHistoric::getId, h -> h));
                    Map<Integer, UserHistoric> localMap = localHistory.stream().collect(Collectors.toMap(UserHistoric::getId, h -> h));

                    for (Integer id : missingLocal) {
                        UserHistoric remoteHistoric = remoteMap.get(id);
                        if (remoteHistoric != null) {
                            insertLocalUserHistoric(remoteHistoric, user);
                            totalSynced++;
                        }
                    }

                    for (Integer id : missingRemote) {
                        UserHistoric localHistoric = localMap.get(id);
                        if (localHistoric != null) {
                            insertRemoteUserHistoric(localHistoric);
                            totalSynced++;
                        }
                    }

                    logger.info("Synced history for user: {}", user.getEmail());
                } catch (Exception e) {
                    errors.add("Failed to sync history for user " + user.getEmail() + ": " + e.getMessage());
                    logger.warn("Failed to sync history for user {}", user.getEmail(), e);
                }
            }

            String message = String.format("Synced %d historic entries. %d errors occurred.", totalSynced, errors.size());
            if (!errors.isEmpty()) {
                message += " Errors: " + String.join("; ", errors);
            }

            return ResponseEntity.ok(new ApiResponse("success", null, message));
        } catch (Exception e) {
            logger.error("Sync user historic failed", e);
            return ResponseEntity.badRequest().body(new ApiResponse("error", null, "Sync user historic failed: " + e.getMessage()));
        }
    }

    private UserHistoric insertLocalUserHistoric(UserHistoric remoteHistoric, User user) {
        UserHistoric localHistoric = new UserHistoric();
        localHistoric.setEmail(remoteHistoric.getEmail());
        localHistoric.setPassword(remoteHistoric.getPassword());
        localHistoric.setUsername(remoteHistoric.getUsername());
        localHistoric.setDate(remoteHistoric.getDate());
        localHistoric.setUserStateId(remoteHistoric.getUserStateId());
        localHistoric.setFbId(remoteHistoric.getFbId());
        localHistoric.setUser(user);
        return ((UserHistoricRepository) RepositoryProvider.jpaUserHistoricRepository).save(localHistoric);
    }

    private UserHistoric insertRemoteUserHistoric(UserHistoric localHistoric) {
        if (localHistoric.getUser() == null || localHistoric.getUser().getFbId() == null || localHistoric.getUser().getFbId().isEmpty()) {
            logger.warn("Skipping insert remote historic for user with null or empty fbId");
            return null;
        }
        return firebaseUserHistoricRepository.save(localHistoric, localHistoric.getUser().getFbId());
    }
}