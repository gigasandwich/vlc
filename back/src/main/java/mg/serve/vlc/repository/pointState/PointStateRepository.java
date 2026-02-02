package mg.serve.vlc.repository.pointState;

import mg.serve.vlc.model.map.PointState;
import java.util.*;

public interface PointStateRepository {
    List<PointState> findAll();
    Optional<PointState> findById(Integer id);
    PointState save(PointState pointState);
    PointState findByLabel(String label);
}