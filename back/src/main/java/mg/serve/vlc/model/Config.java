package mg.serve.vlc.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "config")
@Data
public class Config {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "key")
    private String key;

    @Column(name = "value_")
    private String value;

    @Column(name = "type")
    private String type;

    @Column(name = "date_")
    private LocalDateTime date;

    @Column(length = 50, unique = true)
    private String fbId;
}
