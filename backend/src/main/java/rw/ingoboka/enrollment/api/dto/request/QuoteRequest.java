package rw.ingoboka.enrollment.api.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import lombok.Data;

@Data
public class QuoteRequest {

    @NotNull
    private UUID productPlanId;

    private NeedsAssessmentRequest needsAssessment;
}
