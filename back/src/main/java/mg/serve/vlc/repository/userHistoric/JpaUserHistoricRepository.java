package mg.serve.vlc.repository.userHistoric;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import mg.serve.vlc.model.user.UserHistoric;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface JpaUserHistoricRepository extends JpaRepository<UserHistoric, Integer>, UserHistoricRepository {

}