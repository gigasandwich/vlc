package mg.serve.vlc.model.map;

import lombok.*;
import mg.serve.vlc.model.user.User;
import mg.serve.vlc.repository.point.PointRepository;
import mg.serve.vlc.util.RepositoryProvider;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Date;

import com.google.cloud.Timestamp;

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

    @Column(length = 50, unique = true)
    private String fbId;

    @Column(
        name = "coordinates",
        nullable = false,
        columnDefinition = "geometry(Point,4326)"
    )
    private org.locationtech.jts.geom.Point coordinates;
    
    @ManyToOne(fetch = FetchType.EAGER)
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
        return RepositoryProvider.getRepository(PointRepository.class).save(this);
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

    public LocalDateTime getDeletedAt() {
        return this.deletedAt;
    }

    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }

    public Point delete() {
        this.setDeletedAt(LocalDateTime.now());
        return RepositoryProvider.getRepository(PointRepository.class).save(this);
    }

    public Map<String, Object> toMap() {
        Map<String, Object> pointMap = new HashMap<>();
        pointMap.put("id", this.id);
        pointMap.put("fbId", this.fbId);
        pointMap.put("date_", Timestamp.of(Date.from(this.date.toInstant(ZoneOffset.UTC))));
        if (this.updatedAt != null) {
            pointMap.put("updatedAt", Timestamp.of(Date.from(this.updatedAt.toInstant(ZoneOffset.UTC))));
        }
        if (this.deletedAt != null) {
            pointMap.put("deletedAt", Timestamp.of(Date.from(this.deletedAt.toInstant(ZoneOffset.UTC))));
        }
        pointMap.put("surface", this.surface);
        pointMap.put("budget", this.budget);
        pointMap.put("coordinates", Map.of("longitude", this.coordinates.getX(), "latitude", this.coordinates.getY()));
        if (this.user != null) {
            pointMap.put("user", this.user.toMap());
        }
        if (this.pointState != null) {
            pointMap.put("pointStateId", this.pointState.getId());
            pointMap.put("pointState", Map.of("id", this.pointState.getId(), "label", this.pointState.getLabel()));
        }
        if (this.pointType != null) {
            pointMap.put("pointTypeId", this.pointType.getId());
            pointMap.put("pointType", Map.of("id", this.pointType.getId(), "label", this.pointType.getLabel()));
        }
        List<Map<String, Object>> factoryList = new ArrayList<>();
        for (Factory factory : this.factories) {
            factoryList.add(Map.of("id", factory.getId(), "label", factory.getLabel()));
        }
        pointMap.put("factories", factoryList);
        return pointMap;
    }
}
