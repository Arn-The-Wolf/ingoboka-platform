package rw.ingoboka.partner.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import rw.ingoboka.identity.infrastructure.persistence.entity.UserEntity;
import rw.ingoboka.partner.api.dto.response.PartnerContractResponse;
import rw.ingoboka.partner.api.dto.response.RevenueLedgerResponse;
import rw.ingoboka.partner.application.service.PartnerRevenueService;
import rw.ingoboka.shared.domain.ApiResponse;
import rw.ingoboka.shared.exception.BadRequestException;

@RestController
@RequestMapping("/api/v1/admin/partner")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('PLATFORM_ADMIN', 'INSURER_ADMIN')")
@Tag(name = "Partner Revenue", description = "Partner contracts and revenue ledger")
public class PartnerRevenueController {

    private final PartnerRevenueService partnerRevenueService;

    @GetMapping("/contracts")
    @Operation(summary = "List partner contracts for organization")
    public ApiResponse<List<PartnerContractResponse>> listContracts(@AuthenticationPrincipal UserEntity user) {
        UUID orgId = requireOrganization(user);
        return ApiResponse.ok(partnerRevenueService.listContracts(orgId));
    }

    @GetMapping("/revenue/ledger")
    @Operation(summary = "List revenue ledger entries")
    public ApiResponse<List<RevenueLedgerResponse>> listLedger(@AuthenticationPrincipal UserEntity user) {
        UUID orgId = requireOrganization(user);
        return ApiResponse.ok(partnerRevenueService.listLedger(orgId));
    }

    private UUID requireOrganization(UserEntity user) {
        if (user.getOrganizationId() == null) {
            throw new BadRequestException("Organization context is required");
        }
        return user.getOrganizationId();
    }
}
