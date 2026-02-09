package mg.serve.vlc.controller.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SyncStatistics {
    // Users statistics
    private int usersCreatedLocally; // from Firestore to local DB
    private int usersPushedToFirestore; // from local DB to Firestore
    private int usersUpdatedLocally; // Firestore data overwrote local
    private int usersUpdatedInFirestore; // local data overwrote Firestore

    // User historic statistics
    private int historicCreatedLocally; // from Firestore to local DB
    private int historicPushedToFirestore; // from local DB to Firestore
    private int historicUpdatedLocally; // Firestore data overwrote local
    private int historicUpdatedInFirestore; // local data overwrote Firestore

    // Points statistics
    private int pointsCreatedLocally; // from Firestore to local DB
    private int pointsPushedToFirestore; // from local DB to Firestore
    private int pointsUpdatedLocally; // Firestore data overwrote local
    private int pointsUpdatedInFirestore; // local data overwrote Firestore

    // Point historic statistics
    private int pointHistoricCreatedLocally; // from Firestore to local DB
    private int pointHistoricPushedToFirestore; // from local DB to Firestore
    private int pointHistoricUpdatedLocally; // Firestore data overwrote local
    private int pointHistoricUpdatedInFirestore; // local data overwrote Firestore

    // Dashboard statistics
    private int dashboardSnapshotsCreatedLocally; // created locally (if any)
    private int dashboardSnapshotsPushedToFirestore; // pushed to Firestore (if any)
    private int dashboardSnapshotsUpdatedLocally; // updated locally
    private int dashboardSnapshotsUpdatedInFirestore; // updated in Firestore

    // Error tracking
    private int totalErrors;
    private java.util.List<String> errorMessages = new java.util.ArrayList<>();

    public void addError(String error) {
        this.errorMessages.add(error);
        this.totalErrors++;
    }

    public String generateSummaryMessage() {
        StringBuilder sb = new StringBuilder();
        sb.append("Sync completed successfully!\n\n");

        // Users section
        if (usersCreatedLocally > 0 || usersPushedToFirestore > 0 || usersUpdatedLocally > 0 || usersUpdatedInFirestore > 0) {
            sb.append("Users:\n");
            if (usersCreatedLocally > 0) sb.append("  - ").append(usersCreatedLocally).append(" created locally (from Firestore)\n");
            if (usersPushedToFirestore > 0) sb.append("  - ").append(usersPushedToFirestore).append(" pushed to Firestore (from local)\n");
            if (usersUpdatedLocally > 0) sb.append("  - ").append(usersUpdatedLocally).append(" updated locally (from Firestore)\n");
            if (usersUpdatedInFirestore > 0) sb.append("  - ").append(usersUpdatedInFirestore).append(" updated in Firestore (from local)\n");
        }

        // User historic section
        if (historicCreatedLocally > 0 || historicPushedToFirestore > 0 || historicUpdatedLocally > 0 || historicUpdatedInFirestore > 0) {
            sb.append("\nUser History:\n");
            if (historicCreatedLocally > 0) sb.append("  - ").append(historicCreatedLocally).append(" created locally (from Firestore)\n");
            if (historicPushedToFirestore > 0) sb.append("  - ").append(historicPushedToFirestore).append(" pushed to Firestore (from local)\n");
            if (historicUpdatedLocally > 0) sb.append("  - ").append(historicUpdatedLocally).append(" updated locally (from Firestore)\n");
            if (historicUpdatedInFirestore > 0) sb.append("  - ").append(historicUpdatedInFirestore).append(" updated in Firestore (from local)\n");
        }

        // Points section
        if (pointsCreatedLocally > 0 || pointsPushedToFirestore > 0 || pointsUpdatedLocally > 0 || pointsUpdatedInFirestore > 0) {
            sb.append("\nPoints:\n");
            if (pointsCreatedLocally > 0) sb.append("  - ").append(pointsCreatedLocally).append(" created locally (from Firestore)\n");
            if (pointsPushedToFirestore > 0) sb.append("  - ").append(pointsPushedToFirestore).append(" pushed to Firestore (from local)\n");
            if (pointsUpdatedLocally > 0) sb.append("  - ").append(pointsUpdatedLocally).append(" updated locally (from Firestore)\n");
            if (pointsUpdatedInFirestore > 0) sb.append("  - ").append(pointsUpdatedInFirestore).append(" updated in Firestore (from local)\n");
        }

        // Point historic section
        if (pointHistoricCreatedLocally > 0 || pointHistoricPushedToFirestore > 0 || pointHistoricUpdatedLocally > 0 || pointHistoricUpdatedInFirestore > 0) {
            sb.append("\nPoint History:\n");
            if (pointHistoricCreatedLocally > 0) sb.append("  - ").append(pointHistoricCreatedLocally).append(" created locally (from Firestore)\n");
            if (pointHistoricPushedToFirestore > 0) sb.append("  - ").append(pointHistoricPushedToFirestore).append(" pushed to Firestore (from local)\n");
            if (pointHistoricUpdatedLocally > 0) sb.append("  - ").append(pointHistoricUpdatedLocally).append(" updated locally (from Firestore)\n");
            if (pointHistoricUpdatedInFirestore > 0) sb.append("  - ").append(pointHistoricUpdatedInFirestore).append(" updated in Firestore (from local)\n");
        }

        // Dashboard section
        if (dashboardSnapshotsCreatedLocally > 0 || dashboardSnapshotsPushedToFirestore > 0 || dashboardSnapshotsUpdatedLocally > 0 || dashboardSnapshotsUpdatedInFirestore > 0) {
            sb.append("\nDashboard:\n");
            if (dashboardSnapshotsCreatedLocally > 0) sb.append("  - ").append(dashboardSnapshotsCreatedLocally).append(" created locally\n");
            if (dashboardSnapshotsPushedToFirestore > 0) sb.append("  - ").append(dashboardSnapshotsPushedToFirestore).append(" pushed to Firestore\n");
            if (dashboardSnapshotsUpdatedLocally > 0) sb.append("  - ").append(dashboardSnapshotsUpdatedLocally).append(" updated locally\n");
            if (dashboardSnapshotsUpdatedInFirestore > 0) sb.append("  - ").append(dashboardSnapshotsUpdatedInFirestore).append(" updated in Firestore\n");
        }

        if (totalErrors > 0) {
            sb.append("\nErrors: ").append(totalErrors).append("\n");
            for (String error : errorMessages) {
                sb.append("  - ").append(error).append("\n");
            }
        }

        return sb.toString();
    }
}