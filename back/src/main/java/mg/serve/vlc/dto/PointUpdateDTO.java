package mg.serve.vlc.dto;

public class PointUpdateDTO {
    private Double surface;
    private Double budget;
    private Integer pointStateId;
    private Integer pointTypeId;
    private java.util.List<Integer> factoryIds;

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

    public java.util.List<Integer> getFactoryIds() {
        return factoryIds;
    }

    public void setFactoryIds(java.util.List<Integer> factoryIds) {
        this.factoryIds = factoryIds;
    }
}