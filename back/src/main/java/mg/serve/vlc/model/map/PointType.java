package mg.serve.vlc.model.map;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "point_type")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PointType
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String label;

    @Column(length = 50, unique = true)
    private String fbId;
}
