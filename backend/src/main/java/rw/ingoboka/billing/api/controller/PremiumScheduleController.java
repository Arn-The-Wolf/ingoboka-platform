package rw.ingoboka.billing.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import rw.ingoboka.billing.api.dto.response.PremiumScheduleResponse;
import rw.ingoboka.billing.application.service.PremiumScheduleService;
import rw.ingoboka.customer.infrastructure.persistence.entity.CitizenProfileEntity;
import rw.ingoboka.customer.infrastructure.persistence.repository.CitizenProfileRepository;
import rw.ingoboka.identity.infrastructure.persistence.entity.UserEntity;
import rw.ingoboka.shared.domain.ApiResponse;
import rw.ingoboka.shared.exception.NotFoundException;

@RestController
@RequestMapping("/api/v1/policies")
@RequiredArgsConstructor
@Tag(name = "Premium Schedules", description = "Policy premium billing schedules")
public class PremiumScheduleController {

    private final PremiumScheduleService premiumScheduleService;
    private final CitizenProfileRepository profileRepository;

    @GetMapping("/{policyId}/premium-schedules")
    @PreAuthorize("hasRole('CITIZEN')")
    @Operation(summary = "List premium schedule for a policy")
    public ApiResponse<List<PremiumScheduleResponse>> listSchedules(
            @AuthenticationPrincipal UserEntity user,
            @PathVariable UUID policyId) {
        CitizenProfileEntity profile = profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NotFoundException("Citizen profile", user.getId()));
        return ApiResponse.ok(premiumScheduleService.listForPolicy(policyId, profile.getId()));
    }
}
