package mg.serve.vlc.repository.userHistoric;

import com.google.cloud.firestore.CollectionReference;
import com.google.firebase.cloud.FirestoreClient;
import mg.serve.vlc.model.user.UserHistoric;
import org.springframework.stereotype.Repository;

@Repository
public class FirebaseUserHistoricRepository implements UserHistoricRepository {

    private final CollectionReference collectionReference;

    public FirebaseUserHistoricRepository() {
        this.collectionReference = FirestoreClient.getFirestore().collection("users");
    }

    @Override
    public UserHistoric save(UserHistoric userHistoric) {
        String userFbId = userHistoric.getUser().getFbId();
        collectionReference.document(userFbId).collection("history").add(userHistoric.toMap());
        return userHistoric;
    }

    public UserHistoric save(UserHistoric userHistoric, String userFbId) {
        collectionReference.document(userFbId).collection("history").add(userHistoric.toMap());
        return userHistoric;
    }
}