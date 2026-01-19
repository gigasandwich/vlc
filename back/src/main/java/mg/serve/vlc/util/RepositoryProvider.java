package mg.serve.vlc.util;

import mg.serve.vlc.repository.ExampleRepository;
import mg.serve.vlc.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import lombok.Data;
import lombok.Getter;

@Component
public class RepositoryProvider {
    public static ExampleRepository exampleRepository;
    public static UserRepository userRepository;

    @Autowired
    public RepositoryProvider(ExampleRepository exampleRepository, UserRepository userRepository) {
        RepositoryProvider.exampleRepository = exampleRepository;
        RepositoryProvider.userRepository = userRepository;
    }
}
