package rw.ingoboka.enrollment.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class NeedsAssessmentRequest {

    @NotBlank
    private String occupation;

    private String incomeRange;
    private int dependents;
    private String primaryRisk;
}
