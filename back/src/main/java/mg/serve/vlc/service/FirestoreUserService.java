package mg.serve.vlc.service;

import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
public class FirestoreUserService {
    private final Firestore db;
    private final CollectionReference usersCollection;

    public FirestoreUserService() {
        db = FirestoreClient.getFirestore();
        usersCollection = db.collection("users");
    }

    
    public List<Map<String, Object>> getBlockedUsers() {
        try {
            QuerySnapshot snapshot = usersCollection
                    .whereGreaterThanOrEqualTo("attempt", 3L)
                    .get()
                    .get();

            List<Map<String, Object>> blockedUsers = new ArrayList<>();
            for (DocumentSnapshot doc : snapshot.getDocuments()) {
                Map<String, Object> user = new HashMap<>();
                user.put("fbId", doc.getId());
                user.put("email", doc.get("email"));
                user.put("attempt", doc.get("attempt"));
                user.put("disabled", doc.get("disabled"));
                blockedUsers.add(user);
            }
            return blockedUsers;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to fetch blocked users from Firestore", e);
        }
    }

    public void deblockUser(String fbId) {
        try {
            Map<String, Object> updates = new HashMap<>();
            updates.put("attempt", 0L);
            updates.put("disabled", false);
            usersCollection.document(fbId).update(updates).get();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to deblock user in Firestore", e);
        }
    }

    public Map<String, Object> getUserByFbId(String fbId) {
        try {
            DocumentSnapshot doc = usersCollection.document(fbId).get().get();
            if (doc.exists()) {
                Map<String, Object> user = new HashMap<>(doc.getData());
                user.put("fbId", doc.getId());
                return user;
            }
            return null;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to fetch user from Firestore", e);
        }
    }
}
