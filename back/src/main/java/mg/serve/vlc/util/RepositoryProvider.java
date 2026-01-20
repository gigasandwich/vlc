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

    @Autowired
    public RepositoryProvider(
            ExampleRepository exampleRepository, UserRepository userRepository,
            UserHistoricRepository userHistoricRepository, RoleRepository roleRepository
        ) {
        RepositoryProvider.exampleRepository = exampleRepository;
        RepositoryProvider.userRepository = userRepository;
        RepositoryProvider.userHistoricRepository = userHistoricRepository;
        RepositoryProvider.roleRepository = roleRepository;
    }
}
