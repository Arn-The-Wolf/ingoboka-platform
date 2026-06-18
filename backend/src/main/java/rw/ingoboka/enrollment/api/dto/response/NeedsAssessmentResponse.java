package rw.ingoboka.enrollment.api.dto.response;

import java.util.List;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NeedsAssessmentResponse {
    private int score;
    private String affordabilityWarning;
    private List<UUID> recommendedProductIds;
    private String guidance;
}
