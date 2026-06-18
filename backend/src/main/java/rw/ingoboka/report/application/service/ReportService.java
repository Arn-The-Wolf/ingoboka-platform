package rw.ingoboka.report.application.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.ingoboka.report.api.dto.response.ClaimsBreakdownResponse;
import rw.ingoboka.report.api.dto.response.PolicyReportResponse;
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

    @Transactional(readOnly = true)
    public ClaimsBreakdownResponse getClaimsBreakdown(UUID organizationId) {
        Long resolvedToday = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*) FROM claims
                WHERE organization_id = ? AND resolved_at::date = CURRENT_DATE
                """,
                Long.class,
                organizationId);
        Double avgDays = jdbcTemplate.queryForObject(
                """
                SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (resolved_at - submitted_at)) / 86400), 0)
                FROM claims WHERE organization_id = ? AND resolved_at IS NOT NULL AND submitted_at IS NOT NULL
                """,
                Double.class,
                organizationId);
        List<ClaimsBreakdownResponse.StatusCount> byStatus = jdbcTemplate.query(
                """
                SELECT status, COUNT(*) FROM claims WHERE organization_id = ?
                GROUP BY status ORDER BY COUNT(*) DESC
                """,
                (rs, rowNum) -> ClaimsBreakdownResponse.StatusCount.builder()
                        .status(rs.getString("status"))
                        .count(rs.getLong("count"))
                        .build(),
                organizationId);

        return ClaimsBreakdownResponse.builder()
                .resolvedToday(resolvedToday != null ? resolvedToday : 0)
                .avgResolutionDays(avgDays != null ? Math.round(avgDays * 10.0) / 10.0 : 0)
                .claimsByStatus(byStatus)
                .build();
    }

    @Transactional(readOnly = true)
    public PolicyReportResponse getPolicyReport(UUID organizationId) {
        Long active = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM v_policy_summary WHERE insurer_name IN (SELECT name FROM organizations WHERE id = ?) AND policy_status = 'ACTIVE'",
                Long.class,
                organizationId);
        Long pending = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM policies WHERE organization_id = ? AND status = 'PENDING_ACTIVATION'",
                Long.class,
                organizationId);
        BigDecimal premiumDue = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(premium_amount),0) FROM policies WHERE organization_id = ? AND status = 'ACTIVE'",
                BigDecimal.class,
                organizationId);
        Long citizens = jdbcTemplate.queryForObject(
                "SELECT COUNT(DISTINCT citizen_profile_id) FROM policies WHERE organization_id = ?",
                Long.class,
                organizationId);

        return PolicyReportResponse.builder()
                .activePolicies(active != null ? active : 0)
                .pendingActivation(pending != null ? pending : 0)
                .totalPremiumDue(premiumDue != null ? premiumDue : BigDecimal.ZERO)
                .citizensEnrolled(citizens != null ? citizens : 0)
                .build();
    }
}
