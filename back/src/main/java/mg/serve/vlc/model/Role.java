package mg.serve.vlc.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.*;

@Entity
@Table(name = "role")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "label", nullable = false, unique = true)
    private String label;

    @Column(length = 50, unique = true)
    private String fbId;

    public Map<String, Object> toMap() {
        Map<String, Object> roleMap = new HashMap<>();
        roleMap.put("id", this.id);
        roleMap.put("label", this.label);
        return roleMap;
    }
}
