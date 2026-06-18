package rw.ingoboka.customer.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import rw.ingoboka.customer.api.dto.request.CreateProfileRequest;
import rw.ingoboka.customer.api.dto.request.RecordConsentRequest;
import rw.ingoboka.customer.api.dto.request.UpdateProfileRequest;
import rw.ingoboka.customer.api.dto.response.CitizenProfileResponse;
import rw.ingoboka.customer.application.service.CustomerProfileService;
import rw.ingoboka.customer.infrastructure.persistence.entity.ConsentEntity;
import rw.ingoboka.identity.infrastructure.persistence.entity.UserEntity;
import rw.ingoboka.shared.domain.ApiResponse;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customer")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CITIZEN')")
@Tag(name = "Customer", description = "Citizen profile and consent management")
public class CustomerController {

    private final CustomerProfileService customerProfileService;

    @GetMapping("/profile")
    @Operation(summary = "Get citizen profile")
    public ApiResponse<CitizenProfileResponse> getProfile(@AuthenticationPrincipal UserEntity user) {
        return ApiResponse.ok(customerProfileService.getProfile(user.getId()));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update citizen profile")
    public ApiResponse<CitizenProfileResponse> updateProfile(
            @AuthenticationPrincipal UserEntity user,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ApiResponse.ok(customerProfileService.updateProfile(user.getId(), request));
    }

    @PostMapping("/profile")
    @Operation(summary = "Create citizen profile")
    public ApiResponse<CitizenProfileResponse> createProfile(
            @AuthenticationPrincipal UserEntity user,
            @Valid @RequestBody CreateProfileRequest request) {
        return ApiResponse.ok(customerProfileService.createProfile(user.getId(), request));
    }

    @PostMapping("/consent")
    @Operation(summary = "Record consent")
    public ApiResponse<Void> recordConsent(
            @AuthenticationPrincipal UserEntity user,
            @Valid @RequestBody RecordConsentRequest request) {
        customerProfileService.recordConsent(user.getId(), request);
        return ApiResponse.ok(null, "Consent recorded");
    }

    @GetMapping("/consents")
    @Operation(summary = "List consents")
    public ApiResponse<List<ConsentEntity>> getConsents(@AuthenticationPrincipal UserEntity user) {
        return ApiResponse.ok(customerProfileService.getConsents(user.getId()));
    }
}
