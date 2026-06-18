package rw.ingoboka.customer.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import rw.ingoboka.customer.api.dto.request.KycReviewRequest;
import rw.ingoboka.customer.api.dto.response.CitizenProfileResponse;
import rw.ingoboka.customer.application.service.KycService;
import rw.ingoboka.identity.infrastructure.persistence.entity.UserEntity;
import rw.ingoboka.shared.domain.ApiResponse;

@RestController
@RequiredArgsConstructor
@Tag(name = "KYC", description = "Know-your-customer verification")
public class KycController {

    private final KycService kycService;

    @PostMapping("/api/v1/customer/kyc/submit")
    @PreAuthorize("hasRole('CITIZEN')")
    @Operation(summary = "Submit profile for KYC review")
    public ApiResponse<CitizenProfileResponse> submit(@AuthenticationPrincipal UserEntity user) {
        return ApiResponse.ok(kycService.submitForReview(user.getId()));
    }

    @PostMapping("/api/v1/admin/kyc/{profileId}/review")
    @PreAuthorize("hasAnyRole('PLATFORM_ADMIN', 'INSURER_ADMIN')")
    @Operation(summary = "Approve or reject citizen KYC")
    public ApiResponse<CitizenProfileResponse> review(
            @PathVariable UUID profileId,
            @Valid @RequestBody KycReviewRequest request) {
        return ApiResponse.ok(kycService.reviewKyc(profileId, request));
    }
}
