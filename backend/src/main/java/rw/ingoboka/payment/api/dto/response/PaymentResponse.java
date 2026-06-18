package rw.ingoboka.payment.api.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class PaymentResponse {
    private UUID id;
    private String paymentReference;
    private String providerReference;
    private String status;
    private BigDecimal amount;
    private String currency;
    private String instructions;
}
