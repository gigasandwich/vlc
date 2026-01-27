package mg.serve.vlc.model.map;

import jakarta.persistence.*;
import lombok.*;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

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
}
