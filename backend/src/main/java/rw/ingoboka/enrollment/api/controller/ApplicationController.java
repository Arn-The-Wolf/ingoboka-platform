package rw.ingoboka.enrollment.api.controller;

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
import rw.ingoboka.enrollment.api.dto.request.CreateApplicationRequest;
import rw.ingoboka.enrollment.api.dto.request.NeedsAssessmentRequest;
import rw.ingoboka.enrollment.api.dto.request.QuoteRequest;
import rw.ingoboka.enrollment.api.dto.response.ApplicationResponse;
import rw.ingoboka.enrollment.api.dto.response.NeedsAssessmentResponse;
import rw.ingoboka.enrollment.api.dto.response.QuoteResponse;
import rw.ingoboka.enrollment.application.service.EnrollmentService;
import rw.ingoboka.identity.infrastructure.persistence.entity.UserEntity;
import rw.ingoboka.shared.domain.ApiResponse;

@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
@Tag(name = "Enrollment", description = "Quotation, needs assessment, and policy applications")
public class ApplicationController {

    private final EnrollmentService enrollmentService;

    @PostMapping("/needs-assessment")
    @PreAuthorize("hasRole('CITIZEN')")
    @Operation(summary = "Run needs and affordability assessment")
    public ApiResponse<NeedsAssessmentResponse> needsAssessment(
            @AuthenticationPrincipal UserEntity user,
            @Valid @RequestBody NeedsAssessmentRequest request) {
        return ApiResponse.ok(enrollmentService.assessNeeds(request));
    }

    @PostMapping("/quote")
    @PreAuthorize("hasRole('CITIZEN')")
    @Operation(summary = "Generate premium quote for a product plan")
    public ApiResponse<QuoteResponse> quote(
            @AuthenticationPrincipal UserEntity user,
            @Valid @RequestBody QuoteRequest request) {
        return ApiResponse.ok(enrollmentService.generateQuote(request));
    }

    @PostMapping
    @PreAuthorize("hasRole('CITIZEN')")
    @Operation(summary = "Create policy application")
    public ApiResponse<ApplicationResponse> createApplication(
            @AuthenticationPrincipal UserEntity user,
            @Valid @RequestBody CreateApplicationRequest request) {
        return ApiResponse.ok(enrollmentService.createApplication(user.getId(), request));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('CITIZEN')")
    @Operation(summary = "Submit application for review")
    public ApiResponse<ApplicationResponse> submitApplication(
            @AuthenticationPrincipal UserEntity user,
            @PathVariable UUID id) {
        return ApiResponse.ok(enrollmentService.submitApplication(id, user.getId()));
    }
}
