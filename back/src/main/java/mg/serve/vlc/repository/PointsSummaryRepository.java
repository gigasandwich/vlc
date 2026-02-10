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
            /* Sum of surfaces coming from point_historic rows whose state label is 'nouveau' */
            (SELECT COALESCE(SUM(ph.surface), 0) FROM PointHistoric ph WHERE ph.pointState.label = 'nouveau'),
            COALESCE(AVG(ps.progress), 0),
            COALESCE(SUM(p.budget))
        )
        FROM Point p
        JOIN p.pointState ps
    """)
    PointsSummaryDTO getSummary();
}

