package mg.serve.vlc.util;

import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;

import mg.serve.vlc.repository.*;
import mg.serve.vlc.repository.user.FirebaseUserRepository;
import mg.serve.vlc.repository.user.JpaUserRepository;
import mg.serve.vlc.repository.user.UserRepository;

import mg.serve.vlc.repository.example.FirebaseExampleRepository;
import mg.serve.vlc.repository.example.JpaExampleRepository;
import mg.serve.vlc.repository.example.ExampleRepository;

import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class RepositoryProvider {
    public static JpaExampleRepository jpaExampleRepository;
    public static UserHistoricRepository userHistoricRepository;
    public static RoleRepository roleRepository;
    public static UserLogRepository userLogRepository;
    public static ConfigRepository configRepository;
    public static ActionRepository actionRepository;
    public static JpaUserRepository jpaUserRepository;
    public static PointRepository pointRepository;
    public static PointHistoricRepository pointHistoricRepository;

    @Autowired
    public RepositoryProvider(
            JpaExampleRepository jpaExampleRepository, UserRepository userRepository,
            UserHistoricRepository userHistoricRepository, RoleRepository roleRepository,
            UserLogRepository userLogRepository, ConfigRepository configRepository,
            ActionRepository actionRepository,
            JpaUserRepository jpaUserRepository,
            PointRepository pointRepository,
            PointHistoricRepository pointHistoricRepository
        ) {
        RepositoryProvider.jpaExampleRepository = jpaExampleRepository;
        RepositoryProvider.userHistoricRepository = userHistoricRepository;
        RepositoryProvider.roleRepository = roleRepository;
        RepositoryProvider.userLogRepository = userLogRepository;
        RepositoryProvider.configRepository = configRepository;
        RepositoryProvider.actionRepository = actionRepository;
        RepositoryProvider.jpaUserRepository = jpaUserRepository;
        RepositoryProvider.pointRepository = pointRepository;
        RepositoryProvider.pointHistoricRepository = pointHistoricRepository;
    }

    private static final Map<Class<?>, Object> firebaseRepositories = new HashMap<>();
    private static final Map<Class<?>, Object> jpaRepositories = new HashMap<>();
    @Autowired
    public void initializeRepositories() {
        firebaseRepositories.put(UserRepository.class, new FirebaseUserRepository());
        jpaRepositories.put(UserRepository.class, jpaUserRepository);

        firebaseRepositories.put(ExampleRepository.class, new FirebaseExampleRepository());
        jpaRepositories.put(ExampleRepository.class, jpaExampleRepository);
    }

    public static <T> T getRepository(Class<T> repositoryClass) {
        if (checkFirebaseConnection()) {
            return repositoryClass.cast(firebaseRepositories.get(repositoryClass));
        } else {
            return repositoryClass.cast(jpaRepositories.get(repositoryClass));
        }
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
