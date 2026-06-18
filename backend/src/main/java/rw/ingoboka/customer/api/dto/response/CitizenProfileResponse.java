package rw.ingoboka.customer.api.dto.response;

import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CitizenProfileResponse {

    private UUID id;
    private UUID userId;
    private String nationalId;
    private String district;
    private String sector;
    private String occupation;
    private String kycStatus;
}
