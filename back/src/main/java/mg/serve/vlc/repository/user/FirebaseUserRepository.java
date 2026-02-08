package mg.serve.vlc.repository.user;

import mg.serve.vlc.model.user.User;
import mg.serve.vlc.model.Role;

import java.util.*;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.auth.UserRecord.CreateRequest;
import com.google.firebase.auth.UserRecord.UpdateRequest;
import com.google.firebase.cloud.FirestoreClient;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.Timestamp;
import java.util.concurrent.ExecutionException;

public class FirebaseUserRepository implements UserRepository {
    private final Firestore db;
    private final CollectionReference collectionReference;

    public FirebaseUserRepository() {
        db = FirestoreClient.getFirestore();
        this.collectionReference = db.collection("users");
    }

    @Override
    public List<User> findAll() {
        try {
            Firestore firestore = FirestoreClient.getFirestore();
            // I'm using full package to remember the class
            Iterable<com.google.cloud.firestore.DocumentReference> docs = firestore.collection("users").listDocuments();
            List<User> users = new ArrayList<>();

            for (com.google.cloud.firestore.DocumentReference doc : docs) {
                Map<String, Object> data = doc.get().get().getData();
                if (data != null) {
                    User user = new User();
                    user.setFbId(doc.getId());
                    if (data.get("id") != null) {
                        user.setId(((Long) data.get("id")).intValue());
                    }
                    user.setEmail((String) data.get("email"));
                    user.setUsername((String) data.get("username"));
                    if (data.get("userStateId") != null) {
                        user.setUserStateId(((Long) data.get("userStateId")).intValue());
                    }
                    if (data.get("updatedAt") != null) {
                        user.setUpdatedAt(((com.google.cloud.Timestamp) data.get("updatedAt")).toSqlTimestamp().toLocalDateTime());
                    }

                    // Handle roles
                    List<Map<String, Object>> rolesData = (List<Map<String, Object>>) data.get("roles");
                    if (rolesData != null) {
                        Set<Role> roles = new HashSet<>();
                        for (Map<String, Object> roleData : rolesData) {
                            Role role = new Role();
                            if (roleData.get("id") != null) {
                                role.setId(((Long) roleData.get("id")).intValue());
                            }
                            role.setLabel((String) roleData.get("label"));
                            roles.add(role);
                        }
                        user.setRoles(roles);
                    }

                    users.add(user);
                }
            }

            return users;
        } catch (Exception e) {
            System.err.println("Error fetching all users from Firebase: " + e.getMessage());
            // throw new RuntimeException("Failed to fetch all users from Firebase " + e.getMessage(), e);
        }

        return Collections.emptyList();
    }

    // TODO: save all the fk too: roles, userState
    @Override
    public User save(User user) {
        try {
            System.out.println("Saving user to Firebase: " + user.getEmail());

            UserRecord existing = null;
            try {
                existing = FirebaseAuth.getInstance().getUserByEmail(user.getEmail());
            } catch (Exception e) {
                // User not found, will create (l-101)
            }

            String fbId;
            if (existing != null) {
                fbId = existing.getUid();
                // Update existing user, TODO: make it better
                UpdateRequest updateRequest = new UpdateRequest(fbId)
                        .setDisplayName(user.getUsername());
                FirebaseAuth.getInstance().updateUser(updateRequest);
                System.out.println("Successfully updated Firebase user: " + fbId);
            } else {
                // Create new user
                CreateRequest request = new CreateRequest()
                        .setEmail(user.getEmail())
                        .setPassword(user.getPassword() != null ? user.getPassword() : "defaultpassword")
                        .setDisplayName(user.getUsername());
                UserRecord userRecord = FirebaseAuth.getInstance().createUser(request);
                fbId = userRecord.getUid();
                System.out.println("Successfully created Firebase user: " + fbId);
            }

            user.setFbId(fbId);
            user.setUpdatedAt(java.time.LocalDateTime.now());

            Firestore firestore = FirestoreClient.getFirestore();
            firestore.collection("users").document(fbId).set(user.toMap()).get();

            return user;
        } catch (Exception e) {
            System.err.println("Error saving user to Firebase: " + e.getMessage());
            throw new RuntimeException("Failed to save user to Firebase " + e.getMessage(), e);
        }
    }

    @Override
    public Optional<User> findByEmail(String email) {
        try {
            System.out.println("Finding user in Firebase by email: " + email);

            UserRecord userRecord = FirebaseAuth.getInstance().getUserByEmail(email);

            User user = new User();
            user.setEmail(userRecord.getEmail());
            user.setUsername(userRecord.getDisplayName()); // TODO: Should get full user, not just the one from UserRecord

            return Optional.of(user);
        } catch (Exception e) {
            System.err.println("User not found in Firebase: " + e.getMessage());
            return Optional.empty();
        }
    }

    @Override
    public Optional<User> findById(Integer id) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'findById'");
    }

    @Override
    public List<User> findByUserStateId(Integer userStateId) {
        try {
            System.out.println("Fetching users from Firebase by userStateId: " + userStateId);

            Firestore firestore = FirestoreClient.getFirestore();
            Iterable<com.google.cloud.firestore.DocumentReference> docs = firestore.collection("users").listDocuments();
            List<User> users = new ArrayList<>();

            for (com.google.cloud.firestore.DocumentReference doc : docs) {
                Map<String, Object> data = doc.get().get().getData();
                if (data != null && data.get("userStateId") != null && ((Long) data.get("userStateId")).intValue() == userStateId) {
                    User user = new User();
                    user.setEmail((String) data.get("email"));
                    user.setUsername((String) data.get("username"));
                    user.setUserStateId(((Long) data.get("userStateId")).intValue());
                    if (data.get("updatedAt") != null) {
                        user.setUpdatedAt(((Timestamp) data.get("updatedAt")).toSqlTimestamp().toLocalDateTime());
                    }
                    users.add(user);
                }
            }

            return users;
        } catch (Exception e) {
            System.err.println("Error fetching users by userStateId from Firebase: " + e.getMessage());
            throw new RuntimeException("Failed to fetch users by userStateId from Firebase", e);
        }
    }

    public void deleteByUserFbId(String userFbId) 
        throws FirebaseAuthException, // Auth
                InterruptedException, ExecutionException { // Firestore
        // Auth
        FirebaseAuth.getInstance().deleteUser(userFbId);
        // Firestore
        collectionReference.document(userFbId).delete().get();
    }
}