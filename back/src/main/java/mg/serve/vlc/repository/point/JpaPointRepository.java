package mg.serve.vlc.repository.point;

import mg.serve.vlc.model.map.Point;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface JpaPointRepository extends JpaRepository<Point, Integer>, PointRepository {
    List<Point> findAll();
    List<Point> findByPointStateId(Integer pointStateId);
    Optional<Point> findById(Integer pid);
}