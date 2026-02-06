package mg.serve.vlc.controller.map;

import mg.serve.vlc.controller.response.ApiResponse;
import mg.serve.vlc.dto.PointDTO;
import mg.serve.vlc.dto.PointUpdateDTO;
import mg.serve.vlc.dto.PointsSummaryDTO;
import mg.serve.vlc.dto.WorkTreatmentDTO;
import mg.serve.vlc.dto.PointInProgressDTO;
import mg.serve.vlc.exception.BusinessLogicException;
import mg.serve.vlc.model.map.*;
import mg.serve.vlc.model.user.*;
import mg.serve.vlc.repository.point.*;
import mg.serve.vlc.repository.PointTypeRepository;
import mg.serve.vlc.repository.FactoryRepository;
import mg.serve.vlc.repository.pointState.PointStateRepository;
import mg.serve.vlc.security.JwtService;
import mg.serve.vlc.util.RepositoryProvider;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/points")
@RequiredArgsConstructor
// @SecurityRequirement(name = "bearerAuth")
public class PointController {
    @Autowired
    private final JwtService jwtService;

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
            PointRepository pointRepository = RepositoryProvider.getRepository(PointRepository.class);
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

            List<Map<String, Object>> payload = new ArrayList<>();
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
                List<Integer> factoryIds = p.getFactories().stream().map(f -> f.getId()).collect(Collectors.toList());
                String factoryLabels = p.getFactories().stream().map(f -> f.getLabel()).collect(Collectors.joining(", "));

                Map<String, Object> map = new HashMap<>();
                map.put("id", p.getId());
                map.put("date", p.getDate());
                map.put("surface", p.getSurface());
                map.put("budget", p.getBudget());
                map.put("lat", lat);
                map.put("lon", lon);
                map.put("stateId", p.getPointState() != null ? p.getPointState().getId() : null);
                map.put("stateLabel", stateLabel);
                map.put("typeId", p.getPointType() != null ? p.getPointType().getId() : null);
                map.put("typeLabel", typeLabel);
                map.put("factoryIds", factoryIds);
                map.put("factoryLabels", factoryLabels); // Lord forgive me
                map.put("updatedAt", p.getUpdatedAt());

                payload.add(map);
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
            PointRepository pointRepository = RepositoryProvider.getRepository(PointRepository.class);
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

            Map<String, Object> data = new HashMap<>();
            data.put("point", dto);
            data.put("factoryIds", p.getFactories().stream().map(f -> f.getId()).collect(Collectors.toList()));

            return ResponseEntity.ok(new ApiResponse("success", data, null));
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

    // @GetMapping("/list")
    // public ResponseEntity<ApiResponse> listPoints() {
    //     try {
    //     List<PointDTO> payload = RepositoryProvider.pointRepository.findAll()
    //         .stream()
    //         .map(p -> {
    //             org.locationtech.jts.geom.Point coords = p.getCoordinates();
    //             Double lon = coords != null ? coords.getX() : null;
    //             Double lat = coords != null ? coords.getY() : null;

    //             Integer stateId = p.getPointState() != null ? p.getPointState().getId() : null;
    //             String stateLabel = p.getPointState() != null ? p.getPointState().getLabel() : null;

    //             Integer typeId = p.getPointType() != null ? p.getPointType().getId() : null;
    //             String typeLabel = p.getPointType() != null ? p.getPointType().getLabel() : null;

    //             return new PointDTO(
    //                 p.getId(),
    //                 p.getDate(),
    //                 p.getSurface(),
    //                 p.getBudget(),
    //                 lat,
    //                 lon,
    //                 stateId,
    //                 stateLabel,
    //                 typeId,
    //                 typeLabel
    //             );
    //         })
    //         .toList(); // Java 16+; use .collect(Collectors.toList()) if < Java 16
    //     // Populate factories list for each DTO using PointFactoryRepository
    //     try {
    //         payload.forEach(dto -> {
    //             try {
    //                 List<String> labels = PointFactory.getFactoryLabelsForPoint(dto.id);
    //                 dto.factories = labels != null ? labels : new java.util.ArrayList<>();
    //             } catch (Exception ex) {
    //                 dto.factories = new java.util.ArrayList<>();
    //             }
    //         });
    //     } catch (Exception ex) {
    //         // ignore
    //     }
    //     return ResponseEntity.ok(new ApiResponse("success", payload, null));
    // } catch (Exception e) {
    //     return ResponseEntity.badRequest().body(new ApiResponse("error", null, e.getMessage()));
    // }

    // }


    @GetMapping("/factories")
    public ResponseEntity<ApiResponse> listFactories() {
        try {
            FactoryRepository factoryRepo = RepositoryProvider.getRepository(FactoryRepository.class);
            List<Factory> factories = factoryRepo.findAll();
            List<Map<String, Object>> payload = factories.stream()
                .map(f -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", f.getId());
                    map.put("label", f.getLabel());
                    return map;
                })
                .collect(Collectors.toList());
            return ResponseEntity.ok(new ApiResponse("success", payload, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse("error", null, e.getMessage()));
        }
    }

    @GetMapping("/pointStates")
    public ResponseEntity<ApiResponse> listPointStates() {
        try {
            PointStateRepository pointStateRepo = RepositoryProvider.getRepository(PointStateRepository.class);
            List<PointState> pointStates = pointStateRepo.findAll();
            List<Map<String, Object>> payload = pointStates.stream()
                .map(ps -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", ps.getId());
                    map.put("label", ps.getLabel());
                    return map;
                })
                .collect(Collectors.toList());
            return ResponseEntity.ok(new ApiResponse("success", payload, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse("error", null, e.getMessage()));
        }
    }

    @GetMapping("/pointTypes")
    public ResponseEntity<ApiResponse> listPointTypes() {
        try {
            PointTypeRepository pointTypeRepo = RepositoryProvider.getRepository(PointTypeRepository.class);
            List<PointType> pointTypes = pointTypeRepo.findAll();
            List<Map<String, Object>> payload = pointTypes.stream()
                .map(pt -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", pt.getId());
                    map.put("label", pt.getLabel());
                    return map;
                })
                .collect(Collectors.toList());
            return ResponseEntity.ok(new ApiResponse("success", payload, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse("error", null, e.getMessage()));
        }
    }
    
    /**
     * Admin only
     */
    @PutMapping("/{id}")
    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public ResponseEntity<ApiResponse> updatePoint(@PathVariable("id") Integer id, @RequestBody PointUpdateDTO dto, @RequestHeader("Authorization") String authHeader) {
        try {
            User user = jwtService.getUserFromAuthHeader(authHeader);
            if (!user.isAdmin()) {
                throw new BusinessLogicException("Only admins can update points");
            }

            Point point = RepositoryProvider.getRepository(PointRepository.class).findById(id).orElse(null);
            if (point == null) {
                return ResponseEntity.badRequest().body(new ApiResponse("error", null, "Point not found"));
            }

            if (dto.getSurface() != null) {
                point.setSurface(dto.getSurface());
            }
            if (dto.getBudget() != null) {
                point.setBudget(dto.getBudget());
            }
            if (dto.getPointStateId() != null) {
                PointStateRepository pointStateRepo = RepositoryProvider.getRepository(PointStateRepository.class);
                PointState pointState = pointStateRepo.findById(dto.getPointStateId()).orElse(null);
                if (pointState != null) {
                    point.setPointState(pointState);
                }
            }
            if (dto.getPointTypeId() != null) {
                PointTypeRepository pointTypeRepo = RepositoryProvider.getRepository(PointTypeRepository.class);
                PointType pointType = pointTypeRepo.findById(dto.getPointTypeId()).orElse(null);
                if (pointType != null) {
                    point.setPointType(pointType);
                }
            }

            if (dto.getFactoryIds() != null) {
                List<Factory> factories = dto.getFactoryIds().stream()
                        .map(fid -> {
                            Factory f = RepositoryProvider.getRepository(FactoryRepository.class).findById(fid).orElse(null);
                            // f.setUpdatedAt(dto.getUpdatedAt() != null ? dto.getUpdatedAt() : LocalDateTime.now());
                            return f;
                        })
                        .filter(Objects::nonNull)
                        .collect(Collectors.toList());
                point.setFactories(factories);
            }

            if (dto.getUpdatedAt() != null) {
                point.setUpdatedAt(dto.getUpdatedAt());
            } else {
                point.setUpdatedAt(LocalDateTime.now());
            }

            point.saveHistoric();
            Point savedPoint = point.save();

            return ResponseEntity.ok(new ApiResponse("success", savedPoint.getId(), null));
        } catch (BusinessLogicException e) {
            return ResponseEntity.badRequest().body(new ApiResponse("error", null, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse("error", null, e.getMessage()));
        }
    }

    @GetMapping("/in-progress")
    public ResponseEntity<ApiResponse> getPointInProgress() {
        List<PointInProgressDTO> dto = RepositoryProvider.pointInProgressRepository.getPointInProgress();
        return ResponseEntity.ok(new ApiResponse("success", dto, null));
    }

    @GetMapping("/work-delay")
    public ResponseEntity<ApiResponse> getWorkDelay() {
        try {
            // helper to format ms into human readable string
            java.util.function.Function<Long, String> fmt = (ms) -> {
                if (ms == null) return null;
                java.time.Duration d = java.time.Duration.ofMillis(ms);
                long days = d.toDays();
                long hours = d.toHours() % 24;
                long minutes = d.toMinutes() % 60;
                long seconds = d.getSeconds() % 60;
                if (days > 0) return String.format("%dd %dh %dm", days, hours, minutes);
                if (hours > 0) return String.format("%dh %dm", hours, minutes);
                if (minutes > 0) return String.format("%dm %ds", minutes, seconds);
                return String.format("%ds", seconds);
            };

            // get finished point ids via repository
            var wtRepo = RepositoryProvider.getRepository(mg.serve.vlc.repository.WorkTreatmentRepository.class);
            java.util.List<Integer> finishedIds = wtRepo.getFinishedWork();

            java.util.List<WorkTreatmentDTO> payload = new java.util.ArrayList<>();

            // load all historic entries once
            java.util.List<mg.serve.vlc.model.map.PointHistoric> allHistorics = RepositoryProvider.pointHistoricRepository.findAll();

            long sumTotal = 0L;
            int countTotal = 0;
            long sumNew = 0L;
            int countNew = 0;
            long sumInProg = 0L;
            int countInProg = 0;

            for (Integer pid : finishedIds) {
                try {
                    mg.serve.vlc.model.map.Point p = RepositoryProvider.getRepository(PointRepository.class).findById(pid).orElse(null);
                    if (p == null) continue;

                    // build PointDTO for this point (similar to getPoint)
                    org.locationtech.jts.geom.Point coords = p.getCoordinates();
                    Double lon = coords != null ? coords.getX() : null;
                    Double lat = coords != null ? coords.getY() : null;

                    Integer stateId = p.getPointState() != null ? p.getPointState().getId() : null;
                    String stateLabel = p.getPointState() != null ? p.getPointState().getLabel() : null;

                    Integer typeId = p.getPointType() != null ? p.getPointType().getId() : null;
                    String typeLabel = p.getPointType() != null ? p.getPointType().getLabel() : null;

                    PointDTO pointDTO = new PointDTO(
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

                    // filter historic entries for this point and sort by date
                    java.util.List<mg.serve.vlc.model.map.PointHistoric> histForPoint = allHistorics.stream()
                        .filter(h -> h.getPointId() != null && h.getPointId().equals(pid))
                        .sorted((a,b) -> a.getDate().compareTo(b.getDate()))
                        .collect(java.util.stream.Collectors.toList());

                    java.time.LocalDateTime date0 = null;
                    java.time.LocalDateTime date05 = null;
                    java.time.LocalDateTime date1 = null;

                    for (mg.serve.vlc.model.map.PointHistoric h : histForPoint) {
                        if (h.getPointState() != null && h.getPointState().getProgress() != null) {
                            double prog = h.getPointState().getProgress();
                            if (date0 == null && Double.valueOf(prog).equals(Double.valueOf(0.0))) {
                                date0 = h.getDate();
                            }
                            if (date05 == null && Double.valueOf(prog).equals(Double.valueOf(0.5))) {
                                date05 = h.getDate();
                            }
                            if (date1 == null && Double.valueOf(prog).equals(Double.valueOf(1.0))) {
                                date1 = h.getDate();
                            }
                        }
                    }

                    // attempt to find latest 1.0 historic if date1 missing
                    if (date1 == null) {
                        java.util.Optional<mg.serve.vlc.model.map.PointHistoric> lastWith1 = histForPoint.stream()
                            .filter(h -> h.getPointState() != null && h.getPointState().getProgress() != null
                                && Double.valueOf(h.getPointState().getProgress()).equals(Double.valueOf(1.0)))
                            .reduce((first, second) -> second);
                        if (lastWith1.isPresent()) date1 = lastWith1.get().getDate();
                    }

                    Long newDelay = null;
                    Long inProgressDelay = null;
                    if (date0 != null && date05 != null) {
                        newDelay = java.time.Duration.between(date0, date05).toMillis();
                    }
                    if (date05 != null && date1 != null) {
                        inProgressDelay = java.time.Duration.between(date05, date1).toMillis();
                    }

                    Long total = null;
                    if (newDelay != null) {
                        sumNew += newDelay;
                        countNew += 1;
                    }
                    if (inProgressDelay != null) {
                        sumInProg += inProgressDelay;
                        countInProg += 1;
                    }
                    if (newDelay != null && inProgressDelay != null) {
                        total = newDelay + inProgressDelay;
                        sumTotal += total;
                        countTotal += 1;
                    }

                    String newLabel = fmt.apply(newDelay);
                    String inProgressLabel = fmt.apply(inProgressDelay);
                    String totalLabel = fmt.apply(total);

                    WorkTreatmentDTO wt = new WorkTreatmentDTO(pointDTO, newDelay, inProgressDelay, newLabel, inProgressLabel, total, totalLabel);
                    payload.add(wt);

                } catch (Exception ex) {
                    // skip problematic point but continue
                }
            }

            Long avgNew = countNew > 0 ? Math.round((double) sumNew / countNew) : null;
            Long avgInProg = countInProg > 0 ? Math.round((double) sumInProg / countInProg) : null;
            Long avgTotal = countTotal > 0 ? Math.round((double) sumTotal / countTotal) : null;

            String avgNewLabel = fmt.apply(avgNew);
            String avgInProgLabel = fmt.apply(avgInProg);
            String avgLabel = fmt.apply(avgTotal);

            // Return a map containing the list of WorkTreatmentDTO and the global averages
            java.util.Map<String, Object> out = new java.util.HashMap<>();
            out.put("workTreatments", payload);
            out.put("average0to05Ms", avgNew);
            out.put("average0to05Label", avgNewLabel);
            out.put("average05to1Ms", avgInProg);
            out.put("average05to1Label", avgInProgLabel);
            out.put("average0to1Ms", avgTotal);
            out.put("average0to1Label", avgLabel);

            return ResponseEntity.ok(new ApiResponse("success", out, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse("error", null, e.getMessage()));
        }
    }
}
