package mg.serve.vlc.util;

import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import mg.serve.vlc.repository.*;
import mg.serve.vlc.repository.user.FirebaseUserRepository;
import mg.serve.vlc.repository.user.JpaUserRepository;
import mg.serve.vlc.repository.user.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class RepositoryProvider {
    @Autowired
    public static ExampleRepository exampleRepository;
    @Autowired
    public static UserHistoricRepository userHistoricRepository;
    @Autowired
    public static RoleRepository roleRepository;
    @Autowired
    public static UserLogRepository userLogRepository;
    @Autowired
    public static ConfigRepository configRepository;
    @Autowired
    public static ActionRepository actionRepository;
    @Autowired
    private static JpaUserRepository jpaUserRepository;
    @Autowired
    public static PointRepository pointRepository;
    @Autowired
    public static PointHistoricRepository pointHistoricRepository;

    public static UserRepository getUserRepository() {
        return jpaUserRepository;

        // Local test for now
        // if (checkFirebaseConnection()) {
        //     return new FirebaseUserRepository();
        // } else {
        //     return jpaUserRepository;
        // }
    }

    private static boolean checkFirebaseConnection() {
        try {
            FirebaseApp firebaseApp = FirebaseApp.getInstance();
            FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);
            firebaseAuth.listUsers(null);
            System.out.println("Firebase connection OKKKKKKK");
            return true;
        } catch (Exception e) {
            System.out.println("Firebase connection failed: " + e.getMessage());
            return false;
        }
    }
}
