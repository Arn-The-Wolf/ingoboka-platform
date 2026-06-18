package rw.ingoboka.admin.api.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PlatformOverviewResponse {
    private long organizations;
    private long activeUsers;
    private long activePolicies;
    private long openClaims;
    private long totalApplications;
}
