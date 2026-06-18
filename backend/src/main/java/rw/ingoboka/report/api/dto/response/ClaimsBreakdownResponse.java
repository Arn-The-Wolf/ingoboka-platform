package rw.ingoboka.report.api.dto.response;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ClaimsBreakdownResponse {
    private long resolvedToday;
    private double avgResolutionDays;
    private List<StatusCount> claimsByStatus;

    @Data
    @Builder
    public static class StatusCount {
        private String status;
        private long count;
    }
}
