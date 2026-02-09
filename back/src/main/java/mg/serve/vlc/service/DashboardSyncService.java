package mg.serve.vlc.service;

import mg.serve.vlc.controller.response.ApiResponse;
import mg.serve.vlc.controller.response.SyncStatistics;
import mg.serve.vlc.dto.PointDTO;
import mg.serve.vlc.dto.PointsSummaryDTO;
import mg.serve.vlc.dto.WorkTreatmentDTO;
import mg.serve.vlc.model.map.Point;
import mg.serve.vlc.model.map.PointHistoric;
import mg.serve.vlc.util.RepositoryProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardSyncService {
    private static final Logger logger = LoggerFactory.getLogger(DashboardSyncService.class);

    /**
     * Compute dashboard snapshot (summary + workDelay) and persist a document named 'stats' in Firestore.
     * Returns an ApiResponse carrying a SyncStatistics object as data (matching other sync services).
     */
    public ApiResponse syncDashboard() {
        try {
            SyncStatistics stats = new SyncStatistics();

            // 1) compute summary using repository
            PointsSummaryDTO summary = RepositoryProvider.pointsSummaryRepository.getSummary();

            // 2) compute workDelay similar to PointController.getWorkDelay()
            var wtRepo = RepositoryProvider.getRepository(mg.serve.vlc.repository.WorkTreatmentRepository.class);
            List<Integer> finishedIds = wtRepo.getFinishedWork();

            List<PointHistoric> allHistorics = RepositoryProvider.pointHistoricRepository.findAll();

            List<WorkTreatmentDTO> payload = new ArrayList<>();

            long sumTotal = 0L; int countTotal = 0;
            long sumNew = 0L; int countNew = 0;
            long sumInProg = 0L; int countInProg = 0;

            for (Integer pid : finishedIds) {
                try {
                    Point p = RepositoryProvider.getRepository(mg.serve.vlc.repository.point.PointRepository.class).findById(pid).orElse(null);
                    if (p == null) continue;

                    org.locationtech.jts.geom.Point coords = p.getCoordinates();
                    Double lon = coords != null ? coords.getX() : null;
                    Double lat = coords != null ? coords.getY() : null;

                    Integer stateId = p.getPointState() != null ? p.getPointState().getId() : null;
                    String stateLabel = p.getPointState() != null ? p.getPointState().getLabel() : null;

                    Integer typeId = p.getPointType() != null ? p.getPointType().getId() : null;
                    String typeLabel = p.getPointType() != null ? p.getPointType().getLabel() : null;

                    PointDTO pointDTO = new PointDTO(p.getId(), p.getDate(), p.getSurface(), p.getBudget(), lat, lon, stateId, stateLabel, typeId, typeLabel);

                    List<PointHistoric> histForPoint = allHistorics.stream()
                            .filter(h -> h.getPointId() != null && h.getPointId().equals(pid))
                            .sorted(Comparator.comparing(PointHistoric::getDate))
                            .collect(Collectors.toList());

                    java.time.LocalDateTime date0 = null; java.time.LocalDateTime date05 = null; java.time.LocalDateTime date1 = null;

                    for (PointHistoric h : histForPoint) {
                        if (h.getPointState() != null && h.getPointState().getProgress() != null) {
                            double prog = h.getPointState().getProgress();
                            if (date0 == null && Double.valueOf(prog).equals(Double.valueOf(0.0))) date0 = h.getDate();
                            if (date05 == null && Double.valueOf(prog).equals(Double.valueOf(0.5))) date05 = h.getDate();
                            if (date1 == null && Double.valueOf(prog).equals(Double.valueOf(1.0))) date1 = h.getDate();
                        }
                    }

                    if (date1 == null) {
                        Optional<PointHistoric> lastWith1 = histForPoint.stream()
                                .filter(h -> h.getPointState() != null && h.getPointState().getProgress() != null
                                        && Double.valueOf(h.getPointState().getProgress()).equals(Double.valueOf(1.0)))
                                .reduce((first, second) -> second);
                        if (lastWith1.isPresent()) date1 = lastWith1.get().getDate();
                    }

                    Long newDelay = null; Long inProgressDelay = null;
                    if (date0 != null && date05 != null) newDelay = java.time.Duration.between(date0, date05).toMillis();
                    if (date05 != null && date1 != null) inProgressDelay = java.time.Duration.between(date05, date1).toMillis();

                    Long total = null;
                    if (newDelay != null) { sumNew += newDelay; countNew++; }
                    if (inProgressDelay != null) { sumInProg += inProgressDelay; countInProg++; }
                    if (newDelay != null && inProgressDelay != null) { total = newDelay + inProgressDelay; sumTotal += total; countTotal++; }

                    String newLabel = fmt(newDelay); String inProgressLabel = fmt(inProgressDelay); String totalLabel = fmt(total);

                    WorkTreatmentDTO wt = new WorkTreatmentDTO(pointDTO, newDelay, inProgressDelay, newLabel, inProgressLabel, total, totalLabel);
                    payload.add(wt);

                } catch (Exception ex) {
                    // continue on per-point error
                }
            }

            Long avgNew = countNew > 0 ? Math.round((double) sumNew / countNew) : null;
            Long avgInProg = countInProg > 0 ? Math.round((double) sumInProg / countInProg) : null;
            Long avgTotal = countTotal > 0 ? Math.round((double) sumTotal / countTotal) : null;

            Map<String, Object> workDelay = new HashMap<>();
            workDelay.put("workTreatments", payload);
            workDelay.put("average0to05Ms", avgNew);
            workDelay.put("average0to05Label", fmt(avgNew));
            workDelay.put("average05to1Ms", avgInProg);
            workDelay.put("average05to1Label", fmt(avgInProg));
            workDelay.put("average0to1Ms", avgTotal);
            workDelay.put("average0to1Label", fmt(avgTotal));

            // Build snapshot map
            Map<String, Object> snapshot = new HashMap<>();
            snapshot.put("summary", summary);
            snapshot.put("workDelay", workDelay);

            // Persist using FirebaseDashboardRepository to a document named 'stats'
            try {
                mg.serve.vlc.repository.dashboard.FirebaseDashboardRepository firebaseDashboardRepository = new mg.serve.vlc.repository.dashboard.FirebaseDashboardRepository();
                String docId = firebaseDashboardRepository.save(snapshot); // will be 'stats'
                // increment stats
                stats.setDashboardSnapshotsPushedToFirestore(stats.getDashboardSnapshotsPushedToFirestore() + 1);
                // Return stats as data (pattern similar to others)
                return new ApiResponse("success", stats, stats.generateSummaryMessage());
            } catch (Exception e) {
                stats.addError("Failed to persist dashboard snapshot: " + e.getMessage());
                // still return success with stats containing error
                return new ApiResponse("success", stats, stats.generateSummaryMessage());
            }

        } catch (Exception e) {
            logger.error("Dashboard sync failed", e);
            return new ApiResponse("error", null, "Dashboard sync failed: " + e.getMessage());
        }
    }

    private String fmt(Long ms) {
        if (ms == null) return null;
        Duration d = Duration.ofMillis(ms);
        long days = d.toDays();
        long hours = d.toHours() % 24;
        long minutes = d.toMinutes() % 60;
        long seconds = d.getSeconds() % 60;
        if (days > 0) return String.format("%dd %dh %dm", days, hours, minutes);
        if (hours > 0) return String.format("%dh %dm", hours, minutes);
        if (minutes > 0) return String.format("%dm %ds", minutes, seconds);
        return String.format("%ds", seconds);
    }
}
