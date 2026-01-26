package mg.serve.vlc.repository;

import mg.serve.vlc.model.map.PointState;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PointStateRepository extends JpaRepository<PointState, Integer>
{
    PointState findByLabel(String label);
}
