package mg.serve.vlc.repository.example;

import java.util.*;
import java.util.concurrent.ExecutionException;

import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.firebase.cloud.FirestoreClient;
import mg.serve.vlc.model.Example;

public class FirebaseExampleRepository implements ExampleRepository {
    @Override
    public List<Example> findAll() {
        Firestore firestore = FirestoreClient.getFirestore();

        List<Example> examples = new ArrayList<>();
        try {
            QuerySnapshot querySnapshot = firestore.collection("example").get().get();
            // examples = querySnapshot.toObjects(Example.class);
            
            for (QueryDocumentSnapshot doc : querySnapshot.getDocuments()) {
                Map<String, Object> data = doc.getData();
                
                Example example = new Example();
                // Example example = doc.toObject(Example.class);
                example.setFbId(doc.getId());
                example.setColumn1((String) data.get("column1"));
                examples.add(example);
            }

        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        }

        return examples;
    }

    @Override
    public Example save(Example example) {
        throw new UnsupportedOperationException("Unimplemented method 'save'");
    }
}
