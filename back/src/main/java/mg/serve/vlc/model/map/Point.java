package mg.serve.vlc.model.map;

import lombok.*;
import mg.serve.vlc.model.user.User;
import mg.serve.vlc.util.RepositoryProvider;
import mg.serve.vlc.model.map.Factory;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;

import java.util.*;

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

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

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
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "point_state_id", nullable = false)
    private PointState pointState;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "point_type_id", nullable = false)
    private PointType pointType;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "point_factory",
        joinColumns = @JoinColumn(name = "point_id"),
        inverseJoinColumns = @JoinColumn(name = "factory_id")
    )
    @JsonIgnore
    private List<Factory> factories = new ArrayList<>();

    @Transactional(rollbackOn = Exception.class)
    public Point save() {
        return RepositoryProvider.pointRepository.save(this);
    }

    public void setCoordinates(double longitude, double latitude) {
        GeometryFactory geometryFactory = new GeometryFactory();
        this.coordinates = geometryFactory.createPoint(new Coordinate(longitude, latitude));
        this.coordinates.setSRID(4326); // Set SRID to match PostGIS column
    }

    @Transactional(rollbackOn = Exception.class)
    public void saveHistoric() {
        PointHistoric historic = new PointHistoric();
        historic.setDate(this.getUpdatedAt() != null ? this.getUpdatedAt() : LocalDateTime.now()); // IDk if this is okay, plz feedback
        historic.setSurface(this.surface);
        historic.setBudget(this.budget);
        historic.setCoordinates(this.coordinates);
        Integer pointId = this.id;
        historic.setPointId(pointId);
        historic.setPointState( this.pointState );
        RepositoryProvider.pointHistoricRepository.save(historic); // TODO: add factories history too
    }

    /**
     * Convenience setter to update the factories for this point
     * It records a new PointFactory row per factory with the same timestamp
     * so the newest timestamp identifies the current set of factories
     */
    @Transactional(rollbackOn = Exception.class)
    public void setFactories(List<Factory> factories) {
        this.factories.clear();
        if (factories == null) return;
        this.factories.addAll(factories);
    }

    public List<Factory> getFactories() {
        return this.factories;
    }

    public LocalDateTime getUpdatedAt() {
        if (this.updatedAt == null) {
            return this.date;
        }
        return this.updatedAt;
    }
}
