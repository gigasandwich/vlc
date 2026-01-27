package mg.serve.vlc.repository;

import mg.serve.vlc.model.map.Point;

import mg.serve.vlc.dto.PointsSummaryDTO;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PointsSummaryRepository extends JpaRepository<Point, Long> {

    @Query("""
        SELECT new mg.serve.vlc.dto.PointsSummaryDTO(
            COUNT(p),
            COALESCE(SUM(p.surface), 0),
            COALESCE(AVG(ps.progress), 0),
            COALESCE(SUM(p.budget), 0)
        )
        FROM Point p
        JOIN p.pointState ps
    """)
    PointsSummaryDTO getSummary();
}

