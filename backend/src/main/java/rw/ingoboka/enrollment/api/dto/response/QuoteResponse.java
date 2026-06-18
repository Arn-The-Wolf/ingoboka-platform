package rw.ingoboka.enrollment.api.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QuoteResponse {
    private UUID productPlanId;
    private UUID productId;
    private String productName;
    private String planName;
    private String billingFrequency;
    private BigDecimal premiumAmount;
    private String currency;
    private String affordabilityWarning;
    private List<String> recommendedBenefits;
}
