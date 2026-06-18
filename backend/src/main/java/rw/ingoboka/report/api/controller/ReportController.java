package rw.ingoboka.report.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import rw.ingoboka.identity.infrastructure.persistence.entity.UserEntity;
import rw.ingoboka.report.api.dto.response.ClaimsBreakdownResponse;
import rw.ingoboka.report.api.dto.response.PolicyReportResponse;
import rw.ingoboka.report.api.dto.response.ReportOverviewResponse;
import rw.ingoboka.report.application.service.ReportService;
import rw.ingoboka.shared.domain.ApiResponse;
import rw.ingoboka.shared.exception.BadRequestException;

@RestController
@RequestMapping("/api/v1/admin/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Insurer operational reports")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/overview")
    @PreAuthorize("hasAnyRole('INSURER_ADMIN', 'INSURER_CLAIMS_OFFICER', 'INSURER_CLAIMS_SUPERVISOR', 'PLATFORM_ADMIN')")
    @Operation(summary = "Tenant-scoped operations overview")
    public ApiResponse<ReportOverviewResponse> overview(@AuthenticationPrincipal UserEntity user) {
        if (user.getOrganizationId() == null) {
            throw new BadRequestException("Organization context is required for reports");
        }
        return ApiResponse.ok(reportService.getOverview(user.getOrganizationId()));
    }

    @GetMapping("/claims-breakdown")
    @PreAuthorize("hasAnyRole('INSURER_ADMIN', 'INSURER_CLAIMS_OFFICER', 'INSURER_CLAIMS_SUPERVISOR', 'PLATFORM_ADMIN')")
    @Operation(summary = "Claims breakdown with resolution metrics")
    public ApiResponse<ClaimsBreakdownResponse> claimsBreakdown(@AuthenticationPrincipal UserEntity user) {
        if (user.getOrganizationId() == null) {
            throw new BadRequestException("Organization context is required for reports");
        }
        return ApiResponse.ok(reportService.getClaimsBreakdown(user.getOrganizationId()));
    }

    @GetMapping("/policies")
    @PreAuthorize("hasAnyRole('INSURER_ADMIN', 'INSURER_CLAIMS_OFFICER', 'INSURER_PRODUCT_MANAGER', 'PLATFORM_ADMIN')")
    @Operation(summary = "Policy portfolio report")
    public ApiResponse<PolicyReportResponse> policies(@AuthenticationPrincipal UserEntity user) {
        if (user.getOrganizationId() == null) {
            throw new BadRequestException("Organization context is required for reports");
        }
        return ApiResponse.ok(reportService.getPolicyReport(user.getOrganizationId()));
    }
}
