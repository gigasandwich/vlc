package mg.serve.vlc.repository.pointState;

import mg.serve.vlc.model.map.PointState;
import java.util.Optional;

public class FirebasePointStateRepository implements PointStateRepository {
    @Override
    public Optional<PointState> findById(Integer id) {
        throw new UnsupportedOperationException("Firebase not implemented for PointState");
    }

    @Override
    public PointState save(PointState pointState) {
        throw new UnsupportedOperationException("Firebase not implemented for PointState");
    }

    @Override
    public PointState findByLabel(String label) {
        throw new UnsupportedOperationException("Firebase not implemented for PointState");
    }
}