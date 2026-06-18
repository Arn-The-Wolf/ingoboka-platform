package rw.ingoboka.admin.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import rw.ingoboka.admin.api.dto.response.OrganizationResponse;
import rw.ingoboka.admin.api.dto.response.PlatformOverviewResponse;
import rw.ingoboka.admin.application.service.AdminPlatformService;
import rw.ingoboka.shared.domain.ApiResponse;

@RestController
@RequestMapping("/api/v1/admin/platform")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PLATFORM_ADMIN')")
@Tag(name = "Platform Admin", description = "Platform-wide administration")
public class AdminPlatformController {

    private final AdminPlatformService adminPlatformService;

    @GetMapping("/overview")
    @Operation(summary = "Platform-wide metrics")
    public ApiResponse<PlatformOverviewResponse> overview() {
        return ApiResponse.ok(adminPlatformService.getPlatformOverview());
    }

    @GetMapping("/organizations")
    @Operation(summary = "List all organizations")
    public ApiResponse<List<OrganizationResponse>> listOrganizations() {
        return ApiResponse.ok(adminPlatformService.listOrganizations());
    }

    @GetMapping("/organizations/{id}")
    @Operation(summary = "Get organization detail")
    public ApiResponse<OrganizationResponse> getOrganization(@PathVariable UUID id) {
        return ApiResponse.ok(adminPlatformService.getOrganization(id));
    }
}
