package rw.ingoboka.policy.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import rw.ingoboka.identity.infrastructure.persistence.entity.UserEntity;
import rw.ingoboka.policy.api.dto.response.PolicyCardResponse;
import rw.ingoboka.policy.api.dto.response.PolicyDetailResponse;
import rw.ingoboka.policy.api.dto.response.PolicySummaryResponse;
import rw.ingoboka.policy.api.dto.response.PublicVerificationResponse;
import rw.ingoboka.policy.application.service.PolicyService;
import rw.ingoboka.policy.application.service.PolicyVerificationService;
import rw.ingoboka.shared.domain.ApiResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Policies", description = "Policy wallet and verification")
public class PolicyController {

    private final PolicyService policyService;
    private final PolicyVerificationService verificationService;

    @GetMapping("/api/v1/policies")
    @PreAuthorize("hasRole('CITIZEN')")
    @Operation(summary = "List citizen policies")
    public ApiResponse<List<PolicySummaryResponse>> listPolicies(@AuthenticationPrincipal UserEntity user) {
        return ApiResponse.ok(policyService.listCitizenPolicies(user.getId()));
    }

    @GetMapping("/api/v1/policies/{id}")
    @PreAuthorize("hasRole('CITIZEN')")
    @Operation(summary = "Get policy detail")
    public ApiResponse<PolicyDetailResponse> getPolicy(
            @AuthenticationPrincipal UserEntity user,
            @PathVariable UUID id) {
        return ApiResponse.ok(policyService.getPolicyDetail(id, user.getId()));
    }

    @GetMapping("/api/v1/policies/{id}/card")
    @PreAuthorize("hasRole('CITIZEN')")
    @Operation(summary = "Get policy card data")
    public ApiResponse<PolicyCardResponse> getPolicyCard(
            @AuthenticationPrincipal UserEntity user,
            @PathVariable UUID id) {
        return ApiResponse.ok(policyService.getPolicyCard(id, user.getId()));
    }

    @GetMapping("/api/v1/verify/{token}")
    @Operation(summary = "Public QR policy verification")
    public ApiResponse<PublicVerificationResponse> verify(@PathVariable String token) {
        return ApiResponse.ok(verificationService.verify(token));
    }
}
