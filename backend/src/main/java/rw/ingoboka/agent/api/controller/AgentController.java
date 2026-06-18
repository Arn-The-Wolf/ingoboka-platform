package rw.ingoboka.agent.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import rw.ingoboka.agent.api.dto.request.AssistedApplicationRequest;
import rw.ingoboka.enrollment.api.dto.response.ApplicationResponse;
import rw.ingoboka.enrollment.application.service.EnrollmentService;
import rw.ingoboka.identity.infrastructure.persistence.entity.UserEntity;
import rw.ingoboka.shared.domain.ApiResponse;
import rw.ingoboka.shared.domain.PageResponse;
import rw.ingoboka.shared.exception.BadRequestException;

@RestController
@RequestMapping("/api/v1/agent")
@RequiredArgsConstructor
@PreAuthorize("hasRole('AGENT')")
@Tag(name = "Agent", description = "Assisted enrollment for agents")
public class AgentController {

    private final EnrollmentService enrollmentService;

    @GetMapping("/applications")
    @Operation(summary = "List applications for agent organization")
    public ApiResponse<PageResponse<ApplicationResponse>> listApplications(
            @AuthenticationPrincipal UserEntity user,
            Pageable pageable) {
        UUID orgId = requireOrganization(user);
        return ApiResponse.ok(enrollmentService.listApplicationsForOrganization(orgId, pageable));
    }

    @PostMapping("/applications")
    @Operation(summary = "Create assisted enrollment application")
    public ApiResponse<ApplicationResponse> createAssistedApplication(
            @AuthenticationPrincipal UserEntity user,
            @Valid @RequestBody AssistedApplicationRequest request) {
        UUID orgId = requireOrganization(user);
        return ApiResponse.ok(enrollmentService.createAssistedApplication(
                orgId, request.getCitizenPhone(), request.getProductPlanId()));
    }

    private UUID requireOrganization(UserEntity user) {
        if (user.getOrganizationId() == null) {
            throw new BadRequestException("Agent must belong to an organization");
        }
        return user.getOrganizationId();
    }
}
