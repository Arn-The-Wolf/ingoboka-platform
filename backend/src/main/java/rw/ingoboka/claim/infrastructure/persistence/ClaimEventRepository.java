package rw.ingoboka.claim.infrastructure.persistence;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClaimEventRepository extends JpaRepository<ClaimEventEntity, UUID> {

    List<ClaimEventEntity> findByClaimIdOrderByOccurredAtDesc(UUID claimId);
}
