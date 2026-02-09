package mg.serve.vlc.repository.point;

import mg.serve.vlc.model.map.Point;
import mg.serve.vlc.model.map.PointState;
import mg.serve.vlc.model.map.PointType;
import mg.serve.vlc.exception.BusinessLogicException;
import mg.serve.vlc.model.map.Factory;
import mg.serve.vlc.model.user.User;
import com.google.firebase.cloud.FirestoreClient;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.GeoPoint;
import com.google.cloud.Timestamp;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
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
        return findAll().stream()
                .filter(p -> p.getPointState() != null && p.getPointState().getId().equals(pointStateId))
                .toList();
    }

    @Override
    public Point save(Point point) {
        try {
            Firestore firestore = FirestoreClient.getFirestore();
            String fbId = point.getFbId();
            boolean isNew = fbId == null;
            if (isNew) {
                fbId = firestore.collection("points").document().getId();
                point.setFbId(fbId);
            }
            if (isNew) {
                firestore.collection("points").document(fbId).set(point.toMap()).get();
            } else {
                firestore.collection("points").document(fbId).update(point.toMap()).get();
            }
            return point;
        } catch (Exception e) {
            System.err.println("Error saving point to Firebase: " + e.getMessage());
            throw new RuntimeException("Failed to save point to Firebase", e);
        }
    }

    public Optional<Point> findById(Integer pid) {
        throw new UnsupportedOperationException("findById is not supported in FirebasePointRepository");
    }

    private Point mapToPoint(Map<String, Object> data) throws BusinessLogicException {
        Point point = new Point();
        if (data.get("id") != null) {
            point.setId(((Long) data.get("id")).intValue());
        }
        if (data.get("date_") != null) {
            point.setDate(parseTimestamp(data.get("date_")));
        }
        if (data.get("updatedAt") != null) {
            point.setUpdatedAt(parseTimestamp(data.get("updatedAt")));
        }
        if (data.get("deletedAt") != null) {
            point.setDeletedAt(parseTimestamp(data.get("deletedAt")));
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

        // Handle user
        if (data.get("user") != null) {
            Map<String, Object> userMap = (Map<String, Object>) data.get("user");
            User user = new User();
            if (userMap.get("id") != null) {
                user.setId(((Long) userMap.get("id")).intValue());
            }
            user.setEmail((String) userMap.get("email"));
            user.setUsername((String) userMap.get("username"));
            user.setFbId((String) userMap.get("fbId"));
            if (userMap.get("userStateId") != null) {
                user.setUserStateId(((Long) userMap.get("userStateId")).intValue());
            }
            point.setUser(user);
        }

        // Handle pointState
        if (data.get("pointState") != null) {
            Map<String, Object> psMap = (Map<String, Object>) data.get("pointState");
            PointState pointState = new PointState();
            if (psMap.get("id") != null) {
                pointState.setId(((Long) psMap.get("id")).intValue());
            }
            pointState.setLabel((String) psMap.get("label"));
            point.setPointState(pointState);
        }

        // Handle pointType
        if (data.get("pointType") != null) {
            Map<String, Object> ptMap = (Map<String, Object>) data.get("pointType");
            PointType pointType = new PointType();
            if (ptMap.get("id") != null) {
                pointType.setId(((Long) ptMap.get("id")).intValue());
            }
            pointType.setLabel((String) ptMap.get("label"));
            point.setPointType(pointType);
        }

        // Handle factories
        if (data.get("factories") != null) {
            List<Map<String, Object>> factoriesList = (List<Map<String, Object>>) data.get("factories");
            List<Factory> factories = new ArrayList<>();
            for (Map<String, Object> fMap : factoriesList) {
                Factory factory = new Factory();
                if (fMap.get("id") != null) {
                    factory.setId(((Long) fMap.get("id")).intValue());
                }
                factory.setLabel((String) fMap.get("label"));
                factories.add(factory);
            }
            point.setFactories(factories);
        }

        return point;
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