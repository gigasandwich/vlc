package mg.serve.vlc.repository.point;

import mg.serve.vlc.model.map.Point;
import mg.serve.vlc.model.map.PointState;

import java.util.List;
import java.util.Optional;

public interface PointRepository {
    List<Point> findAll();
    List<Point> findByPointStateId(Integer pointStateId);
    Point save(Point point);
    Optional<Point> findById(Integer pid);
}