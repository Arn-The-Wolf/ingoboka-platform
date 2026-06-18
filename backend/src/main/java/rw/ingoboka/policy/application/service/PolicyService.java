package rw.ingoboka.policy.application.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.ingoboka.customer.infrastructure.persistence.entity.CitizenProfileEntity;
import rw.ingoboka.customer.infrastructure.persistence.repository.CitizenProfileRepository;
import rw.ingoboka.policy.api.dto.response.PolicyCardResponse;
import rw.ingoboka.policy.api.dto.response.PolicyDetailResponse;
import rw.ingoboka.policy.api.dto.response.PolicySummaryResponse;
import rw.ingoboka.policy.infrastructure.persistence.PolicyEventEntity;
import rw.ingoboka.policy.infrastructure.persistence.PolicyEventRepository;
import rw.ingoboka.policy.infrastructure.persistence.entity.PolicyEntity;
import rw.ingoboka.policy.infrastructure.persistence.entity.PolicyVerificationTokenEntity;
import rw.ingoboka.policy.infrastructure.persistence.repository.PolicyRepository;
import rw.ingoboka.policy.infrastructure.persistence.repository.PolicyVerificationTokenRepository;
import rw.ingoboka.product.infrastructure.persistence.entity.InsuranceProductEntity;
import rw.ingoboka.product.infrastructure.persistence.entity.ProductPlanEntity;
import rw.ingoboka.product.infrastructure.persistence.entity.ProductVersionEntity;
import rw.ingoboka.product.infrastructure.persistence.repository.InsuranceProductRepository;
import rw.ingoboka.product.infrastructure.persistence.repository.ProductPlanRepository;
import rw.ingoboka.product.infrastructure.persistence.repository.ProductVersionRepository;
import rw.ingoboka.shared.exception.BadRequestException;
import rw.ingoboka.shared.exception.NotFoundException;
import rw.ingoboka.shared.infrastructure.persistence.entity.OrganizationEntity;
import rw.ingoboka.shared.infrastructure.persistence.repository.OrganizationRepository;

@Service
@RequiredArgsConstructor
public class PolicyService {

    private static final int TOKEN_TTL_DAYS = 365;

    private final PolicyRepository policyRepository;
    private final PolicyEventRepository policyEventRepository;
    private final PolicyVerificationTokenRepository verificationTokenRepository;
    private final CitizenProfileRepository profileRepository;
    private final ProductPlanRepository planRepository;
    private final ProductVersionRepository versionRepository;
    private final InsuranceProductRepository productRepository;
    private final OrganizationRepository organizationRepository;

    @Transactional
    public PolicyEntity activateFromApplication(
            UUID applicationId,
            UUID citizenProfileId,
            UUID productPlanId,
            UUID organizationId,
            java.math.BigDecimal premiumAmount,
            String currency) {
        ProductPlanEntity plan = planRepository.findById(productPlanId)
                .orElseThrow(() -> new NotFoundException("Product plan", productPlanId));

        PolicyEntity policy = new PolicyEntity();
        policy.setPolicyNumber(generatePolicyNumber());
        policy.setApplicationId(applicationId);
        policy.setCitizenProfileId(citizenProfileId);
        policy.setProductPlanId(productPlanId);
        policy.setOrganizationId(organizationId);
        policy.setStatus("PENDING_ACTIVATION");
        policy.setCoverageStartDate(LocalDate.now());
        policy.setCoverageEndDate(LocalDate.now().plusYears(1));
        policy.setPremiumAmount(premiumAmount);
        policy.setCurrency(currency != null ? currency : "RWF");
        policy.setNextBillingDate(LocalDate.now().plusMonths(1));
        policy = policyRepository.save(policy);

        recordEvent(policy.getId(), "CREATED", null);
        return policy;
    }

    @Transactional(readOnly = true)
    public List<PolicySummaryResponse> listCitizenPolicies(UUID userId) {
        CitizenProfileEntity profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Citizen profile", userId));
        return policyRepository.findByCitizenProfileIdOrderByCreatedAtDesc(profile.getId()).stream()
                .map(this::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public PolicyDetailResponse getPolicyDetail(UUID policyId, UUID userId) {
        PolicyEntity policy = getPolicyForCitizen(policyId, userId);
        return toDetail(policy);
    }

    @Transactional(readOnly = true)
    public PolicyCardResponse getPolicyCard(UUID policyId, UUID userId) {
        PolicyEntity policy = getPolicyForCitizen(policyId, userId);
        String productName = resolveProductName(policy.getProductPlanId());
        String insurerName = organizationRepository.findById(policy.getOrganizationId())
                .map(OrganizationEntity::getName)
                .orElse("Unknown");
        String rawToken = issueVerificationToken(policy);

        return PolicyCardResponse.builder()
                .policyNumber(policy.getPolicyNumber())
                .productName(productName)
                .insurerName(insurerName)
                .status(policy.getStatus())
                .validUntil(policy.getCoverageEndDate())
                .verificationToken(rawToken)
                .build();
    }

    private String issueVerificationToken(PolicyEntity policy) {
        if (!"ACTIVE".equals(policy.getStatus())) {
            throw new BadRequestException("Verification tokens can only be issued for active policies");
        }
        String rawToken = UUID.randomUUID().toString().replace("-", "");
        PolicyVerificationTokenEntity tokenEntity = new PolicyVerificationTokenEntity();
        tokenEntity.setPolicyId(policy.getId());
        tokenEntity.setTokenHash(hashToken(rawToken));
        tokenEntity.setExpiresAt(LocalDateTime.now().plusDays(TOKEN_TTL_DAYS));
        tokenEntity.setUsed(false);
        verificationTokenRepository.save(tokenEntity);
        recordEvent(policy.getId(), "UPDATED", null);
        return rawToken;
    }

    private PolicyEntity getPolicyForCitizen(UUID policyId, UUID userId) {
        CitizenProfileEntity profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Citizen profile", userId));
        PolicyEntity policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new NotFoundException("Policy", policyId));
        if (!policy.getCitizenProfileId().equals(profile.getId())) {
            throw new NotFoundException("Policy", policyId);
        }
        return policy;
    }

    private void recordEvent(UUID policyId, String eventType, UUID performedBy) {
        PolicyEventEntity event = new PolicyEventEntity();
        event.setPolicyId(policyId);
        event.setEventType(eventType);
        event.setPerformedBy(performedBy);
        policyEventRepository.save(event);
    }

    private String generatePolicyNumber() {
        return "ING-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    private PolicySummaryResponse toSummary(PolicyEntity policy) {
        return PolicySummaryResponse.builder()
                .id(policy.getId())
                .policyNumber(policy.getPolicyNumber())
                .status(policy.getStatus())
                .productName(resolveProductName(policy.getProductPlanId()))
                .build();
    }

    private PolicyDetailResponse toDetail(PolicyEntity policy) {
        return PolicyDetailResponse.builder()
                .id(policy.getId())
                .policyNumber(policy.getPolicyNumber())
                .status(policy.getStatus())
                .coverageStartDate(policy.getCoverageStartDate())
                .coverageEndDate(policy.getCoverageEndDate())
                .build();
    }

    private String resolveProductName(UUID productPlanId) {
        return planRepository.findById(productPlanId)
                .flatMap(plan -> versionRepository.findById(plan.getProductVersionId()))
                .flatMap(version -> productRepository.findById(version.getProductId()))
                .map(InsuranceProductEntity::getName)
                .orElse("Unknown");
    }
}
