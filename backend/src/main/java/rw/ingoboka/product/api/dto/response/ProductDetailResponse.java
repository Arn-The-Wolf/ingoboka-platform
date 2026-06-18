package rw.ingoboka.product.api.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductDetailResponse {

    private UUID id;
    private String code;
    private String name;
    private String category;
    private String description;
    private String termsSummary;
    private String currency;
    private List<ProductPlanResponse> plans;
    private List<BenefitResponse> benefits;
    private List<ExclusionResponse> exclusions;
    private List<RequiredDocumentResponse> requiredDocuments;

    @Data
    @Builder
    public static class BenefitResponse {
        private UUID id;
        private String benefitCode;
        private String name;
        private String description;
        private BigDecimal coverageLimit;
    }

    @Data
    @Builder
    public static class ExclusionResponse {
        private UUID id;
        private String exclusionCode;
        private String name;
        private String description;
    }

    @Data
    @Builder
    public static class RequiredDocumentResponse {
        private UUID id;
        private String documentCode;
        private String name;
        private String description;
        private boolean mandatory;
    }
}
