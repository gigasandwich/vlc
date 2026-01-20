package mg.serve.vlc.repository;

import mg.serve.vlc.model.Action;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ActionRepository extends JpaRepository<Action, Integer> {

   Optional<Action> findByLabel(String label);

}
