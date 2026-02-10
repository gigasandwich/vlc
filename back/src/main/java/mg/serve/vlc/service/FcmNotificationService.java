package mg.serve.vlc.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.firebase.cloud.FirestoreClient;
import com.google.firebase.messaging.BatchResponse;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.MulticastMessage;
import com.google.firebase.messaging.Notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FcmNotificationService {
    private static final Logger logger = LoggerFactory.getLogger(FcmNotificationService.class);

    public void notifyUserStatusChange(String userFbId, Integer pointId, String newStateLabel) {
        if (userFbId == null || userFbId.isBlank()) return;

        String title = "Mise a jour du point";
        String body = "Votre point #" + pointId + " est maintenant: " + (newStateLabel != null ? newStateLabel : "mis a jour");
        Map<String, String> data = new HashMap<>();
        data.put("pointId", pointId != null ? String.valueOf(pointId) : "");
        data.put("stateLabel", newStateLabel != null ? newStateLabel : "");

        sendToUser(userFbId, title, body, data);
    }

    public void sendToUser(String userFbId, String title, String body, Map<String, String> data) {
        try {
            List<String> tokens = getUserTokensByFbId(userFbId);
            if (tokens.isEmpty()) return;

            MulticastMessage msg = MulticastMessage.builder()
                .addAllTokens(tokens)
                .setNotification(Notification.builder().setTitle(title).setBody(body).build())
                .putAllData(data != null ? data : Collections.emptyMap())
                .build();

            BatchResponse resp = FirebaseMessaging.getInstance().sendMulticast(msg);
            if (resp.getFailureCount() > 0) {
                logger.warn("FCM send had {} failures", resp.getFailureCount());
            }
        } catch (Exception e) {
            logger.warn("Failed to send FCM notification", e);
        }
    }

    private List<String> getUserTokensByFbId(String userFbId) throws Exception {
        Firestore db = FirestoreClient.getFirestore();

        ApiFuture<QuerySnapshot> userFuture = db.collection("users")
            .whereEqualTo("fbId", userFbId)
            .limit(1)
            .get();

        QuerySnapshot userSnap = userFuture.get();
        if (userSnap.isEmpty()) return List.of();

        String userDocId = userSnap.getDocuments().get(0).getId();
        ApiFuture<QuerySnapshot> tokensFuture = db.collection("users")
            .document(userDocId)
            .collection("fcmTokens")
            .get();

        QuerySnapshot tokensSnap = tokensFuture.get();
        return tokensSnap.getDocuments().stream()
            .map(DocumentSnapshot::getId)
            .filter(t -> t != null && !t.isBlank())
            .collect(Collectors.toList());
    }
}
