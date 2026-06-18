package rw.ingoboka.enrollment.api.dto.response;

import java.math.BigDecimal;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ApplicationResponse {
    private UUID id;
    private String applicationNumber;
    private String status;
    private BigDecimal premiumAmount;
    private String currency;
}
