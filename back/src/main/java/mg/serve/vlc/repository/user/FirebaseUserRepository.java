package mg.serve.vlc.repository.user;

import mg.serve.vlc.model.user.User;

import java.util.List;
import java.util.Optional;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.auth.UserRecord.CreateRequest;

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

            System.out.println("Successfully created Firebase user: " + userRecord.getUid());
            return user;
        } catch (Exception e) {
            System.err.println("Error saving user to Firebase: " + e.getMessage());
            throw new RuntimeException("Failed to save user to Firebase", e);
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
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'findAll'");
    }
}