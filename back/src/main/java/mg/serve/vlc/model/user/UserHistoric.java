package mg.serve.vlc.model.user;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.*;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserHistoric {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String email;
    private String password;
    private String username;
    @Column(name = "date_")
    private LocalDateTime date;
    private Integer userStateId;

    @Column(length = 50, unique = true)
    private String fbId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("id", id);
        map.put("email", email);
        map.put("password", password);
        map.put("username", username);
        map.put("date", date != null ? Date.from(date.atZone(ZoneId.systemDefault()).toInstant()) : null);
        map.put("userId", this.user.getId());
        // map.put("userFbId", userFbId);
        map.put("userStateId", userStateId);
        return map;
    }
}   
