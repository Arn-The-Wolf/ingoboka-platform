package rw.ingoboka.admin.api.dto.response;

import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrganizationResponse {
    private UUID id;
    private String name;
    private String slug;
    private String organizationType;
    private String status;
    private String contactEmail;
}
