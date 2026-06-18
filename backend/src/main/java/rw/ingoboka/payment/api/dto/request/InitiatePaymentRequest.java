package rw.ingoboka.payment.api.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import lombok.Data;

@Data
public class InitiatePaymentRequest {

    private UUID policyId;

    private UUID applicationId;
}
