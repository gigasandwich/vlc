package mg.serve.vlc.model.map;

import jakarta.persistence.*;
import lombok.*;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import com.google.cloud.Timestamp;
import java.time.ZoneOffset;
import java.util.Date;

@Entity
@Table(name = "point_historic")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PointHistoric
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "date_", nullable = false)
    private LocalDateTime date;

    @Column(nullable = false)
    private Double surface;

    @Column(nullable = false)
    private Double budget;

    @Column(
        name = "coordinates",
        nullable = false,
        columnDefinition = "geometry(Point,4326)"
    )
    private org.locationtech.jts.geom.Point coordinates;

    @Column(name = "point_id", nullable = false)
    private Integer pointId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "point_state_id", nullable = false)
    private PointState pointState;

    @Column(length = 50, unique = true)
    private String fbId;

    public void setCoordinates(double longitude, double latitude) {
        org.locationtech.jts.geom.GeometryFactory geometryFactory = new org.locationtech.jts.geom.GeometryFactory();
        this.coordinates = geometryFactory.createPoint(new org.locationtech.jts.geom.Coordinate(longitude, latitude));
        this.coordinates.setSRID(4326); // Match PostGIS column
    }

    public Map<String, Object> toMap() {
        Map<String, Object> historicMap = new HashMap<>();
        historicMap.put("id", this.id);
        historicMap.put("date_", Timestamp.of(Date.from(this.date.toInstant(ZoneOffset.UTC))));
        historicMap.put("surface", this.surface);
        historicMap.put("budget", this.budget);
        historicMap.put("coordinates", Map.of("longitude", this.coordinates.getX(), "latitude", this.coordinates.getY()));
        historicMap.put("pointId", this.pointId); // TODO: use literal point ID or point fbId
        if (this.pointState != null) {
            historicMap.put("pointState", Map.of("id", this.pointState.getId(), "label", this.pointState.getLabel()));
        }
        return historicMap;
    }
}
