package mg.serve.vlc.repository;

import mg.serve.vlc.model.Role;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends CrudRepository<Role, Long> {
    Role findByLabel(String label);
}
