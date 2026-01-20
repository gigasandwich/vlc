package mg.serve.vlc.model.map;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "point_state")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PointState
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String label;

    @Column(name = "order_", nullable = false)
    private Double order;
}
