package mg.serve.vlc.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mg.serve.vlc.model.user.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_log")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "date_", nullable = false)
    private LocalDateTime date;

    @Column(nullable = false)
    private Double state;

    @ManyToOne
    @JoinColumn(name = "user_to")
    private User userTo;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_from")
    private User userFrom;

    @ManyToOne(optional = false)
    @JoinColumn(name = "action_id")
    private Action action;
}