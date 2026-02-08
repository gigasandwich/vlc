package mg.serve.vlc.service;

import mg.serve.vlc.controller.response.ApiResponse;
import mg.serve.vlc.exception.BusinessLogicException;
import mg.serve.vlc.model.map.Point;
import mg.serve.vlc.model.map.PointHistoric;
import mg.serve.vlc.model.user.User;
import mg.serve.vlc.repository.point.FirebasePointHistoricRepository;
import mg.serve.vlc.repository.point.FirebasePointRepository;
import mg.serve.vlc.repository.point.PointRepository;
import mg.serve.vlc.repository.PointHistoricRepository;
import mg.serve.vlc.util.RepositoryProvider;

import org.hibernate.Hibernate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PointSyncService {
    private static final Logger logger = LoggerFactory.getLogger(PointSyncService.class);
    FirebasePointRepository firebasePointRepository = new FirebasePointRepository();
    FirebasePointHistoricRepository firebasePointHistoricRepository = new FirebasePointHistoricRepository();

    public ApiResponse syncPoints() {
        try {
            List<Point> localPoints = RepositoryProvider.jpaPointRepository.findAll();
            List<Point> remotePoints = firebasePointRepository.findAll();

            Map<String, Point> localMap = localPoints.stream().collect(Collectors.toMap(Point::getFbId, p -> p));
            Map<String, Point> remoteMap = remotePoints.stream().collect(Collectors.toMap(Point::getFbId, p -> p));

            Set<String> allPointFbIds = new HashSet<>(localMap.keySet());
            allPointFbIds.addAll(remoteMap.keySet());

            List<String> errors = new ArrayList<>();
            List<Point> syncedPoints = new ArrayList<>();

            for (String fbId : allPointFbIds) {
                Point local = localMap.get(fbId);
                Point remote = remoteMap.get(fbId);

                try {
                    if (local == null && remote != null) {
                        // Firestore only
                        ensureUserExistsLocally(remote.getUser().getFbId());
                        createLocalPoint(remote);
                        syncedPoints.add(remote);
                    } else if (local != null && remote == null) {
                        // Local only
                        Point updatedLocal = pushPointToFirestore(local);
                        ((PointRepository) RepositoryProvider.jpaPointRepository).save(updatedLocal); // To get fbId if needed
                        syncedPoints.add(updatedLocal);
                    } else if (local.getUpdatedAt() != null && remote.getUpdatedAt() != null) {
                        if (local.getUpdatedAt().isAfter(remote.getUpdatedAt())) {
                            // Local newer
                            overwriteFirestorePoint(local);
                            syncedPoints.add(local);
                        } else if (remote.getUpdatedAt().isAfter(local.getUpdatedAt())) {
                            // Firestore newer
                            ensureUserExistsLocally(remote.getUser().getFbId());
                            overwriteLocalPoint(remote);
                            syncedPoints.add(remote);
                        } else {
                            // identical timestamps: no op
                        }
                    } else {
                        // Handle cases where updatedAt is null
                        if (local.getUpdatedAt() == null && remote.getUpdatedAt() != null) {
                            ensureUserExistsLocally(remote.getUser().getFbId());
                            overwriteLocalPoint(remote);
                            syncedPoints.add(remote);
                        } else if (local.getUpdatedAt() != null && remote.getUpdatedAt() == null) {
                            overwriteFirestorePoint(local);
                            syncedPoints.add(local);
                        }
                        // if both null, no op
                    }
                } catch (Exception e) {
                    errors.add("Failed to sync point " + fbId + ": " + e.getMessage());
                    logger.warn("Failed to sync point {}", fbId, e);
                }
            }

            String message = String.format("Synced %d points. %d errors occurred.", syncedPoints.size(), errors.size());
            if (!errors.isEmpty()) {
                message += " Errors: " + String.join("; ", errors);
            }

            return new ApiResponse("success", syncedPoints, message);
        } catch (Exception e) {
            logger.error("Sync points failed", e);
            return new ApiResponse("error", null, "Sync points failed: " + e.getMessage());
        }
    }

    private void ensureUserExistsLocally(String userFbId) throws BusinessLogicException {
        Optional<User> existingUser = RepositoryProvider.jpaUserRepository.findByFbId(userFbId);
        if (existingUser.isEmpty()) {
            throw new BusinessLogicException("User with fbId " + userFbId + " does not exist locally");
        }
    }

    private Point createLocalPoint(Point remote) throws BusinessLogicException {
        Point local = new Point();
        local.setDate(remote.getDate() != null ? remote.getDate() : LocalDateTime.now());
        local.setUpdatedAt(remote.getUpdatedAt());
        local.setDeletedAt(remote.getDeletedAt());
        local.setSurface(remote.getSurface());
        local.setBudget(remote.getBudget());
        local.setFbId(remote.getFbId());
        local.setCoordinates(remote.getCoordinates().getX(), remote.getCoordinates().getY());
        local.setUser(remote.getUser());
        local.setPointState(remote.getPointState());
        local.setPointType(remote.getPointType());
        local.setFactories(remote.getFactories());
        ((PointRepository) RepositoryProvider.jpaPointRepository).save(local);
        logger.info("Created local point: {}", remote.getFbId());
        return local;
    }

    private Point pushPointToFirestore(Point local) {
        if (local.getUser() != null) {
            Hibernate.initialize(local.getUser());
        }
        Point newPoint = firebasePointRepository.save(local);
        logger.info("Pushed point to Firestore: {}", local.getFbId());
        return newPoint;
    }

    private Point overwriteFirestorePoint(Point local) {
        if (local.getUser() != null) {
            Hibernate.initialize(local.getUser());
        }
        Point updatedPoint = firebasePointRepository.save(local);
        logger.info("Overwrote Firestore point: {}", local.getFbId());
        return updatedPoint;
    }

    private Point overwriteLocalPoint(Point remote) throws BusinessLogicException {
        Point local = RepositoryProvider.jpaPointRepository.findByFbId(remote.getFbId()).orElseThrow(() -> new BusinessLogicException("Local point not found"));
        if (remote.getDate() != null) {
            local.setDate(remote.getDate());
        }
        local.setUpdatedAt(remote.getUpdatedAt());
        local.setDeletedAt(remote.getDeletedAt());
        local.setSurface(remote.getSurface());
        local.setBudget(remote.getBudget());
        local.setCoordinates(remote.getCoordinates().getX(), remote.getCoordinates().getY());
        local.setUser(remote.getUser());
        local.setPointState(remote.getPointState());
        local.setPointType(remote.getPointType());
        local.setFactories(remote.getFactories());
        ((PointRepository) RepositoryProvider.jpaPointRepository).save(local);
        logger.info("Overwrote local point: {}", remote.getFbId());
        return local;
    }

    public ApiResponse syncPointHistoric() {
        try {
            List<Point> allPoints = RepositoryProvider.jpaPointRepository.findAll();
            List<String> errors = new ArrayList<>();
            int totalSynced = 0;

            for (Point point : allPoints) {
                if (point.getFbId() == null) continue; // TODO: Check later 
                try {
                    List<PointHistoric> localHistory = RepositoryProvider.pointHistoricRepository.findByPointId(point.getId());
                    List<PointHistoric> remoteHistory = firebasePointHistoricRepository.findByPointFbId(point.getFbId());

                    Set<Integer> localIds = localHistory.stream().map(PointHistoric::getId).collect(Collectors.toSet());
                    Set<Integer> remoteIds = remoteHistory.stream().map(PointHistoric::getId).collect(Collectors.toSet());

                    Set<Integer> missingLocal = new HashSet<>(remoteIds);
                    missingLocal.removeAll(localIds);

                    Set<Integer> missingRemote = new HashSet<>(localIds);
                    missingRemote.removeAll(remoteIds);

                    Map<Integer, PointHistoric> remoteMap = remoteHistory.stream().collect(Collectors.toMap(PointHistoric::getId, h -> h));
                    Map<Integer, PointHistoric> localMap = localHistory.stream().collect(Collectors.toMap(PointHistoric::getId, h -> h));

                    for (Integer id : missingLocal) {
                        PointHistoric remoteHistoric = remoteMap.get(id);
                        if (remoteHistoric != null) {
                            insertLocalPointHistoric(remoteHistoric, point);
                            totalSynced++;
                        }
                    }

                    for (Integer id : missingRemote) {
                        PointHistoric localHistoric = localMap.get(id);
                        if (localHistoric != null) {
                            insertRemotePointHistoric(localHistoric);
                            totalSynced++;
                        }
                    }

                    logger.info("Synced history for point: {}", point.getFbId());
                } catch (Exception e) {
                    errors.add("Failed to sync history for point " + point.getFbId() + ": " + e.getMessage());
                    logger.warn("Failed to sync history for point {}", point.getFbId(), e);
                }
            }

            String message = String.format("Synced %d historic entries. %d errors occurred.", totalSynced, errors.size());
            if (!errors.isEmpty()) {
                message += " Errors: " + String.join("; ", errors);
            }

            return new ApiResponse("success", null, message);
        } catch (Exception e) {
            logger.error("Sync point historic failed", e);
            return new ApiResponse("error", null, "Sync point historic failed: " + e.getMessage());
        }
    }

    private PointHistoric insertLocalPointHistoric(PointHistoric remoteHistoric, Point point) {
        PointHistoric localHistoric = new PointHistoric();
        localHistoric.setDate(remoteHistoric.getDate());
        localHistoric.setSurface(remoteHistoric.getSurface());
        localHistoric.setBudget(remoteHistoric.getBudget());
        localHistoric.setCoordinates(remoteHistoric.getCoordinates().getX(), remoteHistoric.getCoordinates().getY());
        localHistoric.setPointId(point.getId());
        localHistoric.setPointState(remoteHistoric.getPointState());
        localHistoric.setFbId(point.getFbId());
        return RepositoryProvider.pointHistoricRepository.save(localHistoric);
    }

    private PointHistoric insertRemotePointHistoric(PointHistoric localHistoric) {
        if (localHistoric.getFbId() == null || localHistoric.getFbId().isEmpty()) {
            logger.warn("Skipping insert remote historic for point with null or empty fbId");
            return null;
        }
        return firebasePointHistoricRepository.save(localHistoric, localHistoric.getFbId());
    }
}