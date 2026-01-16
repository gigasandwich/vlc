package mg.serve.vlc.util;

import mg.serve.vlc.repository.ExampleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class RepositoryProvider {
    private static ExampleRepository exampleRepository;

    @Autowired
    public RepositoryProvider(ExampleRepository repo) {
        RepositoryProvider.exampleRepository = repo;
    }

    public static ExampleRepository getExampleRepository() {
        return exampleRepository;
    }
}
