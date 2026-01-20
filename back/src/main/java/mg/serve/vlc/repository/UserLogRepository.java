package mg.serve.vlc.repository;

import mg.serve.vlc.model.UserLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface UserLogRepository extends JpaRepository<UserLog, Integer> {

    default int countWrongAttemptsSinceLastReset(Integer userId) {
        LocalDateTime lastReset = findLastResetDate(userId);
        return (int) findAll().stream()
            .filter(log -> log.getUserFrom().equals(userId))
            .filter(log -> log.getAction().equals("WRONG_LOGIN"))
            .filter(log -> log.getDate().isAfter(lastReset))
            .count();
    }

    default LocalDateTime findLastResetDate(Integer userId) {
        return findAll().stream()
            .filter(log -> log.getUserFrom().getId().equals(userId))
            .filter(log -> log.getAction().getLabel().equals("LOGIN_ATTEMPT_RESET"))
            .map(UserLog::getDate)
            .max(LocalDateTime::compareTo)
            .orElse(LocalDateTime.of(1970, 1, 1, 0, 0));
    }
}