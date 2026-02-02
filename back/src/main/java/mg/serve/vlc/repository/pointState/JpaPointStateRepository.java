package mg.serve.vlc.repository.pointState;

import mg.serve.vlc.model.map.PointState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaPointStateRepository extends JpaRepository<PointState, Integer>, PointStateRepository {
}
