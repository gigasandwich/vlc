package mg.serve.vlc.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import mg.serve.vlc.controller.response.ApiResponse;
import mg.serve.vlc.controller.response.SyncStatistics;
import mg.serve.vlc.exception.BusinessLogicException;
import mg.serve.vlc.service.UserSyncService;
import mg.serve.vlc.service.PointSyncService;
import mg.serve.vlc.service.DashboardSyncService;
import mg.serve.vlc.model.user.*;
import mg.serve.vlc.security.JwtService;

@RestController
@RequestMapping("/sync")
public class SyncController {
    private static final Logger logger = LoggerFactory.getLogger(SyncController.class);

    @Autowired
    private UserSyncService userSyncService;

    @Autowired
    private PointSyncService pointSyncService;

    @Autowired
    private DashboardSyncService dashboardSyncService;

    @Autowired
    private JwtService jwtService;


    @PostMapping("/all")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse> syncAll(@RequestHeader("Authorization") String authHeader) {
        try {
            jwtService.throwIfUserNotAdmin(authHeader);

            SyncStatistics aggregatedStats = new SyncStatistics();

            // Sync users
            ApiResponse userResponse = userSyncService.syncUsers();
            if ("success".equals(userResponse.getStatus()) && userResponse.getData() instanceof SyncStatistics) {
                SyncStatistics userStats = (SyncStatistics) userResponse.getData();
                aggregatedStats.setUsersCreatedLocally(userStats.getUsersCreatedLocally());
                aggregatedStats.setUsersPushedToFirestore(userStats.getUsersPushedToFirestore());
                aggregatedStats.setUsersUpdatedLocally(userStats.getUsersUpdatedLocally());
                aggregatedStats.setUsersUpdatedInFirestore(userStats.getUsersUpdatedInFirestore());
                aggregatedStats.setErrorMessages(userStats.getErrorMessages());
                aggregatedStats.setTotalErrors(userStats.getTotalErrors());
            }

            // Sync user historic
            ApiResponse userHistoricResponse = userSyncService.syncUserHistoric();
            if ("success".equals(userHistoricResponse.getStatus()) && userHistoricResponse.getData() instanceof SyncStatistics) {
                SyncStatistics userHistoricStats = (SyncStatistics) userHistoricResponse.getData();
                aggregatedStats.setHistoricCreatedLocally(userHistoricStats.getHistoricCreatedLocally());
                aggregatedStats.setHistoricPushedToFirestore(userHistoricStats.getHistoricPushedToFirestore());
                aggregatedStats.setHistoricUpdatedLocally(userHistoricStats.getHistoricUpdatedLocally());
                aggregatedStats.setHistoricUpdatedInFirestore(userHistoricStats.getHistoricUpdatedInFirestore());
                // Merge errors
                for (String error : userHistoricStats.getErrorMessages()) {
                    aggregatedStats.addError(error);
                }
            }

            // Sync points
            ApiResponse pointResponse = pointSyncService.syncPoints();
            if ("success".equals(pointResponse.getStatus()) && pointResponse.getData() instanceof SyncStatistics) {
                SyncStatistics pointStats = (SyncStatistics) pointResponse.getData();
                aggregatedStats.setPointsCreatedLocally(pointStats.getPointsCreatedLocally());
                aggregatedStats.setPointsPushedToFirestore(pointStats.getPointsPushedToFirestore());
                aggregatedStats.setPointsUpdatedLocally(pointStats.getPointsUpdatedLocally());
                aggregatedStats.setPointsUpdatedInFirestore(pointStats.getPointsUpdatedInFirestore());
                // Merge errors
                for (String error : pointStats.getErrorMessages()) {
                    aggregatedStats.addError(error);
                }
            }

            // Sync point historic
            ApiResponse pointHistoricResponse = pointSyncService.syncPointHistoric();
            if ("success".equals(pointHistoricResponse.getStatus()) && pointHistoricResponse.getData() instanceof SyncStatistics) {
                SyncStatistics pointHistoricStats = (SyncStatistics) pointHistoricResponse.getData();
                aggregatedStats.setPointHistoricCreatedLocally(pointHistoricStats.getPointHistoricCreatedLocally());
                aggregatedStats.setPointHistoricPushedToFirestore(pointHistoricStats.getPointHistoricPushedToFirestore());
                aggregatedStats.setPointHistoricUpdatedLocally(pointHistoricStats.getPointHistoricUpdatedLocally());
                aggregatedStats.setPointHistoricUpdatedInFirestore(pointHistoricStats.getPointHistoricUpdatedInFirestore());
                // Merge errors
                for (String error : pointHistoricStats.getErrorMessages()) {
                    aggregatedStats.addError(error);
                }
            }

            // Sync dashboard (create/update a Firestore document named 'stats')
           
            ApiResponse dashboardResp = dashboardSyncService.syncDashboard();
            if ("success".equals(dashboardResp.getStatus()) && dashboardResp.getData() instanceof SyncStatistics) {
                SyncStatistics dashStats = (SyncStatistics) dashboardResp.getData();
                aggregatedStats.setDashboardSnapshotsCreatedLocally(dashStats.getDashboardSnapshotsCreatedLocally());
                aggregatedStats.setDashboardSnapshotsPushedToFirestore(dashStats.getDashboardSnapshotsPushedToFirestore());
                aggregatedStats.setDashboardSnapshotsUpdatedLocally(dashStats.getDashboardSnapshotsUpdatedLocally());
                aggregatedStats.setDashboardSnapshotsUpdatedInFirestore(dashStats.getDashboardSnapshotsUpdatedInFirestore());
                for (String err : dashStats.getErrorMessages()) {
                    aggregatedStats.addError(err);
                }
            }
            

            return ResponseEntity.ok(new ApiResponse("success", aggregatedStats, aggregatedStats.generateSummaryMessage()));
        } catch (Exception e) {
            logger.error("Sync all failed", e);
            return ResponseEntity.badRequest().body(new ApiResponse("error", null, "Sync all failed: " + e.getMessage()));
        }
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse> syncUsers() {
        ApiResponse response = userSyncService.syncUsers();
        if ("success".equals(response.getStatus())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/userHistoric")
    public ResponseEntity<ApiResponse> syncUserHistoric() {
        ApiResponse response = userSyncService.syncUserHistoric();
        if ("success".equals(response.getStatus())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/points")
    public ResponseEntity<ApiResponse> syncPoints() {
        ApiResponse response = pointSyncService.syncPoints();
        if ("success".equals(response.getStatus())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/pointHistoric")
    public ResponseEntity<ApiResponse> syncPointHistoric() {
        ApiResponse response = pointSyncService.syncPointHistoric();
        if ("success".equals(response.getStatus())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/dashboard")
    public ResponseEntity<ApiResponse> syncDashboard() {
        ApiResponse response = dashboardSyncService.syncDashboard();
        if ("success".equals(response.getStatus())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
}