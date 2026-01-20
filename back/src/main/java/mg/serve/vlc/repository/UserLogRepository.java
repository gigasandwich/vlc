package mg.serve.vlc.repository;

import mg.serve.vlc.model.UserLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface UserLogRepository extends JpaRepository<UserLog, Integer> {

    default int countWrongAttemptsSinceLastReset(Integer userId) {
        LocalDateTime lastReset = findLastResetDate(userId);
        int count = 0;
        for (UserLog log : findAll()) {
            if (
                log.getUserFrom().getId().equals(userId) 
                && log.getAction().getLabel().equals("WRONG_LOGIN") 
                && log.getDate().isAfter(lastReset)
            ) {
                count++;
            }
        }
        return count;
    }

    // Max algo with dates
    default LocalDateTime findLastResetDate(Integer userId) {
        LocalDateTime lastReset = LocalDateTime.of(1970, 1, 1, 0, 0);
        for (UserLog log : findAll()) {
            if (
                log.getUserTo() != null
                && log.getUserTo().getId().equals(userId)
                && log.getAction().getLabel().equals("LOGIN_ATTEMPT_RESET")
            ) {
                if (log.getDate().isAfter(lastReset)) {
                    lastReset = log.getDate();
                }
            }
        }
        return lastReset;
    }
}