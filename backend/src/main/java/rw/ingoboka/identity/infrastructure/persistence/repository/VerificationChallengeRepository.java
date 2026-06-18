package rw.ingoboka.identity.infrastructure.persistence.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.ingoboka.identity.domain.model.ChallengeType;
import rw.ingoboka.identity.infrastructure.persistence.entity.VerificationChallengeEntity;

public interface VerificationChallengeRepository extends JpaRepository<VerificationChallengeEntity, UUID> {

    Optional<VerificationChallengeEntity> findByUserIdAndTypeAndUsedFalseAndExpiresAtAfter(
            UUID userId, ChallengeType type, LocalDateTime now);

    List<VerificationChallengeEntity> findByUserIdAndTypeAndUsedFalse(UUID userId, ChallengeType type);
}
