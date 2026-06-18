package rw.ingoboka.admin.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import rw.ingoboka.admin.api.dto.request.UpdateOrganizationSettingsRequest;
import rw.ingoboka.admin.api.dto.response.OrganizationSettingsResponse;
import rw.ingoboka.admin.application.service.InsurerSettingsService;
import rw.ingoboka.identity.infrastructure.persistence.entity.UserEntity;
import rw.ingoboka.shared.domain.ApiResponse;
import rw.ingoboka.shared.exception.BadRequestException;

@RestController
@RequestMapping("/api/v1/admin/organizations/me")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('INSURER_ADMIN', 'INSURER_PRODUCT_MANAGER')")
@Tag(name = "Organization Settings", description = "Insurer organization settings")
public class InsurerSettingsController {

    private final InsurerSettingsService insurerSettingsService;

    @GetMapping
    @Operation(summary = "Get current organization settings")
    public ApiResponse<OrganizationSettingsResponse> getSettings(@AuthenticationPrincipal UserEntity user) {
        return ApiResponse.ok(insurerSettingsService.getSettings(requireOrg(user)));
    }

    @PatchMapping
    @Operation(summary = "Update organization settings")
    public ApiResponse<OrganizationSettingsResponse> updateSettings(
            @AuthenticationPrincipal UserEntity user,
            @Valid @RequestBody UpdateOrganizationSettingsRequest request) {
        return ApiResponse.ok(insurerSettingsService.updateSettings(requireOrg(user), request));
    }

    private java.util.UUID requireOrg(UserEntity user) {
        if (user.getOrganizationId() == null) {
            throw new BadRequestException("Organization context is required");
        }
        return user.getOrganizationId();
    }
}
