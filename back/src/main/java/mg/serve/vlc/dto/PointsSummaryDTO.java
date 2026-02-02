package mg.serve.vlc.dto;

public class PointsSummaryDTO {
    private long nbPoints;
    private double totalSurface;
    private double avgProgress;
    private double totalBudget;

    public PointsSummaryDTO() {}

    public PointsSummaryDTO(long nbPoints, double totalSurface, double avgProgress, double totalBudget) {
        this.nbPoints = nbPoints;
        this.totalSurface = totalSurface;
        this.avgProgress = avgProgress*100;
        this.totalBudget = totalBudget;
    }

    public long getNbPoints() {
        return nbPoints;
    }

    public void setNbPoints(long nbPoints) {
        this.nbPoints = nbPoints;
    }

    public double getTotalSurface() {
        return totalSurface;
    }

    public void setTotalSurface(double totalSurface) {
        this.totalSurface = totalSurface;
    }

    public double getAvgProgress() {
        return avgProgress;
    }

    public void setAvgProgress(double avgProgress) {
        this.avgProgress = avgProgress;
    }

    public double getTotalBudget() {
        return totalBudget;
    }

    public void setTotalBudget(double totalBudget) {
        this.totalBudget = totalBudget;
    }
}
