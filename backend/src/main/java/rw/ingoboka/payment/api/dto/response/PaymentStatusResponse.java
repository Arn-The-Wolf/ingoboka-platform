package rw.ingoboka.payment.api.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class PaymentStatusResponse {
    private UUID id;
    private String status;
    private String paymentReference;
}
