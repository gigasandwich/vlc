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
    public static ExampleRepository exampleRepository;
    public static UserHistoricRepository userHistoricRepository;
    public static RoleRepository roleRepository;
    public static UserLogRepository userLogRepository;
    public static ConfigRepository configRepository;
    public static ActionRepository actionRepository;

    @Autowired
    public RepositoryProvider(
            ExampleRepository exampleRepository, UserRepository userRepository,
            UserHistoricRepository userHistoricRepository, RoleRepository roleRepository,
            UserLogRepository userLogRepository, ConfigRepository configRepository,
            ActionRepository actionRepository
        ) {
        RepositoryProvider.exampleRepository = exampleRepository;
        RepositoryProvider.userHistoricRepository = userHistoricRepository;
        RepositoryProvider.roleRepository = roleRepository;
        RepositoryProvider.userLogRepository = userLogRepository;
        RepositoryProvider.configRepository = configRepository;
        RepositoryProvider.actionRepository = actionRepository;
    }

    @Autowired
    private static JpaUserRepository jpaUserRepository;

    public static UserRepository getUserRepository() {
        if (checkFirebaseConnection()) {
            return new FirebaseUserRepository();
        } else {
            return jpaUserRepository;
        }
    }

    private static boolean checkFirebaseConnection() {
        try {
            FirebaseApp firebaseApp = FirebaseApp.getInstance();
            FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);
            firebaseAuth.listUsers(null);
            System.out.println("Firebase connection OKKKKKKK ");
            return true;
        } catch (Exception e) {
            System.out.println("Firebase connection failed: " + e.getMessage());
            return false;
        }
    }
}
