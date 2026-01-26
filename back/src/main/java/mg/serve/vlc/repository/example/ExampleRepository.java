package mg.serve.vlc.repository.example;

import mg.serve.vlc.model.Example;
import java.util.*;

public interface ExampleRepository {
    List<Example> findAll();
    Example save(Example example);
}
