package rw.ingoboka.partner.api.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PartnerContractResponse {
    private UUID id;
    private String contractNumber;
    private UUID partnerId;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
}
