package rw.ingoboka.shared.infrastructure.idempotency;

import java.time.Instant;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IdempotencyKeyRepository extends JpaRepository<IdempotencyKeyEntity, java.util.UUID> {

    Optional<IdempotencyKeyEntity> findByKeyAndExpiresAtAfter(String key, Instant now);
}
