package rw.ingoboka.partner.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import rw.ingoboka.identity.infrastructure.persistence.entity.UserEntity;
import rw.ingoboka.partner.api.dto.response.ContractPriceRuleResponse;
import rw.ingoboka.partner.api.dto.response.InvoiceResponse;
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
        return ApiResponse.ok(partnerRevenueService.listContracts(requireOrganization(user)));
    }

    @GetMapping("/contracts/{contractId}/price-rules")
    @Operation(summary = "List contract price rules")
    public ApiResponse<List<ContractPriceRuleResponse>> listPriceRules(@PathVariable UUID contractId) {
        return ApiResponse.ok(partnerRevenueService.listPriceRules(contractId));
    }

    @GetMapping("/revenue/ledger")
    @Operation(summary = "List revenue ledger entries")
    public ApiResponse<List<RevenueLedgerResponse>> listLedger(@AuthenticationPrincipal UserEntity user) {
        return ApiResponse.ok(partnerRevenueService.listLedger(requireOrganization(user)));
    }

    @GetMapping("/invoices")
    @Operation(summary = "List partner invoices")
    public ApiResponse<List<InvoiceResponse>> listInvoices(@AuthenticationPrincipal UserEntity user) {
        return ApiResponse.ok(partnerRevenueService.listInvoices(requireOrganization(user)));
    }

    @PostMapping("/invoices/generate")
    @Operation(summary = "Generate invoice for period")
    public ApiResponse<InvoiceResponse> generateInvoice(
            @AuthenticationPrincipal UserEntity user,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodStart,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodEnd) {
        return ApiResponse.ok(partnerRevenueService.generateInvoice(requireOrganization(user), periodStart, periodEnd));
    }

    @PostMapping("/invoices/{id}/pay")
    @Operation(summary = "Mark invoice as paid")
    public ApiResponse<InvoiceResponse> payInvoice(
            @AuthenticationPrincipal UserEntity user,
            @PathVariable UUID id) {
        return ApiResponse.ok(partnerRevenueService.markInvoicePaid(requireOrganization(user), id));
    }

    private UUID requireOrganization(UserEntity user) {
        if (user.getOrganizationId() == null) {
            throw new BadRequestException("Organization context is required");
        }
        return user.getOrganizationId();
    }
}
