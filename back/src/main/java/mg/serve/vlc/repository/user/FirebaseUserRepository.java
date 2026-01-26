package mg.serve.vlc.repository.user;

import mg.serve.vlc.model.user.User;

import java.util.*;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.auth.UserRecord.CreateRequest;
import com.google.firebase.cloud.FirestoreClient;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.auth.ExportedUserRecord;

public class FirebaseUserRepository implements UserRepository {

    @Override
    public User save(User user) {
        try {
            System.out.println("Saving user to Firebase: " + user.getEmail());

            CreateRequest request = new CreateRequest()
                    .setEmail(user.getEmail())
                    .setPassword(user.getPassword())
                    .setDisplayName(user.getUsername());

            UserRecord userRecord = FirebaseAuth.getInstance().createUser(request);
            String fbId = userRecord.getUid();

            System.out.println("Successfully created Firebase user: " + userRecord.getUid());

            Firestore firestore = FirestoreClient.getFirestore();
            firestore.collection("users").document(fbId).set(user.toMap()).get();
            user.setFbId(fbId); // So that the historic can still use it

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
            user.setUsername(userRecord.getDisplayName());

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
    public List<User> findAll() {
        try {
            System.out.println("Fetching all users from Firebase");

            Iterable<ExportedUserRecord> userRecords = FirebaseAuth.getInstance().listUsers(null).getValues();
            List<User> users = new ArrayList<>();

            for (ExportedUserRecord userRecord : userRecords) {
                User user = new User();
                user.setEmail(userRecord.getEmail());
                user.setUsername(userRecord.getDisplayName());
                users.add(user);
            }

            return users;
        } catch (Exception e) {
            System.err.println("Error fetching users from Firebase: " + e.getMessage());
            throw new RuntimeException("Failed to fetch users from Firebase", e);
        }
    }
}