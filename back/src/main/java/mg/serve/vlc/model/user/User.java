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
import java.util.HashSet;
import java.util.Set;
import mg.serve.vlc.model.*;

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

    @Column(name = "user_state_id")
    private Integer userStateId;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_role",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<mg.serve.vlc.model.Role> roles = new HashSet<>();

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

        // Business logic (Role)
        Role userRole = RepositoryProvider.roleRepository.findByLabel("USER");
        this.roles.add(userRole);

        // Persistence
        User savedUser = RepositoryProvider.userRepository.save(this);
        savedUser.saveHistoric();
    }

    @Transactional(rollbackOn = Exception.class)
    public void update(String email, String password, String username) throws BusinessLogicException {
        // Control
        if (!this.email.equals(email)) {
            throw new BusinessLogicException("Email cannot be changed");
        }

        // Business logic
        this.setPassword(password);
        this.setUsername(username);

        // Persistence
        User updated = RepositoryProvider.userRepository.save(this);
        updated.saveHistoric();
    }

    private void saveHistoric() throws BusinessLogicException {
        UserHistoric userHistoric = new UserHistoric(null, this.email, this.password, this.username, LocalDateTime.now(), this.id, this.userStateId);
        RepositoryProvider.userHistoricRepository.save(userHistoric);
        System.out.println("Historic saved for user id " + this.id);
    }

    @Transactional(rollbackOn = Exception.class)
    public void delete() throws BusinessLogicException {
        // Control
        if (this.userStateId == 2) {
            throw new BusinessLogicException("User is already deleted");
        }

        // Business logic
        this.setUserStateId(2);

        // Persistence
        User deleted = RepositoryProvider.userRepository.save(this);
        deleted.saveHistoric();
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
