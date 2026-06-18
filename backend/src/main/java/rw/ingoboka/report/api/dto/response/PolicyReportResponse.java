package rw.ingoboka.report.api.dto.response;

import java.math.BigDecimal;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PolicyReportResponse {
    private long activePolicies;
    private long pendingActivation;
    private BigDecimal totalPremiumDue;
    private long citizensEnrolled;
}
