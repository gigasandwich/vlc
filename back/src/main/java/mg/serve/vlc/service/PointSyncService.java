package mg.serve.vlc.service;

import mg.serve.vlc.controller.response.ApiResponse;
import mg.serve.vlc.controller.response.SyncStatistics;
import mg.serve.vlc.exception.BusinessLogicException;
import mg.serve.vlc.model.map.Point;
import mg.serve.vlc.model.map.PointHistoric;
import mg.serve.vlc.model.map.PointState;
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

            // Push local points with null fbId to Firestore first
            for (Point local : localPoints) {
                if (local.getFbId() == null) {
                    Point updatedLocal = pushPointToFirestore(local);
                    local = ((PointRepository) RepositoryProvider.jpaPointRepository).save(updatedLocal);
                }
            }

            Map<String, Point> localMap = localPoints.stream().collect(Collectors.toMap(Point::getFbId, p -> p));
            Map<String, Point> remoteMap = remotePoints.stream().collect(Collectors.toMap(Point::getFbId, p -> p));

            Set<String> allPointFbIds = new HashSet<>(localMap.keySet());
            allPointFbIds.addAll(remoteMap.keySet());

            SyncStatistics stats = new SyncStatistics();

            for (String fbId : allPointFbIds) {
                Point local = localMap.get(fbId);
                Point remote = remoteMap.get(fbId);

                try {
                    if (local == null && remote != null) {
                        // Firestore only
                        ensureUserExistsLocally(remote.getUser().getFbId());
                        createLocalPoint(remote);
                        stats.setPointsCreatedLocally(stats.getPointsCreatedLocally() + 1);
                    } else if (local != null && remote == null) {
                        // Local only
                        Point updatedLocal = pushPointToFirestore(local);
                        local = ((PointRepository) RepositoryProvider.jpaPointRepository).save(updatedLocal); // To get fbId if needed
                        stats.setPointsPushedToFirestore(stats.getPointsPushedToFirestore() + 1);
                    } else if (local.getUpdatedAt() != null && remote.getUpdatedAt() != null) {
                        if (local.getUpdatedAt().isAfter(remote.getUpdatedAt())) {
                            // Local newer
                            overwriteFirestorePoint(local);
                            stats.setPointsUpdatedInFirestore(stats.getPointsUpdatedInFirestore() + 1);
                        } else if (remote.getUpdatedAt().isAfter(local.getUpdatedAt())) {
                            // Firestore newer
                            ensureUserExistsLocally(remote.getUser().getFbId());
                            overwriteLocalPoint(remote);
                            stats.setPointsUpdatedLocally(stats.getPointsUpdatedLocally() + 1);
                        } else {
                            // identical timestamps: no op
                        }
                    } else {
                        // Handle cases where updatedAt is null
                        if (local.getUpdatedAt() == null && remote.getUpdatedAt() != null) {
                            ensureUserExistsLocally(remote.getUser().getFbId());
                            overwriteLocalPoint(remote);
                            stats.setPointsUpdatedLocally(stats.getPointsUpdatedLocally() + 1);
                        } else if (local.getUpdatedAt() != null && remote.getUpdatedAt() == null) {
                            overwriteFirestorePoint(local);
                            stats.setPointsUpdatedInFirestore(stats.getPointsUpdatedInFirestore() + 1);
                        }
                        // if both null, no op
                    }
                } catch (Exception e) {
                    stats.addError("Failed to sync point " + fbId + ": " + e.getMessage());
                    logger.warn("Failed to sync point {}", fbId, e);
                }
            }

            return new ApiResponse("success", stats, stats.generateSummaryMessage());
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
        if (remote.getPointState() != null) {
            local.setPointState(remote.getPointState());
        } else {
            PointState defaultState = new PointState();
            defaultState.setId(1);
            local.setPointState(defaultState);
        }
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
            SyncStatistics stats = new SyncStatistics();

            for (Point point : allPoints) {
                if (point.getFbId() == null) continue; // TODO: To check if there are problems in firestore later
                try {
                    List<PointHistoric> localHistory = RepositoryProvider.pointHistoricRepository.findByPointId(point.getId());
                    List<PointHistoric> remoteHistory = firebasePointHistoricRepository.findByPointFbId(point.getFbId());

                    // Find missing local historic entries or update existing
                    for (PointHistoric remoteHistoric : remoteHistory) {
                        Optional<PointHistoric> existing = localHistory.stream()
                            .filter(local -> Objects.equals(local.getFbId(), remoteHistoric.getFbId()))
                            .findFirst();
                        if (existing.isPresent()) {
                            // Update existing local historic
                            PointHistoric local = existing.get();
                            local.setDate(remoteHistoric.getDate());
                            local.setSurface(remoteHistoric.getSurface());
                            local.setBudget(remoteHistoric.getBudget());
                            local.setCoordinates(remoteHistoric.getCoordinates().getX(), remoteHistoric.getCoordinates().getY());
                            local.setPointState(remoteHistoric.getPointState());
                            RepositoryProvider.pointHistoricRepository.save(local);
                            stats.setPointHistoricUpdatedLocally(stats.getPointHistoricUpdatedLocally() + 1);
                        } else {
                            insertLocalPointHistoric(remoteHistoric, point);
                            stats.setPointHistoricCreatedLocally(stats.getPointHistoricCreatedLocally() + 1);
                        }
                    }

                    // Find missing remote historic entries
                    for (PointHistoric localHistoric : localHistory) {
                        boolean existsRemotely = remoteHistory.stream().anyMatch(remote -> Objects.equals(remote.getFbId(), localHistoric.getFbId()));
                        if (!existsRemotely) {
                            insertRemotePointHistoric(localHistoric, point.getFbId());
                            stats.setPointHistoricPushedToFirestore(stats.getPointHistoricPushedToFirestore() + 1);
                        }
                    }

                    logger.info("Synced history for point: {}", point.getFbId());
                } catch (Exception e) {
                    stats.addError("Failed to sync history for point " + point.getFbId() + ": " + e.getMessage());
                    logger.warn("Failed to sync history for point {}", point.getFbId(), e);
                }
            }

            return new ApiResponse("success", stats, stats.generateSummaryMessage());
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
        localHistoric.setFbId(remoteHistoric.getFbId());
        return RepositoryProvider.pointHistoricRepository.save(localHistoric);
    }

    private PointHistoric insertRemotePointHistoric(PointHistoric localHistoric, String pointFbId) {
        String fbId = localHistoric.getFbId() != null && !localHistoric.getFbId().isEmpty() ? localHistoric.getFbId() : pointFbId;
        if (fbId == null || fbId.isEmpty()) {
            logger.warn("Skipping insert remote historic for point with null or empty fbId");
            return null;
        }
        return firebasePointHistoricRepository.save(localHistoric, fbId);
    }

    private boolean pointHistoricDataEquals(PointHistoric h1, PointHistoric h2) {
        if (h1 == h2) return true;
        if (h1 == null || h2 == null) return false;
        return Objects.equals(h1.getDate(), h2.getDate()) &&
               Objects.equals(h1.getSurface(), h2.getSurface()) &&
               Objects.equals(h1.getBudget(), h2.getBudget()) &&
               Objects.equals(h1.getPointState(), h2.getPointState()) &&
               (h1.getCoordinates() != null && h2.getCoordinates() != null &&
                h1.getCoordinates().getX() == h2.getCoordinates().getX() &&
                h1.getCoordinates().getY() == h2.getCoordinates().getY());
    }
}