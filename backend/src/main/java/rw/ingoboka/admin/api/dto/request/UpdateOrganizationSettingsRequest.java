package rw.ingoboka.admin.api.dto.request;

import java.util.Map;
import lombok.Data;

@Data
public class UpdateOrganizationSettingsRequest {
    private String contactEmail;
    private String contactPhone;
    private Map<String, Object> settings;
}
