package rw.ingoboka.customer.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class KycReviewRequest {

    @NotBlank
    private String status;

    private String rejectionReason;
}
