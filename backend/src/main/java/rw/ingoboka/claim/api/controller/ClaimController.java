package rw.ingoboka.claim.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import rw.ingoboka.claim.api.dto.request.AppealRequest;
import rw.ingoboka.claim.api.dto.request.ClaimDecisionRequest;
import rw.ingoboka.claim.api.dto.request.CreateClaimRequest;
import rw.ingoboka.claim.api.dto.request.UpdateClaimStatusRequest;
import rw.ingoboka.claim.api.dto.response.ClaimResponse;
import rw.ingoboka.claim.api.dto.response.ClaimStatusResponse;
import rw.ingoboka.claim.api.dto.response.ClaimSummaryResponse;
import rw.ingoboka.claim.application.service.ClaimService;
import rw.ingoboka.identity.infrastructure.persistence.entity.UserEntity;
import rw.ingoboka.shared.domain.ApiResponse;
import rw.ingoboka.shared.domain.PageResponse;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Claims", description = "Claims workflow")
public class ClaimController {

    private final ClaimService claimService;

    @PostMapping("/claims")
    @PreAuthorize("hasRole('CITIZEN')")
    @Operation(summary = "Create claim")
    public ApiResponse<ClaimResponse> createClaim(
            @AuthenticationPrincipal UserEntity user,
            @Valid @RequestBody CreateClaimRequest request) {
        return ApiResponse.ok(claimService.createClaim(null, user.getId(), request));
    }

    @PostMapping("/claims/{id}/submit")
    @PreAuthorize("hasRole('CITIZEN')")
    @Operation(summary = "Submit claim")
    public ApiResponse<ClaimResponse> submitClaim(
            @AuthenticationPrincipal UserEntity user,
            @PathVariable UUID id) {
        return ApiResponse.ok(claimService.submitClaim(id, user.getId()));
    }

    @GetMapping("/claims/{id}")
    @PreAuthorize("hasRole('CITIZEN')")
    @Operation(summary = "Get claim status")
    public ApiResponse<ClaimStatusResponse> getClaim(
            @AuthenticationPrincipal UserEntity user,
            @PathVariable UUID id) {
        return ApiResponse.ok(claimService.getClaimStatus(id, user.getId()));
    }

    @GetMapping("/claims")
    @PreAuthorize("hasRole('CITIZEN')")
    @Operation(summary = "List citizen claims")
    public ApiResponse<PageResponse<ClaimSummaryResponse>> listClaims(
            @AuthenticationPrincipal UserEntity user,
            Pageable pageable) {
        return ApiResponse.ok(claimService.listCitizenClaims(user.getId(), pageable));
    }

    @PatchMapping("/admin/claims/{id}/status")
    @PreAuthorize("hasAnyRole('INSURER_CLAIMS_OFFICER', 'INSURER_CLAIMS_SUPERVISOR')")
    @Operation(summary = "Update claim status")
    public ApiResponse<ClaimResponse> updateStatus(
            @AuthenticationPrincipal UserEntity user,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateClaimStatusRequest request) {
        return ApiResponse.ok(claimService.updateClaimStatus(id, user.getId(), request));
    }

    @PostMapping("/admin/claims/{id}/decision")
    @PreAuthorize("hasAnyRole('INSURER_CLAIMS_OFFICER', 'INSURER_CLAIMS_SUPERVISOR')")
    @Operation(summary = "Record claim decision")
    public ApiResponse<ClaimResponse> recordDecision(
            @AuthenticationPrincipal UserEntity user,
            @PathVariable UUID id,
            @Valid @RequestBody ClaimDecisionRequest request) {
        return ApiResponse.ok(claimService.recordDecision(id, user.getId(), request));
    }

    @PostMapping("/claims/{id}/appeals")
    @PreAuthorize("hasRole('CITIZEN')")
    @Operation(summary = "Submit appeal")
    public ApiResponse<ClaimResponse> submitAppeal(
            @AuthenticationPrincipal UserEntity user,
            @PathVariable UUID id,
            @Valid @RequestBody AppealRequest request) {
        return ApiResponse.ok(claimService.submitAppeal(id, user.getId(), request));
    }
}
