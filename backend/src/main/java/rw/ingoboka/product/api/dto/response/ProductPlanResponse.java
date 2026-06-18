package rw.ingoboka.product.api.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class ProductPlanResponse {
    private UUID id;
    private String code;
    private String name;
    private String billingFrequency;
    private BigDecimal premiumAmount;
}
