package mg.serve.vlc.dto;

public class PointInProgressDTO {
    public java.time.LocalDateTime date;
    public Double surface;
    public Double budget;
    public String point_state_label;
    public Double progress;
    public String point_type_label;

    public PointInProgressDTO() {}

    public PointInProgressDTO(java.time.LocalDateTime date, Double surface, Double budget, String point_state_label,Double progress,String point_type_label) {
        this.date = date;
        this.surface = surface;
        this.budget = budget;
        this.point_state_label = point_state_label;
        this.progress=progress*100;
        this.point_type_label=point_type_label;
    }
}