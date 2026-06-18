package rw.ingoboka.enrollment.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import rw.ingoboka.enrollment.api.dto.request.CreateApplicationRequest;
import rw.ingoboka.enrollment.api.dto.response.ApplicationResponse;
import rw.ingoboka.enrollment.application.service.EnrollmentService;
import rw.ingoboka.identity.infrastructure.persistence.entity.UserEntity;
import rw.ingoboka.shared.domain.ApiResponse;

@RestController
@RequestMapping("/api/v1/enrollments")
@RequiredArgsConstructor
@Tag(name = "Enrollments", description = "Alias routes for policy enrollment")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping
    @PreAuthorize("hasRole('CITIZEN')")
    @Operation(summary = "Create enrollment application (alias)")
    public ApiResponse<ApplicationResponse> createEnrollment(
            @AuthenticationPrincipal UserEntity user,
            @Valid @RequestBody CreateApplicationRequest request) {
        ApplicationResponse created = enrollmentService.createApplication(user.getId(), request);
        return ApiResponse.ok(enrollmentService.submitApplication(created.getId(), user.getId()));
    }
}
