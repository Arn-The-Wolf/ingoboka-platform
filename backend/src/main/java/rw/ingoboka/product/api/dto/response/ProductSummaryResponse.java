package rw.ingoboka.product.api.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class ProductSummaryResponse {
    private UUID id;
    private String name;
    private String category;
    private String description;
    private BigDecimal startingPremium;
    private String currency;
}
