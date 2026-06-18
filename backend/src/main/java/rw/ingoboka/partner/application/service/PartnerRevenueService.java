package rw.ingoboka.partner.application.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.ingoboka.partner.api.dto.response.PartnerContractResponse;
import rw.ingoboka.partner.api.dto.response.RevenueLedgerResponse;
import rw.ingoboka.partner.infrastructure.persistence.entity.RevenueLedgerEntity;
import rw.ingoboka.partner.infrastructure.persistence.repository.PartnerContractRepository;
import rw.ingoboka.partner.infrastructure.persistence.repository.RevenueLedgerRepository;

@Service
@RequiredArgsConstructor
public class PartnerRevenueService {

    private static final BigDecimal PLATFORM_FEE_RATE = new BigDecimal("0.05");

    private final RevenueLedgerRepository ledgerRepository;
    private final PartnerContractRepository contractRepository;

    @Transactional(readOnly = true)
    public List<RevenueLedgerResponse> listLedger(UUID organizationId) {
        return ledgerRepository.findByOrganizationIdOrderByOccurredAtDesc(organizationId).stream()
                .map(this::toLedgerResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PartnerContractResponse> listContracts(UUID organizationId) {
        return contractRepository.findByOrganizationIdOrderByCreatedAtDesc(organizationId).stream()
                .map(c -> PartnerContractResponse.builder()
                        .id(c.getId())
                        .contractNumber(c.getContractNumber())
                        .partnerId(c.getPartnerId())
                        .status(c.getStatus())
                        .startDate(c.getStartDate())
                        .endDate(c.getEndDate())
                        .build())
                .toList();
    }

    @Transactional
    public void recordPaymentCommission(UUID organizationId, UUID paymentId, BigDecimal premiumAmount, String currency) {
        BigDecimal fee = premiumAmount.multiply(PLATFORM_FEE_RATE);
        RevenueLedgerEntity entry = new RevenueLedgerEntity();
        entry.setOrganizationId(organizationId);
        entry.setEntryType("CREDIT");
        entry.setAmount(fee);
        entry.setCurrency(currency);
        entry.setReferenceType("PAYMENT");
        entry.setReferenceId(paymentId);
        entry.setDescription("Platform service fee on premium payment");
        entry.setOccurredAt(Instant.now());
        ledgerRepository.save(entry);
    }

    private RevenueLedgerResponse toLedgerResponse(RevenueLedgerEntity entity) {
        return RevenueLedgerResponse.builder()
                .id(entity.getId())
                .entryType(entity.getEntryType())
                .amount(entity.getAmount())
                .currency(entity.getCurrency())
                .referenceType(entity.getReferenceType())
                .referenceId(entity.getReferenceId())
                .description(entity.getDescription())
                .occurredAt(entity.getOccurredAt())
                .build();
    }
}
