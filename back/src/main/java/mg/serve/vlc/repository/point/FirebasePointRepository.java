package mg.serve.vlc.repository.point;

import mg.serve.vlc.model.map.Point;
import com.google.firebase.cloud.FirestoreClient;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.GeoPoint;
import com.google.cloud.Timestamp;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

public class FirebasePointRepository implements PointRepository {

    @Override
    public List<Point> findAll() {
        try {
            Firestore firestore = FirestoreClient.getFirestore();
            Iterable<com.google.cloud.firestore.DocumentReference> docs = firestore.collection("points").listDocuments();
            List<Point> points = new ArrayList<>();

            for (com.google.cloud.firestore.DocumentReference doc : docs) {
                Map<String, Object> data = doc.get().get().getData();
                if (data != null) {
                    Point point = mapToPoint(data);
                    point.setFbId(doc.getId());
                    points.add(point);
                }
            }

            return points;
        } catch (Exception e) {
            System.err.println("Error fetching all points from Firebase: " + e.getMessage());
            throw new RuntimeException("Failed to fetch all points from Firebase", e);
        }
    }

    @Override
    public List<Point> findByPointStateId(Integer pointStateId) {
        // For simplicity, fetch all and filter
        return findAll().stream()
                .filter(p -> p.getPointState() != null && p.getPointState().getId().equals(pointStateId))
                .toList();
    }

    @Override
    public Point save(Point point) {
        try {
            Firestore firestore = FirestoreClient.getFirestore();
            String fbId = point.getFbId();
            if (fbId == null) {
                fbId = firestore.collection("points").document().getId();
                point.setFbId(fbId);
            }
            firestore.collection("points").document(fbId).set(point.toMap()).get();
            return point;
        } catch (Exception e) {
            System.err.println("Error saving point to Firebase: " + e.getMessage());
            throw new RuntimeException("Failed to save point to Firebase", e);
        }
    }

    public Optional<Point> findById(Integer pid) {
        throw new UnsupportedOperationException("findById is not supported in FirebasePointRepository");
    }

    private Point mapToPoint(Map<String, Object> data) {
        Point point = new Point();
        if (data.get("id") != null) {
            point.setId(((Long) data.get("id")).intValue());
        }
        if (data.get("date") != null) {
            Timestamp ts = (Timestamp) data.get("date");
            point.setDate(ts.toDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());
        }
        if (data.get("updatedAt") != null) {
            Timestamp ts = (Timestamp) data.get("updatedAt");
            point.setUpdatedAt(ts.toDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());
        }
        if (data.get("deletedAt") != null) {
            Timestamp ts = (Timestamp) data.get("deletedAt");
            point.setDeletedAt(ts.toDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());
        }
        if (data.get("surface") != null) {
            point.setSurface(((Number) data.get("surface")).doubleValue());
        }
        if (data.get("budget") != null) {
            point.setBudget(((Number) data.get("budget")).doubleValue());
        }
        
        // Handle Coordinates
        Object coordsObj = data.get("coordinates");
        if (coordsObj instanceof GeoPoint) {
            GeoPoint geoPoint = (GeoPoint) coordsObj;
            double longitude = geoPoint.getLongitude();
            double latitude = geoPoint.getLatitude();
            point.setCoordinates(longitude, latitude);
        } else if (coordsObj instanceof Map) {
            Map<String, Object> coords = (Map<String, Object>) coordsObj;
            double longitude = ((Number) coords.get("longitude")).doubleValue();
            double latitude = ((Number) coords.get("latitude")).doubleValue();
            point.setCoordinates(longitude, latitude);
        }

        return point;
    }
}