package rw.ingoboka.claim.infrastructure.persistence;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClaimStatusHistoryRepository extends JpaRepository<ClaimStatusHistoryEntity, UUID> {
}
