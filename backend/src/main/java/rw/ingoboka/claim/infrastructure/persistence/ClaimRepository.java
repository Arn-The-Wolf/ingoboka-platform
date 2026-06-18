package rw.ingoboka.claim.infrastructure.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClaimRepository extends JpaRepository<ClaimEntity, UUID> {

    List<ClaimEntity> findByCitizenProfileIdOrderByReportedAtDesc(UUID citizenProfileId);

    List<ClaimEntity> findByStatusOrderByReportedAtAsc(ClaimEntity.ClaimStatus status);

    Optional<ClaimEntity> findByClaimNumber(String claimNumber);
}
