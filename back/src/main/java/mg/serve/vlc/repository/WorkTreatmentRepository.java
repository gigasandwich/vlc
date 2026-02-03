package mg.serve.vlc.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import mg.serve.vlc.model.map.Point;

@Repository
public interface WorkTreatmentRepository extends JpaRepository<Point, Integer> {

    @Query("SELECT p.id FROM Point p JOIN p.pointState ps WHERE ps.progress = 1.0")
    List<Integer> getFinishedWork();

}
