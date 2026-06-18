package rw.ingoboka.product.api.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
public class CreateProductRequest {

    @NotBlank
    private String code;

    @NotBlank
    private String name;

    @NotBlank
    private String category;

    private String description;

    private String termsSummary;

    @NotNull
    private LocalDate effectiveFrom = LocalDate.now();

    @Valid
    private List<PlanRequest> plans = new ArrayList<>();

    @Valid
    private List<BenefitRequest> benefits = new ArrayList<>();

    @Valid
    private List<ExclusionRequest> exclusions = new ArrayList<>();

    @Valid
    private List<DocumentRequest> requiredDocuments = new ArrayList<>();

    @Data
    public static class PlanRequest {
        @NotBlank
        private String code;
        @NotBlank
        private String name;
        @NotBlank
        private String billingFrequency;
        @NotNull
        private BigDecimal premiumAmount;
        private BigDecimal sumAssured;
        private boolean isDefault;
    }

    @Data
    public static class BenefitRequest {
        @NotBlank
        private String benefitCode;
        @NotBlank
        private String name;
        private String description;
        private BigDecimal coverageLimit;
        private int sortOrder;
    }

    @Data
    public static class ExclusionRequest {
        @NotBlank
        private String exclusionCode;
        @NotBlank
        private String name;
        private String description;
        private int sortOrder;
    }

    @Data
    public static class DocumentRequest {
        @NotBlank
        private String documentCode;
        @NotBlank
        private String name;
        private String description;
        private boolean mandatory = true;
        private int sortOrder;
    }
}
