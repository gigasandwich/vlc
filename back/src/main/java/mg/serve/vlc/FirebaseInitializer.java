package mg.serve.vlc;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

import jakarta.annotation.PostConstruct;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.InputStream;
import java.util.logging.Logger;

@Configuration
public class FirebaseInitializer {

    @PostConstruct
    public static void init() {
        Logger logger = Logger.getLogger(FirebaseInitializer.class.getName());
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                InputStream serviceAccount = new ClassPathResource("serve-vlc-firebase-adminsdk-fbsvc.json").getInputStream();

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();

                FirebaseApp.initializeApp(options);
                logger.info("Firebase initialized successfully");
            } else {
                logger.info("FirebaseApp already initialized");
            }
        } catch (Exception e) {
            logger.severe("Failed to initialize Firebase: " + e.getMessage());
            e.printStackTrace();
        }
    }
}