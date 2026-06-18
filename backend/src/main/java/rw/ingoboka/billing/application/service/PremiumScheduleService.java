package rw.ingoboka.billing.application.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.ingoboka.billing.api.dto.response.PremiumScheduleResponse;
import rw.ingoboka.billing.infrastructure.persistence.entity.PremiumScheduleEntity;
import rw.ingoboka.billing.infrastructure.persistence.repository.PremiumScheduleRepository;
import rw.ingoboka.policy.infrastructure.persistence.entity.PolicyEntity;
import rw.ingoboka.policy.infrastructure.persistence.repository.PolicyRepository;
import rw.ingoboka.shared.exception.NotFoundException;

@Service
@RequiredArgsConstructor
public class PremiumScheduleService {

    private final PremiumScheduleRepository scheduleRepository;
    private final PolicyRepository policyRepository;

    @Transactional(readOnly = true)
    public List<PremiumScheduleResponse> listForPolicy(UUID policyId, UUID citizenProfileId) {
        PolicyEntity policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new NotFoundException("Policy", policyId));
        if (!policy.getCitizenProfileId().equals(citizenProfileId)) {
            throw new NotFoundException("Policy", policyId);
        }
        return scheduleRepository.findByPolicyIdOrderByInstallmentNumberAsc(policyId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void createInitialSchedule(PolicyEntity policy) {
        PremiumScheduleEntity schedule = new PremiumScheduleEntity();
        schedule.setPolicyId(policy.getId());
        schedule.setInstallmentNumber(1);
        schedule.setDueDate(policy.getNextBillingDate() != null ? policy.getNextBillingDate() : LocalDate.now());
        schedule.setAmount(policy.getPremiumAmount());
        schedule.setCurrency(policy.getCurrency());
        schedule.setStatus("PENDING");
        scheduleRepository.save(schedule);
    }

    @Transactional
    public void markPaid(UUID policyId, int installmentNumber) {
        scheduleRepository.findByPolicyIdOrderByInstallmentNumberAsc(policyId).stream()
                .filter(s -> s.getInstallmentNumber().equals(installmentNumber))
                .findFirst()
                .ifPresent(schedule -> {
                    schedule.setStatus("PAID");
                    schedule.setPaidAt(LocalDateTime.now());
                    scheduleRepository.save(schedule);
                });
    }

    private PremiumScheduleResponse toResponse(PremiumScheduleEntity entity) {
        return PremiumScheduleResponse.builder()
                .id(entity.getId())
                .installmentNumber(entity.getInstallmentNumber())
                .dueDate(entity.getDueDate())
                .amount(entity.getAmount())
                .currency(entity.getCurrency())
                .status(entity.getStatus())
                .paidAt(entity.getPaidAt())
                .build();
    }
}
