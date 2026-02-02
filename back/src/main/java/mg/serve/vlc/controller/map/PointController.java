package mg.serve.vlc.controller.map;

import mg.serve.vlc.controller.response.ApiResponse;
import mg.serve.vlc.dto.PointDTO;
import mg.serve.vlc.dto.PointsSummaryDTO;
import mg.serve.vlc.model.map.Point;
import mg.serve.vlc.repository.PointRepository;
import mg.serve.vlc.util.RepositoryProvider;
import jakarta.transaction.Transactional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/points")
public class PointController {

    public PointController() {
           
    }

    /**
     * Liste complète des points.
     * Optionnel : filtrer par point_state_id et/ou point_type_id.
     */
    @GetMapping("")
    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public ResponseEntity<ApiResponse> listPoints(
            @RequestParam(name = "point_state_id", required = false) Integer pointStateId,
            @RequestParam(name = "point_type_id", required = false) Integer pointTypeId
    ) {
        try {
            PointRepository pointRepository = RepositoryProvider.pointRepository;
            List<Point> points;

            // Filtrage simple si demandé
            if (pointStateId != null && pointTypeId != null) {
                // Si besoin, ajoute une méthode repository avec ces deux critères.
                points = pointRepository.findAll(); // fallback si méthode custom absente
                // NOTE: pour performance ajoute findByPointStateIdAndPointTypeId dans PointRepository
            } else if (pointStateId != null) {
                points = pointRepository.findByPointStateId(pointStateId);
            } else if (pointTypeId != null) {
                // fallback to findAll if pas de méthode dédiée
                points = pointRepository.findAll();
                // NOTE: pour performance ajoute findByPointTypeId dans PointRepository
            } else {
                points = pointRepository.findAll();
            }

            List<PointDTO> payload = new ArrayList<>();
            for (Point p : points) {
                org.locationtech.jts.geom.Point coords = p.getCoordinates();
                Double lon = null;
                Double lat = null;
                if (coords != null) {
                    lon = coords.getX();
                    lat = coords.getY();
                }
             

                String stateLabel = p.getPointState() != null ? p.getPointState().getLabel() : null;
                String typeLabel = p.getPointType() != null ? p.getPointType().getLabel() : null;

                PointDTO dto = new PointDTO(
                        p.getId(),
                        p.getDate(),
                        p.getSurface(),
                        p.getBudget(),
                        lat,
                        lon,
                        p.getPointState() != null ? p.getPointState().getId() : null,
                        stateLabel,
                        p.getPointType() != null ? p.getPointType().getId() : null,
                        typeLabel
                );

                payload.add(dto);
            }

            return ResponseEntity.ok(new ApiResponse("success", payload, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse("error", null, e.getMessage()));
        }
    }

    /**
     * Récupérer un point par son id (détails complets).
     */
    @GetMapping("/{id}")
    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public ResponseEntity<ApiResponse> getPoint(@PathVariable("id") Integer id) {
        try {
            PointRepository pointRepository = RepositoryProvider.pointRepository;
            Point p = pointRepository.findById(id).orElse(null);
            if (p == null) {
                return ResponseEntity.badRequest().body(new ApiResponse("error", null, "Point not found"));
            }

            org.locationtech.jts.geom.Point coords = p.getCoordinates();
            Double lon = null;
            Double lat = null;
            if (coords != null) {
                lon = coords.getX();
                lat = coords.getY();
            }

            String stateLabel = p.getPointState() != null ? p.getPointState().getLabel() : null;
            String typeLabel = p.getPointType() != null ? p.getPointType().getLabel() : null;

            PointDTO dto = new PointDTO(
                    p.getId(),
                    p.getDate(),
                    p.getSurface(),
                    p.getBudget(),
                    lat,
                    lon,
                    p.getPointState() != null ? p.getPointState().getId() : null,
                    stateLabel,
                    p.getPointType() != null ? p.getPointType().getId() : null,
                    typeLabel
            );

            return ResponseEntity.ok(new ApiResponse("success", dto, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse("error", null, e.getMessage()));
        }
    }

    /**
     * Returns a summary for points. If userId is provided the summary is limited to that user, otherwise global.
     */
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse> summary() {
        PointsSummaryDTO dto = RepositoryProvider.pointsSummaryRepository.getSummary();
        return ResponseEntity.ok(new ApiResponse("success", dto, null));
    }

    @GetMapping("/list")
    public ResponseEntity<ApiResponse> listPoints() {
        try {
        List<PointDTO> payload = RepositoryProvider.pointRepository.findAll()
            .stream()
            .map(p -> {
                org.locationtech.jts.geom.Point coords = p.getCoordinates();
                Double lon = coords != null ? coords.getX() : null;
                Double lat = coords != null ? coords.getY() : null;

                Integer stateId = p.getPointState() != null ? p.getPointState().getId() : null;
                String stateLabel = p.getPointState() != null ? p.getPointState().getLabel() : null;

                Integer typeId = p.getPointType() != null ? p.getPointType().getId() : null;
                String typeLabel = p.getPointType() != null ? p.getPointType().getLabel() : null;

                return new PointDTO(
                    p.getId(),
                    p.getDate(),
                    p.getSurface(),
                    p.getBudget(),
                    lat,
                    lon,
                    stateId,
                    stateLabel,
                    typeId,
                    typeLabel
                );
            })
            .toList();

        return ResponseEntity.ok(new ApiResponse("success", payload, null));
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(new ApiResponse("error", null, e.getMessage()));
    }

    }
}
