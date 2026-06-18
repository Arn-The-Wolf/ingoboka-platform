package rw.ingoboka.admin.api.dto.response;

import java.util.Map;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrganizationSettingsResponse {
    private UUID organizationId;
    private String name;
    private String contactEmail;
    private String contactPhone;
    private Map<String, Object> settings;
}
