package mg.serve.vlc.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import mg.serve.vlc.controller.response.ApiResponse;
import mg.serve.vlc.service.UserSyncService;
import mg.serve.vlc.service.PointSyncService;

@RestController
@RequestMapping("/sync")
public class SyncController {
    private static final Logger logger = LoggerFactory.getLogger(SyncController.class);

    @Autowired
    private UserSyncService userSyncService;

    @Autowired
    private PointSyncService pointSyncService;

    @PostMapping("/all")
    public ResponseEntity<ApiResponse> syncAll() {
        try {
            userSyncService.syncUsers();
            userSyncService.syncUserHistoric();
            pointSyncService.syncPoints();
            pointSyncService.syncPointHistoric();
            
            return ResponseEntity.ok(new ApiResponse("success", null, "All sync completed"));
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
}