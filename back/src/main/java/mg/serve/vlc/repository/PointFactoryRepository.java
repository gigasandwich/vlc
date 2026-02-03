package mg.serve.vlc.repository;

import mg.serve.vlc.model.map.PointFactory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PointFactoryRepository extends JpaRepository<PointFactory, Integer> {

    List<PointFactory> findByPointId(Integer pointId);

    @Query(value = "SELECT f.label FROM factory f JOIN point_factory pf ON f.id = pf.factory_id WHERE pf.point_id = :pointId", nativeQuery = true)
    List<String> findFactoryLabelsByPointId(@Param("pointId") Integer pointId);
}
