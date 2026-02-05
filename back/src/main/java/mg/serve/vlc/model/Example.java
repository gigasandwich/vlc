package mg.serve.vlc.model;

import java.util.List;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import mg.serve.vlc.util.RepositoryProvider;
import mg.serve.vlc.repository.example.ExampleRepository;

@Entity
@Table(name = "example")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Example {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50, unique = true)
    private String fbId;

    private String column1;

    // Never use getAll in an entity xD
    public List<Example> listAll() {
        return RepositoryProvider.getRepository(ExampleRepository.class).findAll();
    }

    public Example goodMethod() {
        // Control

        // Business logic

        // Persistence

        return RepositoryProvider.getRepository(ExampleRepository.class).save(this);
    }
}
