package mg.serve.vlc.util;

import mg.serve.vlc.repository.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class RepositoryProvider {
    public static ExampleRepository exampleRepository;
    public static UserRepository userRepository;
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
        RepositoryProvider.userRepository = userRepository;
        RepositoryProvider.userHistoricRepository = userHistoricRepository;
        RepositoryProvider.roleRepository = roleRepository;
        RepositoryProvider.userLogRepository = userLogRepository;
        RepositoryProvider.configRepository = configRepository;
        RepositoryProvider.actionRepository = actionRepository;
    }
}
