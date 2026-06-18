package rw.ingoboka.policy.infrastructure.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import rw.ingoboka.policy.infrastructure.persistence.entity.PolicyVerificationTokenEntity;

import java.util.Optional;
import java.util.UUID;

public interface PolicyVerificationTokenRepository extends JpaRepository<PolicyVerificationTokenEntity, UUID> {

    Optional<PolicyVerificationTokenEntity> findByTokenHash(String tokenHash);
}
