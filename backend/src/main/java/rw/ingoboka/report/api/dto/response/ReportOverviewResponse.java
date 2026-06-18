package rw.ingoboka.report.api.dto.response;

import java.math.BigDecimal;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReportOverviewResponse {
    private long activePolicies;
    private long pendingClaims;
    private long approvedClaims;
    private long rejectedClaims;
    private BigDecimal totalPremiumsCollected;
    private long enrolledCitizens;
}
