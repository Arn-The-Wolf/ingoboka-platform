package rw.ingoboka.partner.api.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RevenueLedgerResponse {
    private UUID id;
    private String entryType;
    private BigDecimal amount;
    private String currency;
    private String referenceType;
    private UUID referenceId;
    private String description;
    private Instant occurredAt;
}
