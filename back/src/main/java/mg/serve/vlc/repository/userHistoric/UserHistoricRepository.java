package mg.serve.vlc.repository.userHistoric;

import mg.serve.vlc.model.user.UserHistoric;

public interface UserHistoricRepository {
    UserHistoric save(UserHistoric userHistoric);
}