package rw.ingoboka.partner.api.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InvoiceResponse {
    private UUID id;
    private String invoiceNumber;
    private String status;
    private BigDecimal totalAmount;
    private String currency;
    private LocalDate periodStart;
    private LocalDate periodEnd;
}
