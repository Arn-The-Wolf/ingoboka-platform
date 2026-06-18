package rw.ingoboka.partner.application.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.ingoboka.partner.api.dto.response.ContractPriceRuleResponse;
import rw.ingoboka.partner.api.dto.response.InvoiceResponse;
import rw.ingoboka.partner.api.dto.response.PartnerContractResponse;
import rw.ingoboka.partner.api.dto.response.RevenueLedgerResponse;
import rw.ingoboka.partner.infrastructure.persistence.entity.InvoiceEntity;
import rw.ingoboka.partner.infrastructure.persistence.entity.RevenueLedgerEntity;
import rw.ingoboka.partner.infrastructure.persistence.repository.ContractPriceRuleRepository;
import rw.ingoboka.partner.infrastructure.persistence.repository.InvoiceRepository;
import rw.ingoboka.partner.infrastructure.persistence.repository.PartnerContractRepository;
import rw.ingoboka.partner.infrastructure.persistence.repository.RevenueLedgerRepository;
import rw.ingoboka.shared.exception.NotFoundException;

@Service
@RequiredArgsConstructor
public class PartnerRevenueService {

    private static final BigDecimal PLATFORM_FEE_RATE = new BigDecimal("0.05");

    private final RevenueLedgerRepository ledgerRepository;
    private final PartnerContractRepository contractRepository;
    private final InvoiceRepository invoiceRepository;
    private final ContractPriceRuleRepository priceRuleRepository;

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

    @Transactional(readOnly = true)
    public List<InvoiceResponse> listInvoices(UUID organizationId) {
        return invoiceRepository.findByOrganizationIdOrderByCreatedAtDesc(organizationId).stream()
                .map(this::toInvoiceResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ContractPriceRuleResponse> listPriceRules(UUID contractId) {
        return priceRuleRepository.findByContractIdOrderByEffectiveFromDesc(contractId).stream()
                .map(r -> ContractPriceRuleResponse.builder()
                        .id(r.getId())
                        .contractId(r.getContractId())
                        .ruleType(r.getRuleType())
                        .rateValue(r.getRateValue())
                        .currency(r.getCurrency())
                        .effectiveFrom(r.getEffectiveFrom())
                        .effectiveTo(r.getEffectiveTo())
                        .build())
                .toList();
    }

    @Transactional
    public InvoiceResponse generateInvoice(UUID organizationId, LocalDate periodStart, LocalDate periodEnd) {
        BigDecimal total = ledgerRepository.findByOrganizationIdOrderByOccurredAtDesc(organizationId).stream()
                .filter(e -> !e.getOccurredAt().isBefore(periodStart.atStartOfDay(java.time.ZoneOffset.UTC).toInstant()))
                .filter(e -> !e.getOccurredAt().isAfter(periodEnd.plusDays(1).atStartOfDay(java.time.ZoneOffset.UTC).toInstant()))
                .map(RevenueLedgerEntity::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        InvoiceEntity invoice = new InvoiceEntity();
        invoice.setOrganizationId(organizationId);
        invoice.setInvoiceNumber("INV-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        invoice.setStatus("ISSUED");
        invoice.setTotalAmount(total);
        invoice.setCurrency("RWF");
        invoice.setPeriodStart(periodStart);
        invoice.setPeriodEnd(periodEnd);
        invoice.setIssuedAt(Instant.now());
        return toInvoiceResponse(invoiceRepository.save(invoice));
    }

    @Transactional
    public InvoiceResponse markInvoicePaid(UUID organizationId, UUID invoiceId) {
        InvoiceEntity invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new NotFoundException("Invoice", invoiceId));
        if (!invoice.getOrganizationId().equals(organizationId)) {
            throw new NotFoundException("Invoice", invoiceId);
        }
        invoice.setStatus("PAID");
        invoice.setPaidAt(Instant.now());
        return toInvoiceResponse(invoiceRepository.save(invoice));
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

    private InvoiceResponse toInvoiceResponse(InvoiceEntity invoice) {
        return InvoiceResponse.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .status(invoice.getStatus())
                .totalAmount(invoice.getTotalAmount())
                .currency(invoice.getCurrency())
                .periodStart(invoice.getPeriodStart())
                .periodEnd(invoice.getPeriodEnd())
                .build();
    }
}
