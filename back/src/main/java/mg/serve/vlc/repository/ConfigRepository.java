package mg.serve.vlc.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import mg.serve.vlc.model.Config;

@Repository
public interface ConfigRepository extends CrudRepository<Config, Long> {
}
