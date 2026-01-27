package mg.serve.vlc.repository.example;

import org.springframework.stereotype.Repository;
import mg.serve.vlc.model.Example;
import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface JpaExampleRepository extends JpaRepository<Example, Integer>, ExampleRepository {
    
}
