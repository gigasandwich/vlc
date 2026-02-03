package mg.serve.vlc.dto;

import java.time.LocalDateTime;

import lombok.*;
import java.util.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PointUpdateDTO {
    private Double surface;
    private Double budget;
    private Integer pointStateId;
    private Integer pointTypeId;
    private LocalDateTime updatedAt;
    private List<Integer> factoryIds;


    public PointUpdateDTO(Double surface, Double budget, Integer pointStateId, Integer pointTypeId, LocalDateTime updatedAt) {
        this.surface = surface;
        this.budget = budget;
        this.pointStateId = pointStateId;
        this.pointTypeId = pointTypeId;
        this.updatedAt = updatedAt;
    }
}