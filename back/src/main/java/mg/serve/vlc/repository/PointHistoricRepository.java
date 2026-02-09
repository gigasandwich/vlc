package mg.serve.vlc.repository;

import mg.serve.vlc.model.map.PointHistoric;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PointHistoricRepository extends JpaRepository<PointHistoric, Integer>
{
    List<PointHistoric> findByPointId(Integer pointId);

    int countByPointId(Integer id);
}
