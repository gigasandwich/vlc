package mg.serve.vlc.model;

import java.util.List;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import mg.serve.vlc.util.RepositoryProvider;

@Entity
@Table(name = "example")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Example {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String column1;

    // Never use getAll in an entity xD
    public List<Example> listAll() {
        return RepositoryProvider.exampleRepository.findAll();
    }

    public Example goodMethod() {
        // Control

        // Business logic

        // Persistence

        return RepositoryProvider.exampleRepository.save(this);
    }
}
