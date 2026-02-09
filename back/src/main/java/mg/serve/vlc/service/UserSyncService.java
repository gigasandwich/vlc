package mg.serve.vlc.service;

import mg.serve.vlc.controller.response.ApiResponse;
import mg.serve.vlc.controller.response.SyncStatistics;
import mg.serve.vlc.exception.BusinessLogicException;
import mg.serve.vlc.model.user.User;
import mg.serve.vlc.model.user.UserHistoric;
import mg.serve.vlc.repository.user.FirebaseUserRepository;
import mg.serve.vlc.repository.userHistoric.FirebaseUserHistoricRepository;
import mg.serve.vlc.repository.user.UserRepository;
import mg.serve.vlc.repository.userHistoric.UserHistoricRepository;
import mg.serve.vlc.util.RepositoryProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserSyncService {
    private static final Logger logger = LoggerFactory.getLogger(UserSyncService.class);
    FirebaseUserRepository firebaseUserRepository = new FirebaseUserRepository();
    FirebaseUserHistoricRepository firebaseUserHistoricRepository = new FirebaseUserHistoricRepository();

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
    public ApiResponse syncUsers() {
        try {
            List<User> localUsers = RepositoryProvider.jpaUserRepository.findAll();
            List<User> remoteUsers = firebaseUserRepository.findAll();

            Map<String, User> localMap = localUsers.stream().collect(Collectors.toMap(User::getEmail, u -> u));
            Map<String, User> remoteMap = remoteUsers.stream().collect(Collectors.toMap(User::getEmail, u -> u));

            Set<String> allUserEmails = new HashSet<>(localMap.keySet());
            allUserEmails.addAll(remoteMap.keySet());

            SyncStatistics stats = new SyncStatistics();

            for (String email : allUserEmails) {
                User local = localMap.get(email);
                User remote = remoteMap.get(email);

                try {
                    if (local == null && remote != null) {
                        // Firestore only
                        createLocalUser(remote);
                        stats.setUsersCreatedLocally(stats.getUsersCreatedLocally() + 1);
                    } else if (local != null && remote == null) {
                        // Local only
                        User updatedLocal = pushUserToFirestore(local);
                        ((UserRepository) RepositoryProvider.jpaUserRepository).save(updatedLocal); // To get fbId
                        stats.setUsersPushedToFirestore(stats.getUsersPushedToFirestore() + 1);
                    } else if (local.getUpdatedAt() != null && remote.getUpdatedAt() != null) {
                        if (local.getUpdatedAt().isAfter(remote.getUpdatedAt()) && !userDataEquals(local, remote)) {
                            // Local newer and data different
                            overwriteFirestoreUser(local);
                            stats.setUsersUpdatedInFirestore(stats.getUsersUpdatedInFirestore() + 1);
                        } else if (remote.getUpdatedAt().isAfter(local.getUpdatedAt()) && !userDataEquals(local, remote)) {
                            // Firestore newer and data different
                            overwriteLocalUser(remote);
                            stats.setUsersUpdatedLocally(stats.getUsersUpdatedLocally() + 1);
                        } else {
                            // identical timestamps or identical data: no op, thank you chatgpt
                        }
                    } else {
                        // Handle cases where updatedAt is null
                        if (local.getUpdatedAt() == null && remote.getUpdatedAt() != null) {
                            overwriteLocalUser(remote);
                            stats.setUsersUpdatedLocally(stats.getUsersUpdatedLocally() + 1);
                        } else if (local.getUpdatedAt() != null && remote.getUpdatedAt() == null) {
                            overwriteFirestoreUser(local);
                            stats.setUsersUpdatedInFirestore(stats.getUsersUpdatedInFirestore() + 1);
                        }
                        // if both null, no op
                    }
                } catch (Exception e) {
                    stats.addError("Failed to sync user " + email + ": " + e.getMessage());
                    logger.warn("Failed to sync user {}", email, e);
                }
            }

            return new ApiResponse("success", stats, stats.generateSummaryMessage());
        } catch (Exception e) {
            logger.error("Sync users failed", e);
            return new ApiResponse("error", null, "Sync users failed: " + e.getMessage());
        }
    }

    private User createLocalUser(User remote) throws BusinessLogicException {
        User local = new User();
        local.setEmail(remote.getEmail());
        local.setUsername(remote.getUsername());
        local.setUserStateId(remote.getUserStateId());
        local.setFbId(remote.getFbId());
        local.setPassword(remote.getPassword()); // Should be hashed
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
        // Save method already updates
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

    public ApiResponse syncUserHistoric() {
        try {
            List<User> allUsers = RepositoryProvider.jpaUserRepository.findAll();
            SyncStatistics stats = new SyncStatistics();

            for (User user : allUsers) {
                try {
                    List<UserHistoric> localHistory = RepositoryProvider.jpaUserHistoricRepository.findByUserId(user.getId());
                    List<UserHistoric> remoteHistory = firebaseUserHistoricRepository.findByUserFbId(user.getFbId());

                    // Find missing local historic entries or update existing
                    for (UserHistoric remoteHistoric : remoteHistory) {
                        Optional<UserHistoric> existing = localHistory.stream()
                            .filter(local -> Objects.equals(local.getFbId(), remoteHistoric.getFbId()))
                            .findFirst();
                        if (existing.isPresent()) {
                            // Update existing local historic
                            UserHistoric local = existing.get();
                            local.setEmail(remoteHistoric.getEmail());
                            local.setPassword(remoteHistoric.getPassword());
                            local.setUsername(remoteHistoric.getUsername());
                            local.setDate(remoteHistoric.getDate());
                            local.setUserStateId(remoteHistoric.getUserStateId());
                            ((UserHistoricRepository) RepositoryProvider.jpaUserHistoricRepository).save(local);
                            stats.setHistoricUpdatedLocally(stats.getHistoricUpdatedLocally() + 1);
                        } else {
                            insertLocalUserHistoric(remoteHistoric, user);
                            stats.setHistoricCreatedLocally(stats.getHistoricCreatedLocally() + 1);
                        }
                    }

                    // Find missing remote historic entries
                    for (UserHistoric localHistoric : localHistory) {
                        if (localHistoric.getFbId() == null || localHistoric.getFbId().isEmpty()) {
                            // Push to Firestore to get fb_id
                            UserHistoric savedRemote = insertRemoteUserHistoric(localHistoric);
                            if (savedRemote != null && savedRemote.getFbId() != null) {
                                localHistoric.setFbId(savedRemote.getFbId());
                                ((UserHistoricRepository) RepositoryProvider.jpaUserHistoricRepository).save(localHistoric);
                                stats.setHistoricPushedToFirestore(stats.getHistoricPushedToFirestore() + 1);
                            }
                        } else {
                            boolean existsRemotely = remoteHistory.stream().anyMatch(remote -> Objects.equals(remote.getFbId(), localHistoric.getFbId()));
                            if (!existsRemotely) {
                                insertRemoteUserHistoric(localHistoric);
                                stats.setHistoricPushedToFirestore(stats.getHistoricPushedToFirestore() + 1);
                            }
                        }
                    }

                    logger.info("Synced history for user: {}", user.getEmail());
                } catch (Exception e) {
                    stats.addError("Failed to sync history for user " + user.getEmail() + ": " + e.getMessage());
                    logger.warn("Failed to sync history for user {}", user.getEmail(), e);
                }
            }

            return new ApiResponse("success", stats, stats.generateSummaryMessage());
        } catch (Exception e) {
            logger.error("Sync user historic failed", e);
            return new ApiResponse("error", null, "Sync user historic failed: " + e.getMessage());
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

    private boolean userDataEquals(User u1, User u2) {
        return Objects.equals(u1.getEmail(), u2.getEmail()) &&
               Objects.equals(u1.getUsername(), u2.getUsername()) &&
               Objects.equals(u1.getPassword(), u2.getPassword()) &&
               Objects.equals(u1.getUserStateId(), u2.getUserStateId()) &&
               Objects.equals(u1.getRoles(), u2.getRoles());
    }

    private boolean historicDataEquals(UserHistoric h1, UserHistoric h2) {
        return Objects.equals(h1.getFbId(), h2.getFbId()) &&
               Objects.equals(h1.getEmail(), h2.getEmail()) &&
               Objects.equals(h1.getUsername(), h2.getUsername()) &&
               Objects.equals(h1.getPassword(), h2.getPassword()) &&
               Objects.equals(h1.getDate(), h2.getDate()) &&
               Objects.equals(h1.getUserStateId(), h2.getUserStateId());
    }
}