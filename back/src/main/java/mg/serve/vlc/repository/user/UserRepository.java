package mg.serve.vlc.repository.user;

import mg.serve.vlc.model.user.User;
import java.util.Optional;
import java.util.*;

public interface UserRepository {

    User save(User user);

    Optional<User> findByEmail(String email);

    Optional<User> findById(Integer id);

    List<User> findAll();
}
