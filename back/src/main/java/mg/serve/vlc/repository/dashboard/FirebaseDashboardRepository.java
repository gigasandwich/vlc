package mg.serve.vlc.repository.dashboard;

import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;

import java.util.Map;

public class FirebaseDashboardRepository {

    /**
     * Save (upsert) a dashboard snapshot into collection "dashboard" with document id "stats".
     * If the document exists it will be updated, otherwise it will be created.
     * Returns the document id ("stats") on success.
     */
    public String save(Map<String, Object> snapshot) {
        try {
            Firestore firestore = FirestoreClient.getFirestore();
            String docId = "stats";
            DocumentReference docRef = firestore.collection("dashboard").document(docId);
            // include pushedAt timestamp for convenience
            snapshot.put("pushedAt", java.time.Instant.now().toString());

            // Try to detect existence and choose update vs set to avoid overwriting unintended fields.
            boolean exists = docRef.get().get().exists();
            if (exists) {
                // update existing document fields
                docRef.update(snapshot).get();
            } else {
                // create new document
                docRef.set(snapshot).get();
            }

            return docId;
        } catch (Exception e) {
            throw new RuntimeException("Failed to save dashboard snapshot to Firebase: " + e.getMessage(), e);
        }
    }
}
