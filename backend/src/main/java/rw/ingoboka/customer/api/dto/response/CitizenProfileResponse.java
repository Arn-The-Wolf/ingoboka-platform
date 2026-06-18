package rw.ingoboka.customer.api.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class CitizenProfileResponse {

    private UUID id;
    private UUID userId;
    private String district;
    private String occupation;
    private String kycStatus;
}
