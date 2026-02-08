package mg.serve.vlc.repository.point;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import mg.serve.vlc.model.map.PointHistoric;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.ExecutionException;

import org.springframework.stereotype.Repository;

@Repository
public class FirebasePointHistoricRepository {
    private Firestore db;
    private final CollectionReference collectionReference;

    public FirebasePointHistoricRepository() {
        db = FirestoreClient.getFirestore();
        this.collectionReference = db.collection("points");
    }

    public PointHistoric save(PointHistoric pointHistoric) {
        String pointFbId = pointHistoric.getFbId();
        try {
            DocumentReference docRef = collectionReference.document(pointFbId).collection("history").document();
            String id = docRef.getId();
            pointHistoric.setFbId(id);
            docRef.set(pointHistoric.toMap()).get();
            return pointHistoric;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to save point historic to Firestore", e);
        }
    }

    public PointHistoric save(PointHistoric pointHistoric, String pointFbId) {
        try {
            DocumentReference docRef = collectionReference.document(pointFbId).collection("history").document();
            String id = docRef.getId();
            pointHistoric.setFbId(id);
            docRef.set(pointHistoric.toMap()).get();
            return pointHistoric;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to save point historic to Firestore", e);
        }
    }

    public List<PointHistoric> findByPointFbId(String pointFbId) {
        try {
            var query = collectionReference.document(pointFbId).collection("history").get();
            var documents = query.get().getDocuments();
            List<PointHistoric> history = new ArrayList<>();
            for (var doc : documents) {
                Map<String, Object> data = doc.getData();
                if (data != null) {
                    PointHistoric historic = mapToPointHistoric(data);
                    historic.setFbId(pointFbId);
                    history.add(historic);
                }
            }
            return history;
        } catch (Exception e) {
            System.err.println("Error fetching point history from Firebase: " + e.getMessage());
            return Collections.emptyList();
        }
    }

    private PointHistoric mapToPointHistoric(Map<String, Object> data) {
        PointHistoric historic = new PointHistoric();
        if (data.get("id") != null) {
            historic.setId(((Long) data.get("id")).intValue());
        }
        if (data.get("date_") != null) {
            historic.setDate(parseTimestamp(data.get("date_")));
        }
        if (data.get("surface") != null) {
            historic.setSurface(((Number) data.get("surface")).doubleValue());
        }
        if (data.get("budget") != null) {
            historic.setBudget(((Number) data.get("budget")).doubleValue());
        }
        // Handle coordinates - assuming it's stored as GeoPoint or map
        Object coordsObj = data.get("coordinates");
        if (coordsObj instanceof com.google.cloud.firestore.GeoPoint) {
            com.google.cloud.firestore.GeoPoint geoPoint = (com.google.cloud.firestore.GeoPoint) coordsObj;
            historic.setCoordinates(geoPoint.getLongitude(), geoPoint.getLatitude());
        } else if (coordsObj instanceof Map) {
            Map<String, Object> coords = (Map<String, Object>) coordsObj;
            double longitude = ((Number) coords.get("longitude")).doubleValue();
            double latitude = ((Number) coords.get("latitude")).doubleValue();
            historic.setCoordinates(longitude, latitude);
        }
        if (data.get("pointId") != null) {
            historic.setPointId(((Long) data.get("pointId")).intValue());
        }
        // Handle pointState
        if (data.get("pointState") != null) {
            Map<String, Object> psMap = (Map<String, Object>) data.get("pointState");
            mg.serve.vlc.model.map.PointState pointState = new mg.serve.vlc.model.map.PointState();
            if (psMap.get("id") != null) {
                pointState.setId(((Long) psMap.get("id")).intValue());
            }
            pointState.setLabel((String) psMap.get("label"));
            historic.setPointState(pointState);
        }
        return historic;
    }

    // Too lazy to create a new class, God forgive me
    private LocalDateTime parseTimestamp(Object timestampObj) {
        if (timestampObj instanceof com.google.cloud.Timestamp) {
            return ((com.google.cloud.Timestamp) timestampObj).toSqlTimestamp().toLocalDateTime();
        } else if (timestampObj instanceof Map) {
            Map<String, Object> tsMap = (Map<String, Object>) timestampObj;
            long seconds = ((Number) tsMap.get("seconds")).longValue();
            int nanoseconds = ((Number) tsMap.get("nanoseconds")).intValue();
            return LocalDateTime.ofInstant(java.time.Instant.ofEpochSecond(seconds, nanoseconds), ZoneId.systemDefault());
        } else {
            throw new IllegalArgumentException("Unsupported timestamp type: " + timestampObj.getClass());
        }
    }
}