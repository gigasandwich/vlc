package mg.serve.vlc.repository;

import mg.serve.vlc.model.map.Point;

import mg.serve.vlc.dto.PointInProgressDTO;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PointInProgressRepository extends JpaRepository<Point, Long> {

    @Query("""
        SELECT new mg.serve.vlc.dto.PointInProgressDTO(
            p.date,
            p.surface,
            p.budget,
            ps.label,
            ps.progress,
            pt.label
        )
        FROM Point p
        JOIN p.pointState ps
        JOIN p.pointType pt
        WHERE ps.label='en cours'
    """)
    List<PointInProgressDTO> getPointInProgress();
}

