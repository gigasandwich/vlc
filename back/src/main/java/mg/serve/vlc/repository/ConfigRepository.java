package mg.serve.vlc.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import mg.serve.vlc.model.Config;
import java.util.*;

@Repository
public interface ConfigRepository extends CrudRepository<Config, Long> {
    @Query(
        value = "SELECT value_ FROM config WHERE key = :key ORDER BY date_ DESC LIMIT 1",
        nativeQuery = true)
    String getLastValueByKey(@Param("key") String key);

    List<Config> findAll();
}
