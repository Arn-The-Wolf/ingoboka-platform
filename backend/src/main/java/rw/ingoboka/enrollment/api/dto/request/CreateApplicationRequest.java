package rw.ingoboka.enrollment.api.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Data;

@Data
public class CreateApplicationRequest {

    @NotNull
    private UUID productPlanId;

    @Valid
    private List<BeneficiaryRequest> beneficiaries = new ArrayList<>();

    private NeedsAssessmentRequest needsAssessment;

    @Data
    public static class BeneficiaryRequest {
        private String firstName;
        private String lastName;
        private String relationship;
        private java.math.BigDecimal allocationPercent;
    }
}
