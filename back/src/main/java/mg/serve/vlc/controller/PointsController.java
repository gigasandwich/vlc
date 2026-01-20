package mg.serve.vlc.controller;

import mg.serve.vlc.controller.response.ApiResponse;
import mg.serve.vlc.dto.PointsSummaryDTO;
import mg.serve.vlc.repository.PointsSummaryRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/points")
public class PointsController {

    private final PointsSummaryRepository repo;

    @Autowired
    public PointsController(PointsSummaryRepository repo) {
        this.repo = repo;
    }

    /**
     * Returns a summary for points. If userId is provided the summary is limited to that user, otherwise global.
     */
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse> summary(@RequestParam(required = false) Long userId) {
        PointsSummaryDTO dto = repo.getSummary(userId);
        return ResponseEntity.ok(new ApiResponse("OK", dto, null));
    }
}
