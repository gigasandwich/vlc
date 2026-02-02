package mg.serve.vlc.dto;

public class PointUpdateDTO {
    private Double surface;
    private Double budget;
    private Integer pointStateId;
    private Integer pointTypeId;

    public PointUpdateDTO() {}

    public PointUpdateDTO(Double surface, Double budget, Integer pointStateId, Integer pointTypeId) {
        this.surface = surface;
        this.budget = budget;
        this.pointStateId = pointStateId;
        this.pointTypeId = pointTypeId;
    }

    public Double getSurface() {
        return surface;
    }

    public void setSurface(Double surface) {
        this.surface = surface;
    }

    public Double getBudget() {
        return budget;
    }

    public void setBudget(Double budget) {
        this.budget = budget;
    }

    public Integer getPointStateId() {
        return pointStateId;
    }

    public void setPointStateId(Integer pointStateId) {
        this.pointStateId = pointStateId;
    }

    public Integer getPointTypeId() {
        return pointTypeId;
    }

    public void setPointTypeId(Integer pointTypeId) {
        this.pointTypeId = pointTypeId;
    }
}