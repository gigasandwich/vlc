package mg.serve.vlc.repository;

import mg.serve.vlc.model.Action;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ActionRepository extends JpaRepository<Action, Integer> {

    Action findByLabel(String label);

}
