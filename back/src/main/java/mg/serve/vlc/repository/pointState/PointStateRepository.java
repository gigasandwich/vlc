package mg.serve.vlc.repository.pointState;

import mg.serve.vlc.model.map.PointState;
import java.util.Optional;

public interface PointStateRepository {
    Optional<PointState> findById(Integer id);
    PointState save(PointState pointState);
    PointState findByLabel(String label);
}