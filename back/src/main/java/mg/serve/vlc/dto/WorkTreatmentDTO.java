package mg.serve.vlc.dto;

public class WorkTreatmentDTO {
    public PointDTO pointDTO;
    // delays in milliseconds (nullable)
    public Long newDelaytoInProgressDelay;
    public Long inProgressDelaytofinishedDelay;
    // friendly labels
    public String newDelaytoInProgressLabel;
    public String inProgressDelaytofinishedLabel;
    // total 0->1
    public Long totalDelayMs;
    public String totalDelayLabel;
    // global average (populated by controller)
    // average is returned by controller (not stored per DTO)

    public WorkTreatmentDTO() {}

    public WorkTreatmentDTO(PointDTO pointDTO, Long newDelaytoInProgressDelay, Long inProgressDelaytofinishedDelay, String newDelayLabel, String inProgressLabel, Long totalDelayMs, String totalDelayLabel) {
        this.pointDTO = pointDTO;
        this.newDelaytoInProgressDelay = newDelaytoInProgressDelay;
        this.inProgressDelaytofinishedDelay = inProgressDelaytofinishedDelay;
        this.newDelaytoInProgressLabel = newDelayLabel;
        this.inProgressDelaytofinishedLabel = inProgressLabel;
        this.totalDelayMs = totalDelayMs;
        this.totalDelayLabel = totalDelayLabel;
    }
}