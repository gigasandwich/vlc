package mg.serve.vlc.repository.userHistoric;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.cloud.FirestoreClient;
import mg.serve.vlc.model.user.UserHistoric;

import java.util.*;
import java.util.concurrent.ExecutionException;
import com.google.cloud.Timestamp;

import org.springframework.stereotype.Repository;

@Repository
public class FirebaseUserHistoricRepository implements UserHistoricRepository {
    private Firestore db;
    private final CollectionReference collectionReference;

    public FirebaseUserHistoricRepository() {
        db = FirestoreClient.getFirestore();
        this.collectionReference = db.collection("users");
    }

    @Override
    public UserHistoric save(UserHistoric userHistoric) {
        String userFbId = userHistoric.getUser().getFbId();
        try {
            DocumentReference docRef = collectionReference.document(userFbId).collection("history").document();
            String id = docRef.getId();
            userHistoric.setFbId(id);
            docRef.set(userHistoric.toMap()).get();
            return userHistoric;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to save user historic to Firestore", e);
        }
    }

    public UserHistoric save(UserHistoric userHistoric, String userFbId) {
        try {
            DocumentReference docRef = collectionReference.document(userFbId).collection("history").document();
            String id = docRef.getId();
            userHistoric.setFbId(id);
            docRef.set(userHistoric.toMap()).get();
            return userHistoric;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to save user historic to Firestore", e);
        }
    }

    public List<UserHistoric> findByUserFbId(String userFbId) {
        try {
            var query = collectionReference.document(userFbId).collection("history").get();
            var documents = query.get().getDocuments();
            List<UserHistoric> history = new ArrayList<>();
            for (var doc : documents) {
                Map<String, Object> data = doc.getData();
                if (data != null) {
                    UserHistoric historic = new UserHistoric();
                    if (data.get("id") != null) {
                        historic.setId(((Long) data.get("id")).intValue());
                    }
                    historic.setEmail((String) data.get("email"));
                    historic.setPassword((String) data.get("password"));
                    historic.setUsername((String) data.get("username"));
                    if (data.get("date") != null) {
                        historic.setDate(((com.google.cloud.Timestamp) data.get("date")).toSqlTimestamp().toLocalDateTime());
                    }
                    if (data.get("userStateId") != null) {
                        historic.setUserStateId(((Long) data.get("userStateId")).intValue());
                    }
                    historic.setFbId((String) data.get("fbId"));
                    // Note: user is not set here, as it's not needed for sync
                    history.add(historic);
                }
            }
            return history;
        } catch (Exception e) {
            System.err.println("Error fetching user history from Firebase: " + e.getMessage());
            return Collections.emptyList();
        }
    }
}