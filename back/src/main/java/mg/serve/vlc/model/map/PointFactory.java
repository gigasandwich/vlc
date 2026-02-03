package mg.serve.vlc.model.map;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import mg.serve.vlc.util.RepositoryProvider;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "point_factory")
public class PointFactory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "factory_id", nullable = false)
    private Integer factoryId;

    @Column(name = "point_id", nullable = false)
    private Integer pointId;

    @Column(name = "date_modif")
    private LocalDateTime dateModif;

    public PointFactory() {}

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getFactoryId() {
        return factoryId;
    }

    public void setFactoryId(Integer factoryId) {
        this.factoryId = factoryId;
    }

    public Integer getPointId() {
        return pointId;
    }

    public void setPointId(Integer pointId) {
        this.pointId = pointId;
    }

    public LocalDateTime getDateModif() {
        return dateModif;
    }

    public void setDateModif(LocalDateTime dateModif) {
        this.dateModif = dateModif;
    }

    // Utility: fetch factory labels for a given point id via repository
    public static List<String> getFactoryLabelsForPoint(Integer pointId) {
        try {
            if (RepositoryProvider.pointFactoryRepository != null) {
                List<String> labels = RepositoryProvider.pointFactoryRepository.findFactoryLabelsByPointId(pointId);
                return labels != null ? labels : new ArrayList<>();
            }
        } catch (Exception e) {
            // ignore and return empty list on error
        }
        return new ArrayList<>();
    }
}
