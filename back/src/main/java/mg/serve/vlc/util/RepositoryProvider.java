package mg.serve.vlc.util;

import mg.serve.vlc.repository.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class RepositoryProvider {
    public static ExampleRepository exampleRepository;
    public static UserRepository userRepository;
    public static UserHistoricRepository userHistoricRepository;

    @Autowired
    public RepositoryProvider(ExampleRepository exampleRepository, UserRepository userRepository, UserHistoricRepository userHistoricRepository) {
        RepositoryProvider.exampleRepository = exampleRepository;
        RepositoryProvider.userRepository = userRepository;
        RepositoryProvider.userHistoricRepository = userHistoricRepository;
    }
}
