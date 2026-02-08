package mg.serve.vlc.model.user;

import jakarta.persistence.*;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mg.serve.vlc.exception.BusinessLogicException;
import mg.serve.vlc.util.RepositoryProvider;
import java.time.*;
import java.util.*;
import mg.serve.vlc.model.*;
import mg.serve.vlc.repository.user.UserRepository;
import mg.serve.vlc.repository.user.FirebaseUserRepository;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord;
import mg.serve.vlc.repository.userHistoric.UserHistoricRepository;
import com.google.cloud.Timestamp;

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

    @Column(length = 50, unique = true)
    private String fbId;

    @Column(nullable = false, unique = true, length = 50)
    private String email;

    @Column(nullable = false, length = 50)
    private String password;

    @Column(length = 50)
    private String username;

    @Column(name = "user_state_id")
    private Integer userStateId;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

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

    public User(String email, String password, String username, Integer userStateId) throws BusinessLogicException {
        this.setEmail(email);
        this.setPassword(password);
        this.setUsername(username);
        this.userStateId = userStateId;
    }

    
    @Transactional(rollbackOn = Exception.class)
    public Map<String, String> signIn(String password) throws BusinessLogicException {
        UserRepository repo = RepositoryProvider.getRepository(UserRepository.class);

        if (repo instanceof FirebaseUserRepository) {
            try {
                UserRecord userRecord = FirebaseAuth.getInstance().getUserByEmail(this.email);
                String customToken = FirebaseAuth.getInstance().createCustomToken(userRecord.getUid());

                Map<String, String> result = new HashMap<>();
                result.put("provider", "firebase");
                result.put("token", customToken);
                return result;
            } catch (Exception e) {
                throw new BusinessLogicException("Firebase sign-in failed: " + e.getMessage());
            }
        } else {
            Optional<User> foundOpt = repo.findByEmail(this.email);
            if (foundOpt.isEmpty()) {
                throw new BusinessLogicException("Invalid email or password");
            }

            User found = foundOpt.get();

            if (found.getUserStateId() != null && found.getUserStateId() == 3) {
                throw new BusinessLogicException("User account is blocked due to multiple wrong login attempts");
            }

            if (!found.getPassword().equals(password)) {
                found.logWrongAttempt();
                throw new BusinessLogicException("Invalid email or password");
            }

            Map<String, String> result = new HashMap<>();
            result.put("provider", "local");
            result.put("email", found.getEmail());
            return result;
        }
    }

    // TODO: fix Transactions, not working???
    // Sign in is not handled by this Model class (only in SignInController)
    @Transactional(rollbackOn = Exception.class)
    public void signUp(String role) throws BusinessLogicException {
        // Control
        UserRepository repo = RepositoryProvider.getRepository(UserRepository.class);
        User existingUser = repo.findByEmail(this.email).orElse(null);
        if (existingUser != null) {
            throw new BusinessLogicException("User with email " + this.email + " already exists");
        }

        // Business logic (Role + State)
        if (role.equals("ADMIN"))
            this.roles.add(new Role(2, "ADMIN", null)); // Too lazy to create RoleRepository
        else if (role.equals("USER"))
            this.roles.add(new Role(1, "USER", null));
        else
            throw new BusinessLogicException("Invalid role: " + role); 

        this.userStateId = 1;

        // Persistence
        User savedUser = repo.save(this);
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
        User updated = RepositoryProvider.getRepository(UserRepository.class).save(this);
        updated.saveHistoric();
    }

    @Transactional(rollbackOn = Exception.class)
    public void saveHistoric() throws BusinessLogicException {
        UserHistoric userHistoric = new UserHistoric(null, this.email, this.password, this.username, LocalDateTime.now(), this.userStateId, this.fbId, this);
        RepositoryProvider.getRepository(UserHistoricRepository.class).save(userHistoric);
        // System.out.println("Historic saved for user id " + this.fbId);
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
        User deleted = RepositoryProvider.getRepository(UserRepository.class).save(this);
        deleted.saveHistoric();
    }

    @Transactional(rollbackOn = Exception.class)
    public void logWrongAttempt() throws BusinessLogicException {
        // Control
        Optional<Action> wrongLoginAction = RepositoryProvider.actionRepository.findByLabel("WRONG_LOGIN");
        if (wrongLoginAction.get() == null) {
            throw new BusinessLogicException("Action 'WRONG_LOGIN' not found in the database");
        }

        // Business logic
        UserLog userLog = new UserLog(null, LocalDateTime.now(), 0.0, null, this, wrongLoginAction.get(), null);
        
        // Persistence
        RepositoryProvider.userLogRepository.save(userLog);


        /****************************
         * Blocking
         ****************************/

        String limitStr = RepositoryProvider.configRepository.getLastValueByKey("LOGIN_ATTEMPT_LIMIT");
        int loginAttemptLimit = Integer.parseInt(limitStr);
        int wrongAttempts = RepositoryProvider.userLogRepository.countWrongAttemptsSinceLastReset(this.id);
        System.out.println("Wrong attempts for user id " + this.id + ": " + wrongAttempts);
        if (wrongAttempts >= loginAttemptLimit) {
            this.setUserStateId(3); // Blocked
            User updated = RepositoryProvider.getRepository(UserRepository.class).save(this);
            updated.saveHistoric();
        }
    }

    /****************************
     * Getters/Setters
     ****************************/

    @PrePersist
    @PreUpdate
    public void setUpdatedAt() {
        this.updatedAt = LocalDateTime.now();
    }

    public void setEmail(String email) throws BusinessLogicException {
    if (email == null || !email.contains("@") || !email.contains(".")) {
            throw new BusinessLogicException("Invalid email address");
        }
        this.email = email;
    }

    public void setPassword(String password) throws BusinessLogicException {
        if (password == null || password.length() < 6) {
            throw new BusinessLogicException("Password must have at least 6 characters");
        }
        this.password = password;
    }


    public Map<String, Object> toMap() {
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", this.id);
        userMap.put("email", this.email);
        userMap.put("username", this.username);
        userMap.put("userStateId", this.userStateId);
        userMap.put("fbId", this.fbId);
        userMap.put("updatedAt", this.updatedAt != null ? Timestamp.of(Date.from(this.updatedAt.toInstant(ZoneOffset.UTC))) : null);

        List<Map<String, Object>> rolesList = new ArrayList<>();
        for (Role role : this.roles) {
            rolesList.add(role.toMap());
        }
        userMap.put("roles", rolesList);

        return userMap;
    }

    /****************************
     * Util
     ****************************/
    
    public boolean isAdmin() {
        return this.getRoles().stream().anyMatch(role -> role.getLabel().equals("ADMIN"));
    }
}
