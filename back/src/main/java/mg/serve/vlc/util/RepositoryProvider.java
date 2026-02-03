package mg.serve.vlc.util;

import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;

import mg.serve.vlc.repository.*;
import mg.serve.vlc.repository.user.*;
import mg.serve.vlc.repository.userHistoric.*;
import mg.serve.vlc.repository.userHistoric.UserHistoricRepository;
import mg.serve.vlc.repository.example.*;
import mg.serve.vlc.repository.example.ExampleRepository;
import mg.serve.vlc.repository.pointState.*;
import mg.serve.vlc.repository.example.*;
import mg.serve.vlc.repository.WorkTreatmentRepository;

import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class RepositoryProvider {
    public static JpaExampleRepository jpaExampleRepository;
    public static JpaUserHistoricRepository jpaUserHistoricRepository;
    public static RoleRepository roleRepository;
    public static UserLogRepository userLogRepository;
    public static ConfigRepository configRepository;
    public static ActionRepository actionRepository;
    public static JpaUserRepository jpaUserRepository;
    public static PointRepository pointRepository;
    public static PointHistoricRepository pointHistoricRepository;
    public static PointsSummaryRepository pointsSummaryRepository;
    public static PointStateRepository pointStateRepository;
    public static PointTypeRepository pointTypeRepository;
    public static FactoryRepository factoryRepository;
    public static PointInProgressRepository pointInProgressRepository;
    public static WorkTreatmentRepository workTreatmentRepository;

    @Autowired
    public RepositoryProvider(
            JpaExampleRepository jpaExampleRepository, UserRepository userRepository,
            JpaUserHistoricRepository jpaUserHistoricRepository, RoleRepository roleRepository,
            UserLogRepository userLogRepository, ConfigRepository configRepository,
            ActionRepository actionRepository,
            JpaUserRepository jpaUserRepository,
            PointRepository pointRepository,
            PointHistoricRepository pointHistoricRepository,
            PointsSummaryRepository pointsSummaryRepository,
            PointStateRepository pointStateRepository,
            PointTypeRepository pointTypeRepository,
            FactoryRepository factoryRepository,
            PointInProgressRepository pointInProgressRepository
            ,
            WorkTreatmentRepository workTreatmentRepository
        ) {
        RepositoryProvider.jpaExampleRepository = jpaExampleRepository;
        RepositoryProvider.jpaUserHistoricRepository = jpaUserHistoricRepository;
        RepositoryProvider.roleRepository = roleRepository;
        RepositoryProvider.userLogRepository = userLogRepository;
        RepositoryProvider.configRepository = configRepository;
        RepositoryProvider.actionRepository = actionRepository;
        RepositoryProvider.jpaUserRepository = jpaUserRepository;
        RepositoryProvider.pointRepository = pointRepository;
        RepositoryProvider.pointHistoricRepository = pointHistoricRepository;
        RepositoryProvider.pointsSummaryRepository = pointsSummaryRepository;
        RepositoryProvider.pointStateRepository = pointStateRepository;
        RepositoryProvider.pointTypeRepository = pointTypeRepository;
        RepositoryProvider.factoryRepository = factoryRepository;
        RepositoryProvider.pointInProgressRepository=pointInProgressRepository;
        RepositoryProvider.workTreatmentRepository = workTreatmentRepository;
    }

    private static final Map<Class<?>, Object> firebaseRepositories = new HashMap<>();
    private static final Map<Class<?>, Object> jpaRepositories = new HashMap<>();
    @Autowired
    public void initializeRepositories() {
        firebaseRepositories.put(UserRepository.class, new FirebaseUserRepository());
        jpaRepositories.put(UserRepository.class, jpaUserRepository);

        firebaseRepositories.put(ExampleRepository.class, new FirebaseExampleRepository());
        jpaRepositories.put(ExampleRepository.class, jpaExampleRepository);

        firebaseRepositories.put(UserHistoricRepository.class, new FirebaseUserHistoricRepository());
        jpaRepositories.put(UserHistoricRepository.class, jpaUserHistoricRepository);

        firebaseRepositories.put(PointStateRepository.class, new FirebasePointStateRepository());
        jpaRepositories.put(PointStateRepository.class, pointStateRepository);

        jpaRepositories.put(PointTypeRepository.class, RepositoryProvider.pointTypeRepository);
        jpaRepositories.put(FactoryRepository.class, RepositoryProvider.factoryRepository);
        jpaRepositories.put(WorkTreatmentRepository.class, RepositoryProvider.workTreatmentRepository);
    }

    public static <T> T getRepository(Class<T> repositoryClass) {
        // if (checkFirebaseConnection()) {
        //     return repositoryClass.cast(firebaseRepositories.get(repositoryClass));
        // } else {
        //     return repositoryClass.cast(jpaRepositories.get(repositoryClass));
        // }

        // For now, always use local repository for testing
        return repositoryClass.cast(jpaRepositories.get(repositoryClass));
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
