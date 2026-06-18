package rw.ingoboka.report.application.service;

import java.math.BigDecimal;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.ingoboka.report.api.dto.response.ReportOverviewResponse;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final JdbcTemplate jdbcTemplate;

    @Transactional(readOnly = true)
    public ReportOverviewResponse getOverview(UUID organizationId) {
        Long activePolicies = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM policies WHERE organization_id = ? AND status = 'ACTIVE'",
                Long.class,
                organizationId);
        Long pendingClaims = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM claims WHERE organization_id = ? AND status IN ('SUBMITTED','UNDER_REVIEW','ADDITIONAL_INFO_REQUIRED')",
                Long.class,
                organizationId);
        Long approvedClaims = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM claims WHERE organization_id = ? AND status IN ('APPROVED','PARTIALLY_APPROVED','PAID')",
                Long.class,
                organizationId);
        Long rejectedClaims = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM claims WHERE organization_id = ? AND status = 'REJECTED'",
                Long.class,
                organizationId);
        BigDecimal premiums = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(amount),0) FROM payments WHERE organization_id = ? AND status = 'COMPLETED'",
                BigDecimal.class,
                organizationId);
        Long citizens = jdbcTemplate.queryForObject(
                "SELECT COUNT(DISTINCT citizen_profile_id) FROM policies WHERE organization_id = ?",
                Long.class,
                organizationId);

        return ReportOverviewResponse.builder()
                .activePolicies(activePolicies != null ? activePolicies : 0)
                .pendingClaims(pendingClaims != null ? pendingClaims : 0)
                .approvedClaims(approvedClaims != null ? approvedClaims : 0)
                .rejectedClaims(rejectedClaims != null ? rejectedClaims : 0)
                .totalPremiumsCollected(premiums != null ? premiums : BigDecimal.ZERO)
                .enrolledCitizens(citizens != null ? citizens : 0)
                .build();
    }
}
