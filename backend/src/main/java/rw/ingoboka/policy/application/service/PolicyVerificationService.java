package rw.ingoboka.policy.application.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.ingoboka.policy.api.dto.response.PublicVerificationResponse;
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
import rw.ingoboka.shared.infrastructure.persistence.entity.OrganizationEntity;
import rw.ingoboka.shared.infrastructure.persistence.repository.OrganizationRepository;

@Service
@RequiredArgsConstructor
public class PolicyVerificationService {

    private final PolicyVerificationTokenRepository verificationTokenRepository;
    private final PolicyRepository policyRepository;
    private final ProductPlanRepository planRepository;
    private final ProductVersionRepository versionRepository;
    private final InsuranceProductRepository productRepository;
    private final OrganizationRepository organizationRepository;

    @Transactional(readOnly = true)
    public PublicVerificationResponse verify(String token) {
        String tokenHash = hashToken(token);
        PolicyVerificationTokenEntity tokenEntity = verificationTokenRepository.findByTokenHash(tokenHash)
                .orElse(null);

        if (tokenEntity == null || tokenEntity.isUsed()) {
            return invalid();
        }
        if (tokenEntity.getExpiresAt().isBefore(LocalDateTime.now())) {
            return invalid();
        }

        PolicyEntity policy = policyRepository.findById(tokenEntity.getPolicyId()).orElse(null);
        if (policy == null) {
            return invalid();
        }

        String productName = resolveProductName(policy.getProductPlanId());
        String insurerName = organizationRepository.findById(policy.getOrganizationId())
                .map(OrganizationEntity::getName)
                .orElse("Unknown");

        return PublicVerificationResponse.builder()
                .valid("ACTIVE".equals(policy.getStatus()))
                .policyRef(maskPolicyNumber(policy.getPolicyNumber()))
                .productName(productName)
                .insurerName(insurerName)
                .status(policy.getStatus())
                .validUntil(policy.getCoverageEndDate())
                .build();
    }

    private PublicVerificationResponse invalid() {
        return PublicVerificationResponse.builder()
                .valid(false)
                .status("INVALID")
                .build();
    }

    private String maskPolicyNumber(String policyNumber) {
        if (policyNumber == null || policyNumber.length() <= 4) {
            return "****";
        }
        return "****" + policyNumber.substring(policyNumber.length() - 4);
    }

    private String resolveProductName(java.util.UUID productPlanId) {
        return planRepository.findById(productPlanId)
                .flatMap(plan -> versionRepository.findById(plan.getProductVersionId()))
                .flatMap(version -> productRepository.findById(version.getProductId()))
                .map(InsuranceProductEntity::getName)
                .orElse("Unknown");
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
}
