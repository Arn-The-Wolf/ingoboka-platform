package rw.ingoboka.claim.infrastructure.persistence;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClaimDecisionRepository extends JpaRepository<ClaimDecisionEntity, UUID> {

    Optional<ClaimDecisionEntity> findByClaimId(UUID claimId);
}
