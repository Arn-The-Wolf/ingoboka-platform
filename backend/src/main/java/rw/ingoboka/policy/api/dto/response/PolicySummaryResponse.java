package rw.ingoboka.policy.api.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class PolicySummaryResponse {
    private UUID id;
    private String policyNumber;
    private String status;
    private String productName;
}
