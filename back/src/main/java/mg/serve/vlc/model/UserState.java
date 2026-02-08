package mg.serve.vlc.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.*;

@Entity
@Table(name = "user_state")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserState {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "label", nullable = false)
    private String label;

    @Column(length = 50, unique = true)
    private String fbId;

    public Map<String, Object> toMap() {
        Map<String, Object> userStateMap = new HashMap<>();
        userStateMap.put("id", this.id);
        userStateMap.put("label", this.label);
        userStateMap.put("fbId", this.fbId);
        return userStateMap;
    }
}