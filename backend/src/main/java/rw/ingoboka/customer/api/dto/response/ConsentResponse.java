package rw.ingoboka.customer.api.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ConsentResponse {

    private UUID id;
    private String consentType;
    private String consentVersion;
    private boolean granted;
    private LocalDateTime grantedAt;
    private LocalDateTime revokedAt;
}
