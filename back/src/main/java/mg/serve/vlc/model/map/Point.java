package mg.serve.vlc.model.map;

import lombok.*;
import mg.serve.vlc.model.user.User;
import mg.serve.vlc.util.RepositoryProvider;


import jakarta.persistence.*;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;

@Entity
@Table(name = "point")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Point {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "date_", nullable = false)
    private LocalDateTime date;

    @Column(nullable = false)
    private Double surface;

    @Column(nullable = false)
    private Double budget;

    // PostGIS geometry column
    @Column(name = "coordinates", columnDefinition = "geometry(Point,4326)", nullable = false)
    private org.locationtech.jts.geom.Point coordinates;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "point_state_id", nullable = false)
    private PointState pointState;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "point_type_id", nullable = false)
    private PointType pointType;

    @Transactional(rollbackOn = Exception.class)
    public Point save() {
        return RepositoryProvider.pointRepository.save(this);
    }

    @Transactional(rollbackOn = Exception.class)
    public void saveHistoric() {
        PointHistoric historic = new PointHistoric();
        historic.setDate(LocalDateTime.now());
        historic.setSurface(this.surface);
        historic.setBudget(this.budget);
        historic.setCoordinates(this.coordinates);
        Integer pointId = this.id;
        historic.setPointId(pointId);
        historic.setPointState( this.pointState );
        RepositoryProvider.pointHistoricRepository.save(historic);
    }
}
