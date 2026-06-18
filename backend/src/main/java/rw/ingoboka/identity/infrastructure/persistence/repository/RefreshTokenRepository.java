package rw.ingoboka.identity.infrastructure.persistence.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.ingoboka.identity.infrastructure.persistence.entity.RefreshTokenEntity;

public interface RefreshTokenRepository extends JpaRepository<RefreshTokenEntity, UUID> {

    Optional<RefreshTokenEntity> findByTokenHash(String tokenHash);

    void deleteByUserId(UUID userId);

    void deleteByUserIdAndRevoked(UUID userId, boolean revoked);
}
