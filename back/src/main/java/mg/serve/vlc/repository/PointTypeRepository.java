package mg.serve.vlc.repository;

import mg.serve.vlc.model.map.PointType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PointTypeRepository extends JpaRepository<PointType, Integer>
{
    PointType findByLabel(String label);
}
