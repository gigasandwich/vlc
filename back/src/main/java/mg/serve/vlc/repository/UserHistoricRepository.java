package mg.serve.vlc.repository;

import mg.serve.vlc.model.user.UserHistoric;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserHistoricRepository extends JpaRepository<UserHistoric, Integer> {
    
}
