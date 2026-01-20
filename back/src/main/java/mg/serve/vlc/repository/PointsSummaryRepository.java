package mg.serve.vlc.repository;

import mg.serve.vlc.dto.PointsSummaryDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.Map;

@Repository
public class PointsSummaryRepository {

    private final NamedParameterJdbcTemplate jdbc;

    @Autowired
    public PointsSummaryRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public PointsSummaryDTO getSummary(Long userId) {
        String sql = "SELECT COUNT(*) AS nb, COALESCE(SUM(surface),0) AS total_surface, COALESCE(AVG(ps.progress),0) AS avg_progress, COALESCE(SUM(budget),0) AS total_budget "
                + "FROM point p JOIN point_state ps ON p.point_state_id = ps.id "
                + "WHERE (:userId IS NULL OR p.user_id = :userId)";

        Map<String, Object> params = new HashMap<>();
        params.put("userId", userId);

        return jdbc.queryForObject(sql, params, (rs, rowNum) ->
                new PointsSummaryDTO(
                        rs.getLong("nb"),
                        rs.getDouble("total_surface"),
                        rs.getDouble("avg_progress"),
                        rs.getDouble("total_budget")
                )
        );
    }
}
