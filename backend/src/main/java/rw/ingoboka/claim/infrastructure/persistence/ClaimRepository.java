package rw.ingoboka.claim.infrastructure.persistence;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClaimRepository extends JpaRepository<ClaimEntity, UUID> {

    Page<ClaimEntity> findByCitizenProfileIdOrderByReportedAtDesc(UUID citizenProfileId, Pageable pageable);

    Page<ClaimEntity> findByOrganizationIdOrderByReportedAtDesc(UUID organizationId, Pageable pageable);

    Page<ClaimEntity> findByOrganizationIdAndStatusOrderByReportedAtDesc(
            UUID organizationId, String status, Pageable pageable);

    Optional<ClaimEntity> findByClaimNumber(String claimNumber);
}
