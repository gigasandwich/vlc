package mg.serve.vlc.repository;

import mg.serve.vlc.model.map.Point;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PointRepository extends JpaRepository<Point, Integer>
{
    List<Point> findByPointStateId(Integer pointStateId);
}
