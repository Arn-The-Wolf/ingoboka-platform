package rw.ingoboka.policy.application.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.ingoboka.policy.application.dto.PublicVerificationResponse;
import rw.ingoboka.policy.infrastructure.persistence.PolicyEntity;
import rw.ingoboka.policy.infrastructure.persistence.PolicyEntity.PolicyStatus;
import rw.ingoboka.policy.infrastructure.persistence.PolicyRepository;
import rw.ingoboka.policy.infrastructure.persistence.PolicyVerificationTokenEntity;
import rw.ingoboka.policy.infrastructure.persistence.PolicyVerificationTokenRepository;
import rw.ingoboka.product.infrastructure.persistence.InsurerEntity;
import rw.ingoboka.product.infrastructure.persistence.InsurerRepository;
import rw.ingoboka.product.infrastructure.persistence.ProductEntity;
import rw.ingoboka.product.infrastructure.persistence.ProductRepository;
import rw.ingoboka.product.infrastructure.persistence.ProductVersionEntity;
import rw.ingoboka.product.infrastructure.persistence.ProductVersionRepository;

@Service
@RequiredArgsConstructor
public class PolicyVerificationService {

    private final PolicyVerificationTokenRepository verificationTokenRepository;
    private final PolicyRepository policyRepository;
    private final ProductVersionRepository productVersionRepository;
    private final ProductRepository productRepository;
    private final InsurerRepository insurerRepository;

    @Transactional(readOnly = true)
    public PublicVerificationResponse verify(String token) {
        String tokenHash = hashToken(token);
        PolicyVerificationTokenEntity tokenEntity = verificationTokenRepository
                .findByTokenHashAndRevokedFalse(tokenHash)
                .orElse(null);

        if (tokenEntity == null) {
            return invalid("Verification token not found");
        }
        if (tokenEntity.getExpiresAt().isBefore(Instant.now())) {
            return invalid("Verification token has expired");
        }

        PolicyEntity policy = policyRepository.findById(tokenEntity.getPolicyId()).orElse(null);
        if (policy == null) {
            return invalid("Policy not found");
        }

        ProductVersionEntity version = productVersionRepository.findById(policy.getProductVersionId()).orElse(null);
        ProductEntity product = version != null
                ? productRepository.findById(version.getProductId()).orElse(null)
                : null;
        String productName = product != null ? product.getName() : "Unknown";
        String insurerName = product != null
                ? insurerRepository.findById(product.getInsurerId()).map(InsurerEntity::getName).orElse("Unknown")
                : "Unknown";

        return new PublicVerificationResponse(
                policy.getStatus() == PolicyStatus.ACTIVE,
                maskPolicyNumber(policy.getPolicyNumber()),
                productName,
                insurerName,
                policy.getStatus(),
                policy.getEffectiveFrom(),
                policy.getEffectiveTo(),
                Instant.now(),
                policy.getStatus() == PolicyStatus.ACTIVE ? "Policy is active" : "Policy is not active");
    }

    private PublicVerificationResponse invalid(String message) {
        return new PublicVerificationResponse(
                false,
                null,
                null,
                null,
                null,
                null,
                null,
                Instant.now(),
                message);
    }

    private String maskPolicyNumber(String policyNumber) {
        if (policyNumber == null || policyNumber.length() <= 4) {
            return "****";
        }
        return "****" + policyNumber.substring(policyNumber.length() - 4);
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
