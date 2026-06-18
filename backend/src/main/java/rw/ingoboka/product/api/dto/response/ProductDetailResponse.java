package rw.ingoboka.product.api.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ProductDetailResponse {
    private UUID id;
    private String name;
    private String description;
    private String termsSummary;
    private List<ProductPlanResponse> plans;
}
