package mg.serve.vlc.model.user;

import jakarta.persistence.*;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mg.serve.vlc.exception.BusinessLogicException;
import mg.serve.vlc.repository.UserRepository;
import mg.serve.vlc.util.RepositoryProvider;
import java.time.*;

@Entity
@Table(name = "user_")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String email;

    @Column(nullable = false, length = 50)
    private String password;

    @Column(length = 50)
    private String username;

    public User(String email, String password, String username) throws BusinessLogicException {
        this.setEmail(email);
        this.setPassword(password);
        this.setUsername(username);
    }

    @Transactional(rollbackOn = Exception.class)
    public void signUp() throws BusinessLogicException {
        // Control
        UserRepository repo = RepositoryProvider.userRepository;
        
        User existingUser = repo.findByEmail(this.email);
        if (existingUser != null) {
            throw new BusinessLogicException("User with email " + this.email + " already exists");
        }

        // Business logic (Historic insertion)
        
        
        // Persistence
        User savedUser = RepositoryProvider.userRepository.save(this);
        savedUser.saveHistoric();
    }

    private void saveHistoric() throws BusinessLogicException {
        UserHistoric userHistoric = new UserHistoric(null, this.email, this.password, this.username, LocalDateTime.now(), this.id);
        RepositoryProvider.userHistoricRepository.save(userHistoric);
    }

    /****************************
     * Getters/Setters
     ****************************/
    public void setEmail(String email) throws BusinessLogicException {
    if (email == null || !email.contains("@") || !email.contains(".")) {
            throw new BusinessLogicException("Invalid email address");
        }
        this.email = email;
    }

    public void setPassword(String password) throws BusinessLogicException {
        if (password == null || password.length() < 4) {
            throw new BusinessLogicException("Password must have at least 4 characters");
        }
        this.password = password;
    }
}
