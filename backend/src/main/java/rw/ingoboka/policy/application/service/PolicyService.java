package rw.ingoboka.policy.application.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.ingoboka.customer.infrastructure.persistence.CitizenProfileEntity;
import rw.ingoboka.customer.infrastructure.persistence.CitizenProfileRepository;
import rw.ingoboka.policy.application.dto.ActivatePolicyRequest;
import rw.ingoboka.policy.application.dto.PolicyCardResponse;
import rw.ingoboka.policy.application.dto.PolicyDetailResponse;
import rw.ingoboka.policy.application.dto.PolicySummaryResponse;
import rw.ingoboka.policy.application.dto.VerificationTokenResponse;
import rw.ingoboka.policy.infrastructure.persistence.PolicyEntity;
import rw.ingoboka.policy.infrastructure.persistence.PolicyEntity.PolicyStatus;
import rw.ingoboka.policy.infrastructure.persistence.PolicyEventEntity;
import rw.ingoboka.policy.infrastructure.persistence.PolicyEventEntity.PolicyEventType;
import rw.ingoboka.policy.infrastructure.persistence.PolicyEventRepository;
import rw.ingoboka.policy.infrastructure.persistence.PolicyRepository;
import rw.ingoboka.policy.infrastructure.persistence.PolicyVerificationTokenEntity;
import rw.ingoboka.policy.infrastructure.persistence.PolicyVerificationTokenRepository;
import rw.ingoboka.product.infrastructure.persistence.InsurerEntity;
import rw.ingoboka.product.infrastructure.persistence.InsurerRepository;
import rw.ingoboka.product.infrastructure.persistence.ProductEntity;
import rw.ingoboka.product.infrastructure.persistence.ProductRepository;
import rw.ingoboka.product.infrastructure.persistence.ProductVersionEntity;
import rw.ingoboka.product.infrastructure.persistence.ProductVersionRepository;
import rw.ingoboka.shared.exception.BadRequestException;
import rw.ingoboka.shared.exception.NotFoundException;
import rw.ingoboka.shared.security.SecurityUtils;

@Service
@RequiredArgsConstructor
public class PolicyService {

    private static final int TOKEN_TTL_DAYS = 365;

    private final PolicyRepository policyRepository;
    private final PolicyEventRepository policyEventRepository;
    private final PolicyVerificationTokenRepository verificationTokenRepository;
    private final CitizenProfileRepository citizenProfileRepository;
    private final ProductVersionRepository productVersionRepository;
    private final ProductRepository productRepository;
    private final InsurerRepository insurerRepository;

    @Transactional
    public PolicyDetailResponse activatePolicy(ActivatePolicyRequest request) {
        CitizenProfileEntity profile = citizenProfileRepository.findByUserId(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> new NotFoundException("Citizen profile", SecurityUtils.getCurrentUserId()));

        ProductVersionEntity version = productVersionRepository.findById(request.productVersionId())
                .orElseThrow(() -> new NotFoundException("Product version", request.productVersionId()));
        ProductEntity product = productRepository.findById(version.getProductId())
                .orElseThrow(() -> new NotFoundException("Product", version.getProductId()));
        if (product.getStatus() != ProductEntity.ProductStatus.PUBLISHED) {
            throw new BadRequestException("Product is not published");
        }

        PolicyEntity policy = new PolicyEntity();
        policy.setPolicyNumber(generatePolicyNumber());
        policy.setCitizenProfileId(profile.getId());
        policy.setProductVersionId(version.getId());
        policy.setStatus(PolicyStatus.ACTIVE);
        policy.setEffectiveFrom(request.effectiveFrom());
        policy.setEffectiveTo(request.effectiveTo());
        policy.setPremiumAmount(request.premiumAmount());
        if (request.currency() != null) {
            policy.setCurrency(request.currency());
        }
        policy = policyRepository.save(policy);

        recordEvent(policy.getId(), PolicyEventType.CREATED, "Policy created");
        recordEvent(policy.getId(), PolicyEventType.ACTIVATED, "Policy activated");

        return getPolicyDetail(policy.getId());
    }

    @Transactional(readOnly = true)
    public List<PolicySummaryResponse> listCitizenPolicies() {
        CitizenProfileEntity profile = citizenProfileRepository.findByUserId(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> new NotFoundException("Citizen profile", SecurityUtils.getCurrentUserId()));
        return policyRepository.findByCitizenProfileIdOrderByCreatedAtDesc(profile.getId()).stream()
                .map(this::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public PolicyDetailResponse getPolicyDetail(UUID policyId) {
        PolicyEntity policy = getPolicyForCurrentCitizen(policyId);
        return toDetail(policy);
    }

    @Transactional
    public VerificationTokenResponse generateVerificationToken(UUID policyId) {
        PolicyEntity policy = getPolicyForCurrentCitizen(policyId);
        return issueVerificationToken(policy);
    }

    private VerificationTokenResponse issueVerificationToken(PolicyEntity policy) {
        if (policy.getStatus() != PolicyStatus.ACTIVE) {
            throw new BadRequestException("Verification tokens can only be issued for active policies");
        }

        String rawToken = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
        Instant expiresAt = Instant.now().plus(TOKEN_TTL_DAYS, ChronoUnit.DAYS);

        PolicyVerificationTokenEntity tokenEntity = new PolicyVerificationTokenEntity();
        tokenEntity.setPolicyId(policy.getId());
        tokenEntity.setTokenHash(hashToken(rawToken));
        tokenEntity.setExpiresAt(expiresAt);
        tokenEntity.setRevoked(false);
        verificationTokenRepository.save(tokenEntity);

        recordEvent(policy.getId(), PolicyEventType.VERIFICATION_TOKEN_ISSUED, "Verification token issued");

        String verificationUrl = buildVerificationUrl(rawToken);
        return new VerificationTokenResponse(rawToken, verificationUrl, expiresAt);
    }

    @Transactional
    public PolicyCardResponse getPolicyCard(UUID policyId) {
        PolicyEntity policy = getPolicyForCurrentCitizen(policyId);
        ProductVersionEntity version = productVersionRepository.findById(policy.getProductVersionId())
                .orElseThrow(() -> new NotFoundException("Product version", policy.getProductVersionId()));
        ProductEntity product = productRepository.findById(version.getProductId())
                .orElseThrow(() -> new NotFoundException("Product", version.getProductId()));
        String insurerName = insurerRepository.findById(product.getInsurerId())
                .map(InsurerEntity::getName)
                .orElse("Unknown");

        VerificationTokenResponse token = issueVerificationToken(policy);

        return new PolicyCardResponse(
                policy.getPolicyNumber(),
                product.getName(),
                insurerName,
                policy.getStatus(),
                policy.getEffectiveFrom(),
                policy.getEffectiveTo(),
                token.verificationUrl(),
                token.verificationUrl());
    }

    private PolicyEntity getPolicyForCurrentCitizen(UUID policyId) {
        CitizenProfileEntity profile = citizenProfileRepository.findByUserId(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> new NotFoundException("Citizen profile", SecurityUtils.getCurrentUserId()));
        PolicyEntity policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new NotFoundException("Policy", policyId));
        if (!policy.getCitizenProfileId().equals(profile.getId())) {
            throw new NotFoundException("Policy", policyId);
        }
        return policy;
    }

    private void recordEvent(UUID policyId, PolicyEventType eventType, String description) {
        PolicyEventEntity event = new PolicyEventEntity();
        event.setPolicyId(policyId);
        event.setEventType(eventType);
        event.setDescription(description);
        event.setOccurredAt(Instant.now());
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

    private String buildVerificationUrl(String rawToken) {
        return "/api/v1/public/verify/" + rawToken;
    }

    private PolicySummaryResponse toSummary(PolicyEntity policy) {
        String productName = resolveProductName(policy.getProductVersionId());
        return new PolicySummaryResponse(
                policy.getId(),
                policy.getPolicyNumber(),
                policy.getStatus(),
                policy.getEffectiveFrom(),
                policy.getEffectiveTo(),
                policy.getPremiumAmount(),
                policy.getCurrency(),
                productName,
                policy.getCreatedAt());
    }

    private PolicyDetailResponse toDetail(PolicyEntity policy) {
        ProductVersionEntity version = productVersionRepository.findById(policy.getProductVersionId())
                .orElseThrow(() -> new NotFoundException("Product version", policy.getProductVersionId()));
        ProductEntity product = productRepository.findById(version.getProductId())
                .orElseThrow(() -> new NotFoundException("Product", version.getProductId()));
        String insurerName = insurerRepository.findById(product.getInsurerId())
                .map(InsurerEntity::getName)
                .orElse("Unknown");

        List<PolicyDetailResponse.PolicyEventResponse> events = policyEventRepository
                .findByPolicyIdOrderByOccurredAtDesc(policy.getId()).stream()
                .map(e -> new PolicyDetailResponse.PolicyEventResponse(
                        e.getEventType(),
                        e.getDescription(),
                        e.getOccurredAt()))
                .toList();

        return new PolicyDetailResponse(
                policy.getId(),
                policy.getPolicyNumber(),
                policy.getStatus(),
                policy.getEffectiveFrom(),
                policy.getEffectiveTo(),
                policy.getPremiumAmount(),
                policy.getCurrency(),
                product.getName(),
                insurerName,
                events,
                policy.getCreatedAt());
    }

    private String resolveProductName(UUID productVersionId) {
        return productVersionRepository.findById(productVersionId)
                .flatMap(v -> productRepository.findById(v.getProductId()))
                .map(ProductEntity::getName)
                .orElse("Unknown");
    }
}
