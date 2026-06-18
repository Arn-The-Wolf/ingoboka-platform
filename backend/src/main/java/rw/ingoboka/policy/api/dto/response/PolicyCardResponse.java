package rw.ingoboka.policy.api.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class PolicyCardResponse {
    private String policyNumber;
    private String insurerName;
    private String productName;
    private String status;
    private LocalDate validUntil;
    private String verificationToken;
}
